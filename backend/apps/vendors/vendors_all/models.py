from django.db import models
from django.utils import timezone

class Vendor(models.Model):
    VENDOR_TYPES = [
        ('Photographer', 'Photographer'),
        ('Decorator', 'Decorator'),
        ('Caterer', 'Caterer'),
        ('Venue Provider', 'Venue Provider'),
        ('Makeup Artist', 'Makeup Artist'),
        ('DJ / Musician', 'DJ / Musician'),
        ('Event Planner', 'Event Planner'),
        ('Other', 'Other'),
    ]

    vendor_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    business_name = models.CharField(max_length=255)
    vendor_type = models.CharField(max_length=100, choices=VENDOR_TYPES, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)
    state = models.CharField(max_length=100, null=True, blank=True)
    country = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return self.business_name

class QueryVendor(models.Model):
    query_vendor_id = models.AutoField(primary_key=True)
    query = models.ForeignKey('queries_all.Query', on_delete=models.CASCADE)
    vendor = models.ForeignKey('vendors_all.Vendor', on_delete=models.CASCADE)
    has_accepted = models.BooleanField()
    duration = models.IntegerField(null=True, blank=True)
    status = models.CharField(max_length=50)
    last_message_at = models.DateTimeField(null=True, blank=True)
    has_been_replaced = models.BooleanField(null=True, blank=True)
    mode_office = models.BooleanField(null=True, blank=True)
