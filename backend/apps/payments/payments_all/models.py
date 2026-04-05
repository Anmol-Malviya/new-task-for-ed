from django.db import models
from django.utils import timezone


class Payment(models.Model):
    payment_id      = models.AutoField(primary_key=True)
    payment_type    = models.CharField(max_length=100, default='razorpay')
    time_stamp      = models.DateTimeField(default=timezone.now)
    order           = models.OneToOneField('all_orders.Order', on_delete=models.CASCADE, related_name='payment')
    amount          = models.FloatField()
    status          = models.CharField(max_length=50, default='pending')
    transaction_ref = models.CharField(max_length=255, null=True, blank=True)
    razorpay_order_id = models.CharField(max_length=255, null=True, blank=True)
    razorpay_payment_id = models.CharField(max_length=255, null=True, blank=True)
    razorpay_signature  = models.CharField(max_length=500, null=True, blank=True)
    payment_link    = models.URLField(max_length=500, null=True, blank=True)
    paid_at         = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Payment #{self.payment_id} — Order #{self.order_id} (₹{self.amount}, {self.status})"


class Payout(models.Model):
    PAYOUT_STATUS = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('held', 'Held for Dispute'),
    ]

    payout_id           = models.AutoField(primary_key=True)
    vendor              = models.ForeignKey('vendors_all.Vendor', on_delete=models.CASCADE, related_name='payouts')
    order               = models.OneToOneField('all_orders.Order', on_delete=models.CASCADE, related_name='payout', null=True, blank=True)
    amount              = models.FloatField()
    commission_rate     = models.FloatField(default=0.15)
    commission_amount   = models.FloatField()
    gross_amount        = models.FloatField()
    razorpay_payout_id  = models.CharField(max_length=255, null=True, blank=True)
    razorpay_linked_account = models.CharField(max_length=255, null=True, blank=True)
    status              = models.CharField(max_length=20, choices=PAYOUT_STATUS, default='pending')
    initiated_at        = models.DateTimeField(default=timezone.now)
    completed_at        = models.DateTimeField(null=True, blank=True)
    failure_reason      = models.TextField(null=True, blank=True)
    held_reason         = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"Payout #{self.payout_id} — {self.vendor.business_name} ₹{self.amount} ({self.status})"
