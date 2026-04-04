from django.db import models
from django.utils import timezone

class VendorLocation(models.Model):
    vendor_location_id = models.AutoField(primary_key=True)
    vendor = models.ForeignKey('vendors_all.Vendor', on_delete=models.CASCADE)
    location = models.ForeignKey('all_locations.Location', on_delete=models.CASCADE)
