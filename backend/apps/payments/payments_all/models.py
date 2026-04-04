from django.db import models
from django.utils import timezone

class Payment(models.Model):
    payment_id = models.AutoField(primary_key=True)
    payment_type = models.CharField(max_length=100)
    time_stamp = models.DateTimeField(default=timezone.now)
    order = models.OneToOneField('all_orders.Order', on_delete=models.CASCADE)
    amount = models.FloatField()
    status = models.CharField(max_length=50, default="paid")
    transaction_ref = models.CharField(max_length=255, null=True, blank=True)
