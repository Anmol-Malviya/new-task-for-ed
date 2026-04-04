from django.db import models
from django.utils import timezone

class Bidding(models.Model):
    bidding_id = models.AutoField(primary_key=True)
    generated_image = models.ForeignKey('image_generation_all.GeneratedImage', on_delete=models.CASCADE)
    user = models.ForeignKey('users_all.User', on_delete=models.CASCADE)
    vendor = models.ForeignKey('vendors_all.Vendor', on_delete=models.CASCADE)
    vendor_price = models.FloatField()
    status = models.CharField(max_length=50, default="pending")
    date = models.DateTimeField(default=timezone.now)
    address = models.ForeignKey('address_all.Address', on_delete=models.SET_NULL, null=True, blank=True)
