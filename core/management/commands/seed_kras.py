import os
import openpyxl
from django.core.management.base import BaseCommand
from core.models import Department, AccreditationCriteria, KRAMetric
from django.db import transaction

class Command(BaseCommand):
    help = 'Seeds KRA Metrics correctly from KSOP sheet'

    def handle(self, *args, **kwargs):
        from django.conf import settings
        file_path = os.path.join(settings.BASE_DIR, 'kra-refrences', 'KIET_KRA_Monthly_Dept_Wise_Achievement_Tracker.xlsx')
        if not os.path.exists(file_path):
            file_path = r"C:\Users\Lenovo\Desktop\KIET KRA\kra-refrences\KIET_KRA_Monthly_Dept_Wise_Achievement_Tracker.xlsx"
        
        if not os.path.exists(file_path):
            self.stdout.write(self.style.ERROR(f"File not found: {file_path}"))
            return

        wb = openpyxl.load_workbook(file_path, data_only=True)
        
        # Clear existing wrong KRAs to start fresh
        with transaction.atomic():
            KRAMetric.objects.all().delete()
        
        # Use KSOP sheet which has all KRAs
        sheet = None
        if "KSOP" in wb.sheetnames:
            sheet = wb["KSOP"]
        else:
            # Fallback to the second sheet if KSOP isn't found (assuming first is instructions)
            sheet = wb.worksheets[1]

        added_count = 0
        for r_idx, row in enumerate(sheet.iter_rows(values_only=True)):
            if r_idx < 3: # Skip headers
                continue
            
            if not row or row[0] is None:
                continue
                
            s_no_raw = str(row[0]).strip()
            
            # Stop if we hit something that isn't a number
            if not s_no_raw.replace('.', '', 1).isdigit():
                continue
                
            nba_ref = str(row[1]).strip() if row[1] else ""
            naac_ref = str(row[2]).strip() if row[2] else ""
            activity = str(row[3]).strip() if row[3] else ""
            target = str(row[4]).strip() if row[4] else ""
            
            if activity:
                # Extract the "KRA X" part as serial_number, e.g. "KRA 1"
                serial_num = f"KRA {int(float(s_no_raw))}"
                
                # Create Criteria
                criteria, _ = AccreditationCriteria.objects.get_or_create(
                    nba_code=nba_ref,
                    naac_code=naac_ref
                )
                
                # Determine target type
                t_type = 'Numeric'
                if '%' in target or 'Percentage' in target:
                    t_type = 'Percentage'
                elif 'Yes' in target or 'No' in target or 'Status' in target:
                    t_type = 'Boolean'
                
                # Create KRA
                KRAMetric.objects.create(
                    serial_number=serial_num,
                    activity_description=activity,
                    target_type=t_type,
                    annual_target=target,
                    criteria=criteria
                )
                added_count += 1

        self.stdout.write(self.style.SUCCESS(f"Successfully seeded {added_count} KRA Metrics!"))
