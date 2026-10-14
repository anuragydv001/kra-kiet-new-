from rest_framework import serializers
from .models import BiMonthlyCycle, Achievement, Evidence

class BiMonthlyCycleSerializer(serializers.ModelSerializer):
    class Meta:
        model = BiMonthlyCycle
        fields = '__all__'

class EvidenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evidence
        fields = ['id', 'document_data', 'generated_pdf', 'last_edited_at']

class AchievementSerializer(serializers.ModelSerializer):
    evidence = EvidenceSerializer(many=True, read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    department_code = serializers.CharField(source='department.name', read_only=True)
    kra_metric_details = serializers.CharField(source='kra_metric.activity_description', read_only=True)
    kra_code = serializers.CharField(source='kra_metric.serial_number', read_only=True)
    cycle_display = serializers.CharField(source='cycle.get_cycle_name_display', read_only=True)
    cycle_name = serializers.CharField(source='cycle.cycle_name', read_only=True)

    class Meta:
        model = Achievement
        fields = [
            'id', 'department', 'department_name', 'department_code', 'kra_metric', 'kra_code',
            'kra_metric_details', 'cycle', 'cycle_name', 'cycle_display', 'status',
            'numeric_value', 'remarks', 'custom_data', 'evidence', 'dynamic_target', 'updated_at'
        ]
        read_only_fields = ['department', 'dynamic_target', 'updated_at']

    def validate_status(self, value):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        if user and getattr(user, 'role', '') != 'SUPER_ADMIN':
            if value not in ['DRAFT', 'SUBMITTED']:
                raise serializers.ValidationError("Deans can only set status to DRAFT or SUBMITTED.")
        return value
