from celery import shared_task
from django.core.mail import send_mail
from django.utils import timezone
from datetime import timedelta
from .models import BiMonthlyCycle, Achievement
from django.contrib.auth import get_user_model

User = get_user_model()

@shared_task
def send_deadline_reminders():
    """
    Checks if any BiMonthlyCycle deadline is exactly 5 days away.
    If so, emails the Deans who have pending KRAs.
    """
    target_date = timezone.now().date() + timedelta(days=5)
    
    # Find cycles closing in exactly 5 days
    upcoming_cycles = BiMonthlyCycle.objects.filter(deadline=target_date, is_active=True)
    
    for cycle in upcoming_cycles:
        # Find all pending achievements for this cycle
        pending_achievements = Achievement.objects.filter(cycle=cycle).exclude(status='Approved')
        
        # Collect Deans of the departments that still have pending work
        departments_pending = pending_achievements.values_list('department', flat=True).distinct()
        
        users_to_email = User.objects.filter(department__in=departments_pending, role='DEAN')
        email_list = [user.email for user in users_to_email if user.email]
        
        if email_list:
            send_mail(
                subject=f"URGENT: KRA Deadline Reminder ({cycle.cycle_name})",
                message=f"This is an automated reminder. The deadline for the {cycle.cycle_name} cycle is in 5 days ({cycle.deadline}). Please login to the Intranet Portal and ensure all evidence is submitted.",
                from_email="admin@kiet.edu",
                recipient_list=email_list,
                fail_silently=True,
            )
            
import zipfile
import io
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from .pdf_templates import TEMPLATE_REGISTRY, CountBasedTemplate

@shared_task
def export_evidence_zip(department_id=None, cycle_id=None):
    """
    Generates a massive ZIP file of all approved PDFs for a department or the whole college.
    """
    achievements = Achievement.objects.filter(status='APPROVED').select_related('department', 'kra_metric', 'cycle')
    
    if department_id:
        achievements = achievements.filter(department_id=department_id)
    if cycle_id:
        achievements = achievements.filter(cycle_id=cycle_id)
        
    zip_buffer = io.BytesIO()
    
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        for ach in achievements:
            evidence = ach.evidence.first()
            if not evidence:
                continue
                
            json_data = evidence.document_data
            template_key = json_data.get('template_key', 'count_based')
            
            TemplateClass = TEMPLATE_REGISTRY.get(template_key, CountBasedTemplate)
            pdf_buffer = io.BytesIO()
            renderer = TemplateClass(pdf_buffer)
            renderer.render(json_data)
            
            filename = f"{ach.department.name}_{ach.cycle.cycle_name}_{ach.kra_metric.serial_number}.pdf"
            zip_file.writestr(filename, pdf_buffer.getvalue())
            
    # Save the ZIP file
    file_name = f"exports/kra_export_{timezone.now().strftime('%Y%m%d%H%M%S')}.zip"
    saved_path = default_storage.save(file_name, ContentFile(zip_buffer.getvalue()))
    return default_storage.url(saved_path)
