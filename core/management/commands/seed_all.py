import datetime
from django.core.management.base import BaseCommand
from django.core.management import call_command
from core.models import Department
from accounts.models import User
from tracker.models import BiMonthlyCycle

DEPARTMENTS = [
    {'name': 'CSE', 'faculty_strength': 65, 'student_strength': 1200},
    {'name': 'CSE (AI)', 'faculty_strength': 30, 'student_strength': 500},
    {'name': 'CSE (AIML)', 'faculty_strength': 35, 'student_strength': 600},
    {'name': 'IT', 'faculty_strength': 42, 'student_strength': 800},
    {'name': 'CS', 'faculty_strength': 28, 'student_strength': 450},
    {'name': 'CSIT', 'faculty_strength': 26, 'student_strength': 420},
    {'name': 'EEE', 'faculty_strength': 32, 'student_strength': 550},
    {'name': 'ECE', 'faculty_strength': 45, 'student_strength': 900},
    {'name': 'ME', 'faculty_strength': 38, 'student_strength': 700},
    {'name': 'KSOM', 'faculty_strength': 24, 'student_strength': 360},
    {'name': 'MCA', 'faculty_strength': 20, 'student_strength': 300},
    {'name': 'KSOP', 'faculty_strength': 30, 'student_strength': 480},
    {'name': 'ASH', 'faculty_strength': 52, 'student_strength': 1400},
]

CYCLES = [
    ('JUL-AUG', 'July - August', datetime.date(2026, 8, 31)),
    ('SEP-OCT', 'September - October', datetime.date(2026, 10, 31)),
    ('NOV-DEC', 'November - December', datetime.date(2026, 12, 31)),
    ('JAN-FEB', 'January - February', datetime.date(2027, 2, 28)),
    ('MAR-APR', 'March - April', datetime.date(2027, 4, 30)),
    ('MAY-JUN', 'May - June', datetime.date(2027, 6, 30)),
]

class Command(BaseCommand):
    help = 'Seeds departments, cycles, default users, and KRA metrics'

    def handle(self, *args, **options):
        self.stdout.write("Seeding KRA Metrics...")
        call_command('seed_kras')

        self.stdout.write("Seeding Departments...")
        for dept_data in DEPARTMENTS:
            dept, created = Department.objects.get_or_create(
                name=dept_data['name'],
                defaults={
                    'faculty_strength': dept_data['faculty_strength'],
                    'student_strength': dept_data['student_strength']
                }
            )
            if created:
                self.stdout.write(f"Created dept {dept.name}")

        self.stdout.write("Seeding BiMonthly Cycles...")
        for cycle_code, cycle_name, deadline in CYCLES:
            cycle, created = BiMonthlyCycle.objects.get_or_create(
                academic_year='2026-2027',
                cycle_name=cycle_code,
                defaults={'deadline': deadline, 'is_active': True}
            )
            if created:
                self.stdout.write(f"Created cycle {cycle_name}")

        self.stdout.write("Seeding Default Users...")
        # Super admin
        if not User.objects.filter(username='admin').exists():
            admin = User.objects.create_superuser(
                username='admin',
                email='admin@kiet.edu',
                password='adminpassword123',
                role='SUPER_ADMIN'
            )
            self.stdout.write("Created Super Admin (admin / adminpassword123)")

        # VC user
        if not User.objects.filter(username='vc').exists():
            vc = User.objects.create_user(
                username='vc',
                email='vc@kiet.edu',
                password='vcpassword123',
                role='SUPER_ADMIN'
            )
            self.stdout.write("Created VC user (vc / vcpassword123)")

        # Dean user for CSE
        cse_dept = Department.objects.filter(name='CSE').first()
        if not User.objects.filter(username='dean_cse').exists():
            dean = User.objects.create_user(
                username='dean_cse',
                email='dean.cse@kiet.edu',
                password='deanpassword123',
                role='DEAN',
                department=cse_dept
            )
            self.stdout.write("Created Dean user (dean_cse / deanpassword123)")

        self.stdout.write(self.style.SUCCESS("All initial seed data created successfully!"))
