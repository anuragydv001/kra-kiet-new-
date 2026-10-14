from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from django.db.models import Count, Q
from django.utils import timezone
from django.http import HttpResponse
from core.models import Department
from accounts.models import User
from .models import Achievement, BiMonthlyCycle, Evidence, CycleException
from .serializers import AchievementSerializer, BiMonthlyCycleSerializer

class BiMonthlyCycleViewSet(viewsets.ReadOnlyModelViewSet):
    """ Allows frontend to fetch active academic cycles and deadlines. """
    queryset = BiMonthlyCycle.objects.filter(is_active=True)
    serializer_class = BiMonthlyCycleSerializer
    permission_classes = [AllowAny]

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        """ Dean submits the cycle. Flips DRAFT/REJECTED to SUBMITTED. """
        cycle = self.get_object()
        user = request.user
        
        if getattr(user, 'role', '') != 'DEAN' or not user.department:
            return Response({"error": "Only Deans can submit cycles."}, status=status.HTTP_403_FORBIDDEN)
            
        # Find all Draft or Rejected achievements for this cycle and department
        achievements = Achievement.objects.filter(
            cycle=cycle,
            department=user.department,
            status__in=['DRAFT', 'REJECTED']
        )
        
        if not achievements.exists():
            return Response({"message": "No pending KRAs found to submit."}, status=status.HTTP_400_BAD_REQUEST)
            
        achievements.update(status='SUBMITTED')
        return Response({"message": f"Successfully submitted {achievements.count()} KRAs for {cycle.cycle_name}."}, status=status.HTTP_200_OK)

from accounts.permissions import IsOwnerDepartmentOrReadOnly

