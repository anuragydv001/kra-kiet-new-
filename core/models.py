from django.db import models

class Department(models.Model):
    name = models.CharField(max_length=100, unique=True)
    faculty_strength = models.PositiveIntegerField(default=1)
    student_strength = models.PositiveIntegerField(default=1)

    def __str__(self):
        return self.name

class AccreditationCriteria(models.Model):
    nba_code = models.CharField(max_length=50, blank=True, null=True)
    naac_code = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        return f"NBA: {self.nba_code} / NAAC: {self.naac_code}"

class KRAMetric(models.Model):
    TARGET_TYPES = (
        ('Numeric', 'Numeric'),
        ('Percentage', 'Percentage'),
        ('Boolean', 'Boolean'),
    )

    serial_number = models.CharField(max_length=50, unique=True)
    activity_description = models.TextField()
    target_type = models.CharField(max_length=20, choices=TARGET_TYPES)
    annual_target = models.CharField(max_length=100)
    criteria = models.ForeignKey(AccreditationCriteria, on_delete=models.CASCADE, related_name='metrics')

    def __str__(self):
        return f"{self.serial_number} - {self.activity_description[:30]}"

class ExtraTarget(models.Model):
    GROUP_CHOICES = (
        ('RESEARCH', 'Research Publication'),
        ('FYP', 'Final Year Project'),
        ('MTECH', 'M.Tech'),
    )
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='extra_targets')
    group = models.CharField(max_length=20, choices=GROUP_CHOICES)
    label = models.CharField(max_length=100)
    target = models.CharField(max_length=100)
    achieved = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"{self.department.name} - {self.label}"
