from django.db import models
from django.utils import timezone

class BiddingOrder(models.Model):
    bidding_order_id = models.AutoField(primary_key=True)
    status = models.CharField(max_length=50, default="pending")
    bidding = models.ForeignKey('bidding_all.Bidding', on_delete=models.CASCADE)
    user = models.ForeignKey('users_all.User', on_delete=models.CASCADE)
    vendor = models.ForeignKey('vendors_all.Vendor', on_delete=models.CASCADE)
    final_price = models.FloatField()
