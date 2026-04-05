from django.urls import path
from . import views
from apps.admin_panel import views as admin_views

urlpatterns = [
    # ── Status ────────────────────────────────────────────────────────
    path('status/', views.server_status, name='server_status'),

    # ── User Auth ─────────────────────────────────────────────────────
    path('auth/register/', views.register_user, name='register_user'),
    path('auth/login/', views.login_user, name='login_user'),
    path('auth/profile/', views.get_profile, name='get_profile'),

    # ── Vendor Auth ───────────────────────────────────────────────────
    path('auth/vendor-register/', views.register_vendor, name='register_vendor'),
    path('auth/vendor-login/', views.login_vendor, name='login_vendor'),

    # ── Services ──────────────────────────────────────────────────────
    path('services/', views.get_services, name='get_services'),
    path('services/<int:pk>/', views.get_service_detail, name='get_service_detail'),
    path('services/create/', views.create_service, name='create_service'),

    # ── Categories & Locations ────────────────────────────────────────
    path('categories/', views.get_categories, name='get_categories'),
    path('locations/', views.get_locations, name='get_locations'),

    # ── Queries / Inquiries ───────────────────────────────────────────
    path('queries/create/', views.create_query, name='create_query'),
    path('queries/my/', views.get_user_queries, name='get_user_queries'),
    path('queries/vendor/', views.get_vendor_queries, name='get_vendor_queries'),

    # ── Original Admin API ─────────────────────────────────────────────
    path('admin/login/', views.admin_login, name='admin_login'),
    # Note: admin_stats/users/vendors/orders/queries are here
    path('admin/users/', views.admin_users, name='admin_users'),
    path('admin/users/<int:user_id>/toggle-blacklist/', views.admin_toggle_user_blacklist, name='admin_toggle_user_blacklist'),
    path('admin/vendors/', views.admin_vendors, name='admin_vendors'),
    path('admin/orders/', views.admin_orders, name='admin_orders'),
    path('admin/queries/', views.admin_queries, name='admin_queries'),
    path('admin/services/', views.admin_services, name='admin_services'),
    path('admin/services/<int:pk>/', views.admin_service_detail, name='admin_service_detail'),
    
    # ── NEW 9-Panel Control Tower Admin API ────────────────────────────
    path('admin/live-dashboard/', admin_views.live_dashboard, name='live_dashboard'),
    path('admin/alerts/<int:alert_id>/resolve/', admin_views.resolve_alert, name='resolve_alert'),
    path('admin/leads/', admin_views.lead_pipeline, name='lead_pipeline'),
    path('admin/leads/<int:query_id>/reassign/', admin_views.reassign_lead, name='reassign_lead'),
    path('admin/vendors/scoreboard/', admin_views.vendor_scoreboard, name='vendor_scoreboard'),
    path('admin/vendors/<int:vendor_id>/suspend/', admin_views.suspend_vendor, name='suspend_vendor'),
    path('admin/disputes/', admin_views.disputes, name='disputes'),
    path('admin/disputes/<int:dispute_id>/resolve/', admin_views.resolve_dispute, name='resolve_dispute'),
    path('admin/analytics/', admin_views.analytics, name='analytics'),
    path('admin/city-manager/', admin_views.city_manager, name='city_manager'),
    path('admin/whatsapp-bot/', admin_views.whatsapp_bot_stats, name='whatsapp_bot_stats'),
    path('admin/whatsapp-bot/broadcast/', admin_views.send_broadcast, name='send_broadcast'),
    path('admin/system-config/', admin_views.system_config, name='system_config'),

    # ── Packages ──────────────────────────────────────────────────────
    path('packages/premium/', views.get_premium_packages, name='get_premium_packages'),
    path('packages/services/', views.get_service_packages, name='get_service_packages'),
]
