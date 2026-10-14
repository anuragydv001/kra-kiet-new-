from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, CSRFTokenView, LoginView, LogoutView, CurrentUserView

router = DefaultRouter()
router.register(r'users', UserViewSet)

urlpatterns = [
    path('csrf/', CSRFTokenView.as_view(), name='csrf'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('me/', CurrentUserView.as_view(), name='me'),
    path('', include(router.urls)),
]
