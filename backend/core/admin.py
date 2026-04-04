from django.contrib import admin
from apps.users.users_all.models import User
from apps.vendors.vendors_all.models import Vendor, QueryVendor
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
    list_display = ('vendor_id', 'business_name', 'name', 'email', 'phone', 'city')
    search_fields = ('business_name', 'name', 'email', 'phone', 'city')
    list_filter = ('city', 'state', 'country')

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
