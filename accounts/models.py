from django.db import models
from django.contrib.auth.models import AbstractUser
from core.models import Department

class User(AbstractUser):
    ROLE_CHOICES = (
        ('SUPER_ADMIN', 'Super Admin'),
        ('DEAN', 'Dean of Department'),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='DEAN')
    department = models.OneToOneField(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='dean_user')

    def __str__(self):
        return f"{self.username} ({self.role})"

class AuditLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=50)
    object_type = models.CharField(max_length=50)
    object_id = models.CharField(max_length=50)
    before_state = models.JSONField(blank=True, null=True)
    after_state = models.JSONField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)

    def __str__(self):
        return f"{self.user} - {self.action} - {self.timestamp}"
