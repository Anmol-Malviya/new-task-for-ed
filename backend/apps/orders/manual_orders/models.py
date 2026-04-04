from django.db import models
from django.utils import timezone

class ManualOrder(models.Model):
    manual_order_id = models.AutoField(primary_key=True)
    vendor = models.ForeignKey('vendors_all.Vendor', on_delete=models.CASCADE)
    vendor_name = models.CharField(max_length=255)
    vendor_phone = models.CharField(max_length=20)
    address = models.TextField()
    service_date = models.DateTimeField()
    user = models.ForeignKey('users_all.User', on_delete=models.CASCADE)
    customer_name = models.CharField(max_length=255)
    phone_no = models.CharField(max_length=20)
    payment_type = models.CharField(max_length=50)
    total_paid = models.FloatField()
    service_details = models.TextField(null=True, blank=True)
