from rest_framework import permissions

class IsSuperAdmin(permissions.BasePermission):
    """
    Allows access only to super admin users.
    """

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'SUPER_ADMIN')

class IsDean(permissions.BasePermission):
    """
    Allows access only to Dean users.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'DEAN')

class IsDeanOrSuperAdmin(permissions.BasePermission):
    """
    Allows access to Dean or Super Admin users.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and
            request.user.role in ['DEAN', 'SUPER_ADMIN']
        )

class IsSuperAdminOrReadOnly(permissions.BasePermission):
    """
    Allows read-only access to all users, but write access only to Super Admins.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated and request.user.role == 'SUPER_ADMIN')

class IsOwnerDepartmentOrReadOnly(permissions.BasePermission):
    """
    Object-level permission to only allow DEANs to edit objects that belong to their department.
    Assumes the object has a `department` attribute.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        if getattr(request.user, 'role', '') == 'SUPER_ADMIN':
            return True
        return hasattr(request.user, 'department') and request.user.department == getattr(obj, 'department', None)


