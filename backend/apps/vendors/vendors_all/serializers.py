from rest_framework import serializers
from .models import (
    Vendor, VendorServiceCategory, VendorPhoto,
    VendorBankDetails, VendorAgreement, VendorAvailability,
    VendorScoreLog, QueryVendor
)


class VendorPublicSerializer(serializers.ModelSerializer):
    tier = serializers.CharField(read_only=True)
    commission_rate = serializers.SerializerMethodField()
    lead_cap = serializers.SerializerMethodField()
    onboarding_percent = serializers.SerializerMethodField()

    class Meta:
        model = Vendor
        fields = [
            'vendor_id', 'name', 'email', 'business_name', 'owner_name',
            'vendor_type', 'description', 'phone', 'city', 'state',
            'service_areas', 'score', 'avg_rating', 'response_rate',
            'completion_rate', 'tier', 'is_active', 'is_approved',
            'is_verified', 'is_premium', 'is_blacklisted',
            'onboarding_step', 'onboarding_completed',
            'commission_rate', 'lead_cap', 'onboarding_percent',
            'monthly_lead_count', 'max_orders_per_day', 'created_at',
        ]

    def get_commission_rate(self, obj):
        return obj.get_commission_rate()

    def get_lead_cap(self, obj):
        return obj.get_lead_cap()

    def get_onboarding_percent(self, obj):
        step = obj.onboarding_step
        if obj.onboarding_completed:
            return 100
        return min(int((step - 1) / 5 * 100), 100)


class VendorProfileUpdateSerializer(serializers.ModelSerializer):
    """Step 1 — Basic Profile Update"""
    class Meta:
        model = Vendor
        fields = [
            'name', 'owner_name', 'business_name', 'description',
            'phone', 'whatsapp_number', 'city', 'state', 'address',
            'service_areas', 'vendor_type', 'aadhar_no',
        ]


class VendorServiceCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = VendorServiceCategory
        fields = ['id', 'occasion', 'created_at']
        read_only_fields = ['id', 'created_at']


class VendorPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = VendorPhoto
        fields = [
            'id', 'photo_url', 'cloudinary_id', 'is_approved',
            'rejection_reason', 'occasion_tag', 'uploaded_at', 'approved_at'
        ]
        read_only_fields = ['id', 'is_approved', 'rejection_reason', 'uploaded_at', 'approved_at']


class VendorBankDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = VendorBankDetails
        fields = [
            'id', 'account_holder', 'account_number', 'ifsc_code',
            'bank_name', 'branch_name', 'verification_status', 'submitted_at'
        ]
        read_only_fields = ['id', 'verification_status', 'submitted_at', 'razorpay_linked_account_id']
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Mask account number for display
        if data.get('account_number') and len(data['account_number']) > 4:
            data['account_number'] = 'XXXX' + data['account_number'][-4:]
        return data


class VendorAgreementSerializer(serializers.ModelSerializer):
    class Meta:
        model = VendorAgreement
        fields = [
            'id', 'non_solicitation_clause', 'commission_rate_agreed',
            'dispute_policy_agreed', 'platform_rules_agreed', 'signed_at'
        ]
        read_only_fields = ['id', 'signed_at']


class VendorAvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = VendorAvailability
        fields = ['id', 'blocked_date', 'block_type', 'recurring_day', 'reason', 'created_at']
        read_only_fields = ['id', 'created_at']


class VendorOnboardingStatusSerializer(serializers.Serializer):
    step = serializers.IntegerField()
    completed = serializers.BooleanField()
    percent = serializers.IntegerField()
    steps_detail = serializers.DictField()
    can_receive_leads = serializers.BooleanField()
    admin_approval_status = serializers.CharField()


class QueryVendorSerializer(serializers.ModelSerializer):
    """Lead card shown to vendor (partial info only)"""
    occasion = serializers.CharField(source='query.occasion')
    city_area = serializers.CharField(source='query.city_area')
    event_date = serializers.DateField(source='query.event_date')
    budget_range_min = serializers.FloatField(source='query.budget_range_min')
    budget_range_max = serializers.FloatField(source='query.budget_range_max')
    theme_note = serializers.CharField(source='query.theme_note')
    distance_km = serializers.FloatField(source='query.distance_km')
    is_urgent = serializers.BooleanField(source='query.is_urgent')
    seconds_remaining = serializers.SerializerMethodField()

    class Meta:
        model = QueryVendor
        fields = [
            'query_vendor_id', 'query_id', 'vendor_position', 'status',
            'assigned_at', 'expires_at', 'is_expired',
            'occasion', 'city_area', 'event_date',
            'budget_range_min', 'budget_range_max',
            'theme_note', 'distance_km', 'is_urgent',
            'seconds_remaining',
        ]

    def get_seconds_remaining(self, obj):
        if obj.expires_at and not obj.is_expired:
            from django.utils import timezone
            delta = obj.expires_at - timezone.now()
            return max(0, int(delta.total_seconds()))
        return 0


class VendorScoreLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = VendorScoreLog
        fields = ['id', 'old_score', 'new_score', 'delta', 'reason', 'timestamp']
