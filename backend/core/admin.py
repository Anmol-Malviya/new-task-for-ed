from django.contrib import admin
from apps.users.users_all.models import User
from apps.vendors.vendors_all.models import (
    Vendor, QueryVendor,
    VendorPhoto, VendorBankDetails, VendorAgreement,
    VendorScoreLog, VendorViolation, VendorPremiumLog,
)
from apps.service_categories.service_categories_all.models import Category
from apps.service.service_all.models import Service
from apps.carts.package_carts.models import Package as BasePackage
from apps.orders.all_orders.models import Order
from apps.queries.queries_all.models import Query
from apps.whatsapp.whatsapp_all.models import Chat
from apps.premium.premium_all.models import PremiumVendor
from apps.bidding.bidding_all.models import Bidding
from apps.address.address_all.models import Address
from apps.locations.all_locations.models import Location
from apps.carts.all_carts.models import Cart

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('user_id', 'name', 'email', 'number', 'blacklist_status')
    search_fields = ('name', 'email', 'number')
    list_filter = ('blacklist_status',)

@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):
    list_display   = ('vendor_id', 'business_name', 'email', 'city', 'tier',
                      'is_premium', 'is_approved', 'is_active', 'score')
    search_fields  = ('business_name', 'name', 'email', 'phone', 'city')
    list_filter    = ('is_premium', 'is_approved', 'is_active', 'tier', 'is_blacklisted', 'city')
    readonly_fields = ('premium_since', 'premium_expires_at', 'approved_at', 'created_at')
    actions        = ['grant_premium', 'revoke_premium', 'approve_vendor']

    def grant_premium(self, request, queryset):
        from django.utils import timezone
        import datetime
        now = timezone.now()
        for v in queryset:
            v.is_premium         = True
            v.premium_since      = v.premium_since or now
            v.premium_expires_at = (v.premium_expires_at or now) + datetime.timedelta(days=31)
            v.tier               = 'premium'
            v.save(update_fields=['is_premium', 'premium_since', 'premium_expires_at', 'tier'])
            VendorPremiumLog.objects.create(vendor=v, event='subscribed', notes='Admin grant (core/admin)')
        self.message_user(request, f'Premium granted to {queryset.count()} vendor(s) for 1 month.')
    grant_premium.short_description = '⭐ Grant Premium (1 month)'

    def revoke_premium(self, request, queryset):
        for v in queryset:
            completed = v.orders.filter(status='paid_out').count()
            v.is_premium = False
            v.tier = 'active' if completed >= 5 else 'starter'
            v.save(update_fields=['is_premium', 'tier'])
            VendorPremiumLog.objects.create(vendor=v, event='expired', notes='Admin revoke (core/admin)')
        self.message_user(request, f'Premium revoked from {queryset.count()} vendor(s).')
    revoke_premium.short_description = '✕ Revoke Premium'

    def approve_vendor(self, request, queryset):
        from django.utils import timezone
        import datetime
        now = timezone.now()
        for v in queryset:
            v.is_approved = True
            v.is_active   = True
            v.approved_at = now
            v.score      += 20
            v.score_boost_expires_at = now + datetime.timedelta(days=14)
            v.save(update_fields=['is_approved', 'is_active', 'approved_at', 'score', 'score_boost_expires_at'])
        self.message_user(request, f'Approved {queryset.count()} vendor(s) with +20 score bonus.')
    approve_vendor.short_description = '✓ Approve Vendor (+20 score bonus)'

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('services_id', 'name', 'price', 'vendor', 'occasion', 'category_name', 'ratings')
    search_fields = ('name', 'vendor__business_name', 'category_name')
    list_filter = ('occasion', 'category_name', 'stock_status')

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_id', 'user', 'vendor', 'total_price', 'status', 'service_date', 'time_stamp')
    search_fields = ('order_id', 'user__name', 'vendor__business_name')
    list_filter = ('status', 'payment_type')

@admin.register(Query)
class QueryAdmin(admin.ModelAdmin):
    list_display = ('query_id', 'user', 'service', 'location', 'service_date', 'is_urgent', 'is_accepted')
    search_fields = ('user__name', 'service__name', 'location')
    list_filter = ('is_urgent', 'is_accepted')

@admin.register(QueryVendor)
class QueryVendorAdmin(admin.ModelAdmin):
    list_display = ('query_vendor_id', 'query', 'vendor', 'has_accepted', 'status')
    list_filter = ('has_accepted', 'status')

@admin.register(Bidding)
class BiddingAdmin(admin.ModelAdmin):
    list_display = ('bidding_id', 'user', 'vendor', 'vendor_price', 'status', 'date')
    list_filter = ('status',)

@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ('location_id', 'name')
    search_fields = ('name',)

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('category_id', 'name', 'number')
    search_fields = ('name',)

@admin.register(Chat)
class ChatAdmin(admin.ModelAdmin):
    list_display = ('chat_id', 'query', 'sender', 'status', 'time_stamp')
    list_filter = ('status', 'sender')

@admin.register(BasePackage)
class PackageAdmin(admin.ModelAdmin):
    list_display = ('package_id', 'name')
    search_fields = ('name',)

@admin.register(PremiumVendor)
class PremiumVendorAdmin(admin.ModelAdmin):
    list_display = ('premium_vendor_id', 'vendor', 'premium_package', 'start_date', 'end_date')

@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ('address_id', 'user', 'city', 'location')

@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('cart_id', 'user', 'service', 'total_price', 'is_saved')


# ── Vendor supplementary models ──────────────────────────────────────────────
@admin.register(VendorPremiumLog)
class VendorPremiumLogAdmin(admin.ModelAdmin):
    list_display  = ('vendor', 'event', 'amount', 'razorpay_subscription_id', 'timestamp')
    list_filter   = ('event',)
    search_fields = ('vendor__business_name', 'razorpay_subscription_id')
    ordering      = ('-timestamp',)

@admin.register(VendorPhoto)
class VendorPhotoAdmin(admin.ModelAdmin):
    list_display  = ('vendor', 'is_approved', 'occasion_tag', 'uploaded_at')
    list_filter   = ('is_approved',)
    actions       = ['approve_photos']

    def approve_photos(self, request, queryset):
        from django.utils import timezone
        queryset.update(is_approved=True, approved_at=timezone.now())
        self.message_user(request, f'{queryset.count()} photo(s) approved.')
    approve_photos.short_description = '✓ Approve selected photos'

@admin.register(VendorBankDetails)
class VendorBankDetailsAdmin(admin.ModelAdmin):
    list_display  = ('vendor', 'bank_name', 'verification_status', 'submitted_at')
    list_filter   = ('verification_status',)

@admin.register(VendorAgreement)
class VendorAgreementAdmin(admin.ModelAdmin):
    list_display = ('vendor', 'signed_at', 'non_solicitation_clause', 'commission_rate_agreed')

@admin.register(VendorScoreLog)
class VendorScoreLogAdmin(admin.ModelAdmin):
    list_display = ('vendor', 'old_score', 'new_score', 'delta', 'reason', 'timestamp')
    ordering     = ('-timestamp',)

@admin.register(VendorViolation)
class VendorViolationAdmin(admin.ModelAdmin):
    list_display = ('vendor', 'violation_type', 'severity', 'resolved', 'reported_at')
    list_filter  = ('severity', 'resolved')
