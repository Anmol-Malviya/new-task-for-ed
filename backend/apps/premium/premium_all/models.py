from django.db import models
from django.utils import timezone

class PremiumVendor(models.Model):
    premium_vendor_id = models.AutoField(primary_key=True)
    vendor = models.ForeignKey('vendors_all.Vendor', on_delete=models.CASCADE, related_name='premium_vendors')
    premium_package = models.ForeignKey('packages_all.PremiumPackage', on_delete=models.CASCADE, related_name='vendors')
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
