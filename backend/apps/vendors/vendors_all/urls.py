from django.urls import path
from . import views

urlpatterns = [
    # ── Profile ──────────────────────────────────────────────────────────
    path('profile/', views.vendor_profile, name='vendor_profile'),
    path('onboarding-status/', views.vendor_onboarding_status, name='vendor_onboarding_status'),

    # ── Step 2: Categories ───────────────────────────────────────────────
    path('categories/', views.vendor_categories, name='vendor_categories'),

    # ── Step 3: Photos ───────────────────────────────────────────────────
    path('photos/', views.vendor_photos, name='vendor_photos'),
    path('photos/upload/', views.vendor_photos_upload, name='vendor_photos_upload'),
    path('photos/<int:photo_id>/delete/', views.vendor_photo_delete, name='vendor_photo_delete'),

    # ── Step 4: Bank Details ─────────────────────────────────────────────
    path('bank-details/', views.vendor_bank_details, name='vendor_bank_details'),
    path('bank-details/status/', views.vendor_bank_status, name='vendor_bank_status'),

    # ── Step 5: Agreement ────────────────────────────────────────────────
    path('agreement/', views.vendor_agreement, name='vendor_agreement'),

    # ── Leads ────────────────────────────────────────────────────────────
    path('leads/', views.vendor_leads, name='vendor_leads'),
    path('leads/<int:lead_id>/accept/', views.vendor_lead_accept, name='vendor_lead_accept'),
    path('leads/<int:lead_id>/decline/', views.vendor_lead_decline, name='vendor_lead_decline'),

    # ── Orders ───────────────────────────────────────────────────────────
    path('orders/', views.vendor_orders, name='vendor_orders'),
    path('orders/<int:order_id>/', views.vendor_order_detail, name='vendor_order_detail'),
    path('orders/<int:order_id>/confirm-price/', views.vendor_confirm_price, name='vendor_confirm_price'),
    path('orders/<int:order_id>/mark-delivered/', views.vendor_mark_delivered, name='vendor_mark_delivered'),
    path('orders/<int:order_id>/call/', views.vendor_initiate_call, name='vendor_initiate_call'),
    path('orders/<int:order_id>/d1-ready/', views.vendor_d1_readiness, name='vendor_d1_readiness'),

    # ── Availability ─────────────────────────────────────────────────────
    path('availability/', views.vendor_availability, name='vendor_availability'),
    path('availability/settings/', views.vendor_availability_settings, name='vendor_availability_settings'),
    path('availability/block/', views.vendor_block_date, name='vendor_block_date'),
    path('availability/<str:date>/unblock/', views.vendor_unblock_date, name='vendor_unblock_date'),

    # ── Earnings ─────────────────────────────────────────────────────────
    path('earnings/', views.vendor_earnings, name='vendor_earnings'),
    path('payouts/', views.vendor_payouts, name='vendor_payouts'),

    # ── Score ─────────────────────────────────────────────────────────────
    path('score/', views.vendor_score, name='vendor_score'),

    # ── Tier Info (3-tier benefit matrix + upgrade progress) ──────────────
    path('tier-info/', views.vendor_tier_info, name='vendor_tier_info'),

    # ── Portfolio Health (gate check + occasion distribution) ─────────────
    path('portfolio/health/', views.vendor_portfolio_health, name='vendor_portfolio_health'),

    # ── Premium ───────────────────────────────────────────────────────────
    path('premium/status/', views.vendor_premium_status, name='vendor_premium_status'),
    path('premium/subscribe/', views.vendor_premium_subscribe, name='vendor_premium_subscribe'),
    path('premium/cancel/', views.vendor_premium_cancel, name='vendor_premium_cancel'),
    path('premium/webhook/', views.vendor_premium_webhook, name='vendor_premium_webhook'),
    path('premium/admin/grant/<int:vendor_id_param>/', views.admin_grant_premium, name='admin_grant_premium'),
    path('premium/admin/revoke/<int:vendor_id_param>/', views.admin_revoke_premium, name='admin_revoke_premium'),
]
