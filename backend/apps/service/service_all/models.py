from django.db import models
from django.utils import timezone

class Service(models.Model):
    services_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    short_desc = models.TextField(null=True, blank=True)
    long_desc = models.TextField(null=True, blank=True)
    sku = models.CharField(max_length=100, null=True, blank=True)
    stock_status = models.CharField(max_length=50, null=True, blank=True)
    manage_stock = models.BooleanField(null=True, blank=True)
    category_id = models.IntegerField(null=True, blank=True)
    menu_order = models.IntegerField(null=True, blank=True)
    purchase_note = models.TextField(null=True, blank=True)
    overriding_policy = models.TextField(null=True, blank=True)
    attributes = models.TextField(null=True, blank=True)
    used = models.IntegerField(null=True, blank=True)
    ratings = models.FloatField(null=True, blank=True)

    # ── Frontend display fields ─────────────────
    price = models.FloatField(null=True, blank=True)
    original_price = models.FloatField(null=True, blank=True)
    image_url = models.TextField(null=True, blank=True)
    occasion = models.CharField(max_length=100, null=True, blank=True)  # e.g. 'birthday', 'wedding'
    category_name = models.CharField(max_length=255, null=True, blank=True)  # e.g. 'Balloon Decoration'
    badge = models.CharField(max_length=100, null=True, blank=True)  # e.g. 'Best Seller'
    review_count = models.IntegerField(default=0)
    vendor = models.ForeignKey('vendors_all.Vendor', on_delete=models.SET_NULL, null=True, blank=True, related_name='services')

    def __str__(self):
        return self.name

class ServiceCategory(models.Model):
    service_category_id = models.AutoField(primary_key=True)
    service = models.ForeignKey('service_all.Service', on_delete=models.CASCADE)
    category = models.ForeignKey('service_categories_all.Category', on_delete=models.CASCADE)

class ServiceTag(models.Model):
    service_tags_id = models.AutoField(primary_key=True)
    service = models.ForeignKey('service_all.Service', on_delete=models.CASCADE)
    tag = models.ForeignKey('tags_all.Tag', on_delete=models.CASCADE)
