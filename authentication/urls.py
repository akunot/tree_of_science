# URLs configuradas para tu app 'authentication'
# Reemplaza el contenido de tu archivo authentication/urls.py

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # =============== TUS URLs ACTUALES (COMPATIBLES) ===============
    
    #  Tu estructura actual mantenida:
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('logout/', views.logout, name='logout'),
    path('refresh-token/', TokenRefreshView.as_view(), name='token_refresh'),
    path('forgot-password/', views.forgot_password, name='forgot_password'),
    path('reset-password/', views.reset_password, name='reset_password'),
    
    # =============== URLs JWT ADICIONALES (NUEVAS) ===============
    
    # Endpoints JWT estándar (mantienen compatibilidad)
    path('api/token/', views.login, name='login_jwt'),  # Tu login mejorado con validación
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # =============== NUEVAS FUNCIONALIDADES ===============
    
    # Verificación de email
    path('verify-email/', views.verify_email, name='verify_email'),
    
    # Gestión de invitaciones
    path('invitations/validate/', views.validate_invitation, name='validate_invitation'),
    path('invitations/send/', views.send_invitation, name='send_invitation'),
    path('invitations/my/', views.get_user_invitations, name='my_invitations'),
    
    # Perfil mejorado
    path('profile/', views.profile, name='profile'),
    path('profile/activities/', views.user_activities, name='user_activities'),
    
    # Administración
    path('admin/users/', views.admin_users_list, name='admin_users_list'),
    path('admin/users/<int:user_id>/', views.admin_update_user, name='admin_update_user'),
    path('admin/users/<int:user_id>/delete/', views.admin_delete_user, name='admin_delete_user'),
    path('admin/users/<int:user_id>/activate/', views.admin_activate_user, name='admin_activate_user'),
    path('admin/users/<int:user_id>/suspend/', views.admin_suspend_user, name='admin_suspend_user'),

    # solicitudes de administrador
    path('request-admin/', views.request_admin_access, name='request_admin_access'),
    path('admin/requests/', views.get_admin_requests, name='get_admin_requests'),
    path('admin/requests/<int:request_id>/review/', views.review_admin_request, name='review_admin_request'),
    
    # URLs de administración (solo para administradores)
    # URLs de administración (solo para administradores)
    path('admin/create-invitation/', views.create_invitation, name='create_invitation'),
    # GET: listar invitaciones
    path('admin/invitations/', views.get_invitations, name='get_invitations'),
    # POST: crear invitación (reusa send_invitation)
    path('admin/invitations/create/', views.send_invitation, name='admin_send_invitation'),
    path('admin/invitations/<int:invitation_id>/', views.revoke_invitation, name='revoke_invitation'),
    path('admin/stats/', views.get_dashboard_stats, name='get_dashboard_stats'),
    path('admin/activity/', views.get_recent_activity, name='get_recent_activity')
]