class AchievementViewSet(viewsets.ModelViewSet):
    """ Core CRUD endpoint for Deans to submit their KRA data. """
    serializer_class = AchievementSerializer
    permission_classes = [AllowAny]

    def _check_window_open(self, cycle, department):
        today = timezone.now().date()
        if today <= cycle.deadline:
            return True
        # Check if an exception exists for this department or all departments
        exception = CycleException.objects.filter(
            cycle=cycle, 
            open_until__gte=today
        ).filter(Q(department=department) | Q(department__isnull=True)).exists()
        
        if not exception:
            raise PermissionDenied("The submission window for this cycle has closed.")

    def get_queryset(self):
        user = self.request.user
        qs = Achievement.objects.select_related('department', 'kra_metric', 'cycle').prefetch_related('evidence')
        if user and user.is_authenticated and getattr(user, 'role', '') == 'DEAN' and getattr(user, 'department', None):
            return qs.filter(department=user.department)
        return qs.all()

    def perform_create(self, serializer):
        user = self.request.user if (self.request.user and self.request.user.is_authenticated) else None
        dept = getattr(user, 'department', None) if user else None
        if not dept:
            dept = Department.objects.first()
        status_val = serializer.validated_data.get('status', 'DRAFT')
        if status_val not in ['DRAFT', 'SUBMITTED']:
            status_val = 'DRAFT'

        serializer.save(
            department=dept, 
            submitted_by=user,
            status=status_val
        )

    def perform_update(self, serializer):
        user = self.request.user
        if user and user.is_authenticated and getattr(user, 'role', '') != 'SUPER_ADMIN':
            if getattr(user, 'department', None):
                self._check_window_open(serializer.instance.cycle, user.department)
            new_status = serializer.validated_data.get('status')
            if new_status and new_status not in ['DRAFT', 'SUBMITTED']:
                serializer.validated_data.pop('status')
        serializer.save()

    @action(detail=False, methods=['post'])
    def upsert(self, request):
        """ Dean or Admin upserts an achievement with full custom_data. """
        user = request.user if (request.user and request.user.is_authenticated) else None
        dept_name = request.data.get('department') or request.data.get('dept')
        department = getattr(user, 'department', None) if user else None
        if not department and dept_name:
            department = Department.objects.filter(Q(name__iexact=str(dept_name)) | Q(name__icontains=str(dept_name))).first()
        if not department:
            department = Department.objects.first()
        if not user:
            user = User.objects.filter(department=department).first() or User.objects.filter(role='SUPER_ADMIN').first()
        
        kra_code_raw = str(request.data.get('kra_code', ''))
        cycle_raw = str(request.data.get('cycle', ''))
        status_raw = str(request.data.get('status', 'DRAFT')).upper()
        if status_raw not in ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED']:
            status_raw = 'DRAFT'
        if user and getattr(user, 'role', '') != 'SUPER_ADMIN' and status_raw not in ['DRAFT', 'SUBMITTED']:
            status_raw = 'DRAFT'

        custom_data = request.data.get('custom_data', {})
        remarks = request.data.get('remarks', '')
        numeric_value = request.data.get('numeric_value', None)

        # Match KRA Metric by numeric id in serial_number
        import re
        m = re.search(r'(\d+)', kra_code_raw)
        if not m:
            return Response({"error": f"Invalid KRA identifier: {kra_code_raw}"}, status=status.HTTP_400_BAD_REQUEST)
        kra_num = m.group(1)
        kra = KRAMetric.objects.filter(serial_number__iexact=f"KRA {kra_num}").first()
        if not kra:
            kra = KRAMetric.objects.filter(serial_number__icontains=kra_num).first()
        if not kra:
            return Response({"error": f"KRA {kra_num} not found in database."}, status=status.HTTP_404_NOT_FOUND)

        # Match Cycle
        cycle_map = {
            'JULY - AUGUST': 'JUL-AUG',
            'SEPTEMBER - OCTOBER': 'SEP-OCT',
            'NOVEMBER - DECEMBER': 'NOV-DEC',
            'JANUARY - FEBRUARY': 'JAN-FEB',
            'MARCH - APRIL': 'MAR-APR',
            'MAY - JUNE': 'MAY-JUN',
        }
        mapped_cycle_name = cycle_map.get(cycle_raw.strip().upper(), cycle_raw.strip().upper())
        cycle = BiMonthlyCycle.objects.filter(
            Q(cycle_name__iexact=mapped_cycle_name) | Q(cycle_name__iexact=cycle_raw.strip())
        ).order_by('-academic_year').first()
        
        if not cycle:
            cycle = BiMonthlyCycle.objects.filter(is_active=True).first() or BiMonthlyCycle.objects.first()
        
        if not cycle:
            return Response({"error": "No academic cycles found."}, status=status.HTTP_400_BAD_REQUEST)

        # Check deadline
        if getattr(user, 'role', '') != 'SUPER_ADMIN':
            self._check_window_open(cycle, department)

        achievement, created = Achievement.objects.get_or_create(
            department=department,
            kra_metric=kra,
            cycle=cycle,
            defaults={
                'status': status_raw,
                'custom_data': custom_data,
                'remarks': remarks,
                'numeric_value': numeric_value,
                'submitted_by': user
            }
        )

        if not created:
            achievement.custom_data = custom_data
            achievement.status = status_raw
            if remarks:
                achievement.remarks = remarks
            if numeric_value is not None:
                achievement.numeric_value = numeric_value
            achievement.submitted_by = user
            achievement.save()

        serializer = self.get_serializer(achievement)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

from django.http import HttpResponse
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
import io

from .pdf_templates import TEMPLATE_REGISTRY, CountBasedTemplate

from django.template.loader import render_to_string
from xhtml2pdf import pisa
import io

from tracker.vac_reports import generate_vac_docx, SUPPORTING_DOCS_LIST
from tracker.kra7_reports import generate_kra7_docx
from .models import UploadedEvidenceFile
from core.models import KRAMetric

