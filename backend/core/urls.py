from django.urls import path
from . import views

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

    # ── Admin API ─────────────────────────────────────────────────────
    path('admin/login/', views.admin_login, name='admin_login'),
    path('admin/stats/', views.admin_stats, name='admin_stats'),
    path('admin/users/', views.admin_users, name='admin_users'),
    path('admin/users/<int:user_id>/toggle-blacklist/', views.admin_toggle_user_blacklist, name='admin_toggle_user_blacklist'),
    path('admin/vendors/', views.admin_vendors, name='admin_vendors'),
    path('admin/orders/', views.admin_orders, name='admin_orders'),
    path('admin/queries/', views.admin_queries, name='admin_queries'),
    path('admin/services/', views.admin_services, name='admin_services'),
    path('admin/services/<int:pk>/', views.admin_service_detail, name='admin_service_detail'),
    # ── Packages ──────────────────────────────────────────────────────
    path('packages/premium/', views.get_premium_packages, name='get_premium_packages'),
    path('packages/services/', views.get_service_packages, name='get_service_packages'),
]
