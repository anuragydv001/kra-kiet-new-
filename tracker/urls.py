from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AchievementViewSet,
    BiMonthlyCycleViewSet,
    TemplatePreviewView,
    DashboardStatsView,
    ExportEvidenceView,
    VACReportExportPDFView,
    VACReportExportDOCXView,
    KRA7ReportExportPDFView,
    KRA7ReportExportDOCXView,
    KRAReportExportPDFView,
    KRAReportExportDOCXView,
    EvidenceFileUploadView
)

router = DefaultRouter()
router.register(r'achievements', AchievementViewSet, basename='achievement')
router.register(r'cycles', BiMonthlyCycleViewSet, basename='cycle')

urlpatterns = [
    path('', include(router.urls)),
    path('template-preview/', TemplatePreviewView.as_view(), name='template-preview'),
    path('dashboard-stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('exports/', ExportEvidenceView.as_view(), name='exports'),
    path('export-vac-pdf/', VACReportExportPDFView.as_view(), name='export-vac-pdf'),
    path('export-vac-docx/', VACReportExportDOCXView.as_view(), name='export-vac-docx'),
    path('export-kra7-pdf/', KRA7ReportExportPDFView.as_view(), name='export-kra7-pdf'),
    path('export-kra7-docx/', KRA7ReportExportDOCXView.as_view(), name='export-kra7-docx'),
    path('export-kra-pdf/', KRAReportExportPDFView.as_view(), name='export-kra-pdf'),
    path('export-kra-docx/', KRAReportExportDOCXView.as_view(), name='export-kra-docx'),
    path('evidence-file/upload/', EvidenceFileUploadView.as_view(), name='evidence-file-upload'),
    path('evidence-file/<int:pk>/', EvidenceFileUploadView.as_view(), name='evidence-file-delete'),
]
