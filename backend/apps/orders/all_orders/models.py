from django.db import models
from django.utils import timezone

class Order(models.Model):
    order_id = models.AutoField(primary_key=True)
    order_type = models.CharField(max_length=100)
    query = models.ForeignKey('queries_all.Query', on_delete=models.CASCADE)
    payment_type = models.CharField(max_length=100)
    total_price = models.FloatField()
    total_package = models.IntegerField()
    total_items = models.IntegerField()
    paid_percent = models.IntegerField()
    bidding_order_id = models.IntegerField()
    location_id = models.IntegerField()
    address = models.TextField()
    status = models.CharField(max_length=50, default="pending")
    time_stamp = models.DateTimeField(default=timezone.now)
    service_date = models.DateTimeField()
    user = models.ForeignKey('users_all.User', on_delete=models.CASCADE)
    vendor = models.ForeignKey('vendors_all.Vendor', on_delete=models.CASCADE)