class TemplatePreviewView(APIView):
    ''' Receives live JSON form data from the Split-Screen UI and returns a generated PDF using the HTML-to-PDF Engine. '''
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        json_data = request.data
        achievement_id = json_data.get('achievement_id')
        kra_code = str(json_data.get('kraCode', 'KRA 1')).upper()
        
        # Determine the HTML template based on the kra_code
        if '1' in kra_code and not any(x in kra_code for x in ['10', '11', '12', '13', '14', '15', '16', '17', '18', '19']):
            template_path = 'tracker/vac_report_official.html'
        elif kra_code == 'KRA-11':
            template_path = 'tracker/kra_11_report.html'
        elif kra_code == 'KRA-12':
            template_path = 'tracker/kra_12_template.html'
        else:
            template_path = 'tracker/vac_report_official.html'
        
        if achievement_id:
            try:
                achievement = Achievement.objects.get(id=achievement_id, department=request.user.department)
                evidence, created = Evidence.objects.get_or_create(achievement=achievement)
                evidence.document_data = json_data
                evidence.save()
            except Achievement.DoesNotExist:
                pass

        # Context injection for the HTML template
        context = {
            'department': json_data.get('currentDept', json_data.get('department', 'Unknown Dept')),
            'cycle': json_data.get('selectedCycle', json_data.get('cycle', 'Unknown Cycle')),
            'supportingDocsList': SUPPORTING_DOCS_LIST,
            **json_data
        }
        
        html_string = render_to_string(template_path, context)
        
        buffer = io.BytesIO()
        pisa_status = pisa.CreatePDF(html_string, dest=buffer)
        
        if pisa_status.err:
            return Response({'error': 'PDF generation failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        buffer.seek(0)
        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = 'inline; filename="live_preview.pdf"'
        return response

class VACReportExportPDFView(APIView):
    """ Downloads the official 3-page PDF for the Value Added Courses report. """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        data = request.data
        user = request.user if (request.user and request.user.is_authenticated) else None
        dept_name = data.get('department') or (user.department.name if user and getattr(user, 'department', None) else 'CSE')
        faculty_coord = data.get('facultyCoordinator') or (user.get_full_name() or user.username if user else 'Faculty Coordinator')
        context = {
            'department': dept_name,
            'academicSession': data.get('academicSession', '2026-2027'),
            'semester': data.get('semester', ''),
            'facultyCoordinator': faculty_coord,
            'hodName': data.get('hodName', ''),
            'courses': data.get('courses', []),
            'syllabus': data.get('syllabus', []),
            'learningOutcomes': data.get('learningOutcomes', []),
            'assessment': data.get('assessment', {}),
            'outcomeAndImpact': data.get('outcomeAndImpact', {}),
            'feedback': data.get('feedback', {}),
            'preparedBy': data.get('preparedBy', {}),
            'approvedBy': data.get('approvedBy', {}),
            'supportingDocuments': data.get('supportingDocuments', []),
            'supportingDocsList': SUPPORTING_DOCS_LIST
        }
        
        html_string = render_to_string('tracker/vac_report_official.html', context)
        buffer = io.BytesIO()
        pisa_status = pisa.CreatePDF(html_string, dest=buffer)
        
        if pisa_status.err:
            return Response({'error': 'PDF generation failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        buffer.seek(0)
        dept_slug = context['department'].replace(' ', '_')
        filename = f"KIET_VAC_Report_{dept_slug}.pdf"
        response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response

class VACReportExportDOCXView(APIView):
    """ Downloads the official editable Microsoft Word (.docx) document for the Value Added Courses report. """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        data = request.data
        user = request.user if (request.user and request.user.is_authenticated) else None
        if not data.get('department'):
            data['department'] = user.department.name if user and getattr(user, 'department', None) else 'CSE'
        if not data.get('facultyCoordinator'):
            data['facultyCoordinator'] = (user.get_full_name() or user.username) if user else 'Faculty Coordinator'

        buffer = generate_vac_docx(data)
        dept_slug = (data.get('department') or 'KRA').replace(' ', '_')
        filename = f"KIET_VAC_Report_{dept_slug}.docx"
        response = HttpResponse(
            buffer.getvalue(),
            content_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        )
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response

class KRA7ReportExportDOCXView(APIView):
    """ Downloads the official editable Microsoft Word (.docx) document for KRA 7 Curriculum Feedback. """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        data = request.data
        user = request.user if (request.user and request.user.is_authenticated) else None
        if not data.get('department'):
            data['department'] = user.department.name if user and getattr(user, 'department', None) else 'CSE'
        if not data.get('facultyName'):
            data['facultyName'] = (user.get_full_name() or user.username) if user else 'Faculty Member'

        buffer = generate_kra7_docx(data)
        dept_slug = (data.get('department') or 'KRA7').replace(' ', '_')
        filename = f"KRA_7_Curriculum_Feedback_Faculty_{dept_slug}.docx"
        response = HttpResponse(
            buffer.getvalue(),
            content_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        )
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response

class KRA7ReportExportPDFView(APIView):
    """ Downloads the official 2-page PDF for KRA 7 Curriculum Feedback. """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        data = request.data
        user = request.user if (request.user and request.user.is_authenticated) else None
        department = data.get('department') or (user.department.name if user and getattr(user, 'department', None) else 'CSE')
        faculty_name = data.get('facultyName') or ((user.get_full_name() or user.username) if user else 'Faculty Member')

        ratings = data.get('ratings', {})
        survey_statements = [
            (1, "Curriculum is designed as per current industry need and OBE practices."),
            (2, "Curriculum has good balance between theory and practical courses."),
            (3, "The Curriculum enhanced employability"),
            (4, "The course content fulfils the need of students"),
            (5, "Syllabus has made me interested in the subject area"),
            (6, "The books prescribed/listed as reference materials are relevant, updated and appropriate."),
            (7, "Freedom to propose, modify, suggest and incorporate new topics in the syllabus."),
            (8, "The course content of the subjects increased my knowledge and perspective"),
            (9, "The laboratory experiments enhance understanding of theory concepts and enabled the students to relate with the real life problems."),
            (10, "Institute provides adequate funding, resources and support to faculty members for upgrading their skills and qualifications."),
        ]

        q_page1 = []
        for q_id, stmt in survey_statements[:6]:
            r_val = ratings.get(q_id) if q_id in ratings else ratings.get(str(q_id))
            q_page1.append({'id': q_id, 'statement': stmt, 'rating': int(r_val) if r_val else None})

        q_page2 = []
        for q_id, stmt in survey_statements[6:]:
            r_val = ratings.get(q_id) if q_id in ratings else ratings.get(str(q_id))
            q_page2.append({'id': q_id, 'statement': stmt, 'rating': int(r_val) if r_val else None})

        context = {
            'department': department,
            'facultyName': faculty_name,
            'designation': data.get('designation', 'Professor & Dean'),
            'email': data.get('email', request.user.email),
            'mobileNumber': data.get('mobileNumber', ''),
            'academicYear': data.get('academicYear', '2026-2027'),
            'semester': data.get('semester', ''),
            'subject': data.get('subject', ''),
            'questions_page1': q_page1,
            'questions_page2': q_page2,
            'rating_scale_10': list(range(1, 11)),
            'overallSatisfaction': int(data.get('overallSatisfaction')) if data.get('overallSatisfaction') else None,
            'suggestions': data.get('suggestions', ''),
            'signatureName': data.get('signatureName') or faculty_name,
            'signatureDate': data.get('signatureDate', '')
        }

        html_string = render_to_string('tracker/kra_7_report_official.html', context)
        buffer = io.BytesIO()
        pisa_status = pisa.CreatePDF(html_string, dest=buffer)

        if pisa_status.err:
            return Response({'error': 'PDF generation failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        buffer.seek(0)
        dept_slug = department.replace(' ', '_') if department else 'KRA7'
        filename = f"KRA_7_Curriculum_Feedback_Faculty_{dept_slug}.pdf"
        response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response

class EvidenceFileUploadView(APIView):
    """ Secure endpoint for uploading and managing KRA evidence files. """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({"error": "No file attached."}, status=status.HTTP_400_BAD_REQUEST)

        # 10 MB size limit
        if file_obj.size > 10 * 1024 * 1024:
            return Response({"error": "File size exceeds 10MB limit."}, status=status.HTTP_400_BAD_REQUEST)

        import os
        _, ext = os.path.splitext(file_obj.name)
        allowed_exts = ['.pdf', '.docx', '.doc', '.jpg', '.jpeg', '.png', '.xlsx', '.xls']
        if ext.lower() not in allowed_exts:
            return Response({"error": f"File type {ext} not permitted. Allowed: {', '.join(allowed_exts)}"}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user if (request.user and request.user.is_authenticated) else None
        department = getattr(user, 'department', None) if user else None
        dept_raw = request.data.get('department') or request.data.get('dept')
        if not department and dept_raw:
            department = Department.objects.filter(Q(name__iexact=str(dept_raw)) | Q(name__icontains=str(dept_raw))).first()
        if not department:
            department = Department.objects.first()
        kra_code_raw = request.data.get('kra_code', 'KRA 1')
        doc_type = request.data.get('document_type', 'Supporting Evidence')

        import re
        m = re.search(r'(\d+)', str(kra_code_raw))
        kra_num = m.group(1) if m else '1'
        kra = KRAMetric.objects.filter(serial_number__icontains=kra_num).first()
        cycle = BiMonthlyCycle.objects.filter(is_active=True).first() or BiMonthlyCycle.objects.first()

        if not department or not kra or not cycle:
            return Response({"error": "Department, KRA, or active Cycle not found."}, status=status.HTTP_400_BAD_REQUEST)

        achievement, _ = Achievement.objects.get_or_create(
            department=department,
            kra_metric=kra,
            cycle=cycle,
            defaults={'submitted_by': user}
        )

        # Replace existing file of this document_type if exists
        UploadedEvidenceFile.objects.filter(achievement=achievement, document_type=doc_type).delete()

        uploaded = UploadedEvidenceFile.objects.create(
            achievement=achievement,
            document_type=doc_type,
            file=file_obj,
            filename=file_obj.name,
            file_size_kb=round(file_obj.size / 1024, 1),
            uploaded_by=user
        )

        return Response({
            "id": uploaded.id,
            "filename": uploaded.filename,
            "file_url": uploaded.file.url,
            "file_size_kb": uploaded.file_size_kb,
            "document_type": uploaded.document_type
        }, status=status.HTTP_201_CREATED)

    def delete(self, request, pk=None):
        try:
            uploaded = UploadedEvidenceFile.objects.get(id=pk)
            user = request.user
            if getattr(user, 'role', '') != 'SUPER_ADMIN' and uploaded.achievement.department != getattr(user, 'department', None):
                return Response({"error": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)
            uploaded.delete()
            return Response({"message": "File removed successfully."}, status=status.HTTP_200_OK)
        except UploadedEvidenceFile.DoesNotExist:
            return Response({"error": "File not found."}, status=status.HTTP_404_NOT_FOUND)


from .tasks import export_evidence_zip

class ExportEvidenceView(APIView):
    """ Triggers a Celery task to generate a mass ZIP export and returns the task ID. """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        department_id = request.data.get('department_id')
        cycle_id = request.data.get('cycle_id')
        
        if getattr(user, 'role', '') != 'SUPER_ADMIN':
            if not department_id or str(department_id) != str(user.department.id):
                return Response({"error": "Deans can only export their own department."}, status=status.HTTP_403_FORBIDDEN)
                
        # Trigger Celery Task
        task = export_evidence_zip.delay(department_id, cycle_id)
        
        return Response({"message": "Export started", "task_id": task.id}, status=status.HTTP_202_ACCEPTED)

class DashboardStatsView(APIView):
    """ Aggregates institutional KRA data for the Super Admin Dashboard charts. """
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        if getattr(request.user, 'role', '') != 'SUPER_ADMIN':
            return Response({"error": "Unauthorized. Super Admin access required."}, status=status.HTTP_403_FORBIDDEN)
            
        total_achievements = Achievement.objects.count()
        approved_achievements = Achievement.objects.filter(status='APPROVED').count()
        pending_achievements = Achievement.objects.exclude(status='APPROVED').count()
        
        dept_stats = []
        departments = Department.objects.all()
        for dept in departments:
            dept_total = Achievement.objects.filter(department=dept).count()
            dept_approved = Achievement.objects.filter(department=dept, status='APPROVED').count()
            completion_rate = (dept_approved / dept_total * 100) if dept_total > 0 else 0
            
            dept_stats.append({
                "department": dept.name,
                "total_submissions": dept_total,
                "approved": dept_approved,
                "completion_percentage": round(completion_rate, 2)
            })

        return Response({
            "institutional_overview": {
                "total_kra_submissions": total_achievements,
                "total_approved": approved_achievements,
                "total_pending": pending_achievements,
                "overall_completion_rate": round((approved_achievements / total_achievements * 100), 2) if total_achievements > 0 else 0
            },
            "department_breakdown": dept_stats
        }, status=status.HTTP_200_OK)
