from rest_framework import serializers
from apps.users.users_all.models import User
from apps.vendors.vendors_all.models import Vendor, QueryVendor
from apps.service.service_all.models import Service
from apps.service_categories.service_categories_all.models import Category
from apps.locations.all_locations.models import Location
from apps.queries.queries_all.models import Query
# QueryVendor moved to vendor app
from apps.bidding.bidding_all.models import Bidding
from apps.orders.bidding_orders.models import BiddingOrder
from apps.packages.packages_all.models import PremiumPackage, ServicePackage
from django.contrib.auth.hashers import make_password


# ─── Helper: Convert DRF nested errors → readable message ───────────
def format_serializer_errors(errors: dict) -> str:
    """Extracts first readable error message from DRF's nested error dict."""
    for field, messages in errors.items():
        if isinstance(messages, list) and messages:
            return f"{field}: {messages[0]}"
        elif isinstance(messages, str):
            return f"{field}: {messages}"
    return "Validation error. Please check your input."


# ─── Auth / User ────────────────────────────────────────────────────
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['user_id', 'name', 'email', 'number', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)


class UserPublicSerializer(serializers.ModelSerializer):
    """Safe serializer — no password"""
    class Meta:
        model = User
        fields = ['user_id', 'name', 'email', 'number', 'address']


# ─── Vendor ─────────────────────────────────────────────────────────
class VendorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = ['vendor_id', 'name', 'business_name', 'email', 'phone', 'password', 'city', 'vendor_type']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)


class VendorPublicSerializer(serializers.ModelSerializer):
    """Safe public vendor info for service cards"""
    class Meta:
        model = Vendor
        fields = ['vendor_id', 'name', 'business_name', 'city', 'vendor_type']


# ─── Category ───────────────────────────────────────────────────────
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['category_id', 'name', 'number']


# ─── Location ───────────────────────────────────────────────────────
class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ['location_id', 'name']


# ─── Service (full card data for frontend) ──────────────────────────
class ServiceSerializer(serializers.ModelSerializer):
    vendor_info = VendorPublicSerializer(source='vendor', read_only=True)

    class Meta:
        model = Service
        fields = [
            'services_id', 'name', 'short_desc', 'long_desc',
            'price', 'original_price', 'image_url', 'occasion',
            'category_name', 'badge', 'ratings', 'review_count',
            'stock_status', 'vendor', 'vendor_info',
        ]


class ServiceCreateSerializer(serializers.ModelSerializer):
    """Used when admin/vendor creates a service"""
    class Meta:
        model = Service
        fields = [
            'name', 'short_desc', 'long_desc',
            'price', 'original_price', 'image_url', 'occasion',
            'category_name', 'badge', 'ratings', 'review_count',
            'stock_status', 'vendor',
        ]


# ─── Queries & Bidding ─────────────────────────────────────────────
class QuerySerializer(serializers.ModelSerializer):
    service_name = serializers.CharField(source='service.name', read_only=True)
    image_url = serializers.CharField(source='service.image_url', read_only=True)

    class Meta:
        model = Query
        fields = [
            'query_id', 'service', 'service_name', 'image_url', 'user', 'location', 
            'service_date', 'is_urgent', 'approx_budget', 'is_accepted', 'time_stamp'
        ]
        read_only_fields = ['user', 'is_accepted', 'time_stamp']


class QueryCreateSerializer(serializers.ModelSerializer):
    """Used for users creating a new inquiry for a service"""
    class Meta:
        model = Query
        fields = [
            'service', 'location', 'service_date', 'is_urgent', 'approx_budget'
        ]


class BiddingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bidding
        fields = '__all__'


# ─── Packages ───────────────────────────────────────────────────────
class PremiumPackageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PremiumPackage
        fields = '__all__'


class ServicePackageSerializer(serializers.ModelSerializer):
    service_name = serializers.CharField(source='service.name', read_only=True)
    category_name = serializers.CharField(source='package_category.name', read_only=True)
    
    class Meta:
        model = ServicePackage
        fields = '__all__'

