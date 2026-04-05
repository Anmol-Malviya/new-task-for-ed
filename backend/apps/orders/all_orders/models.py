from django.db import models
from django.utils import timezone


class Order(models.Model):
    STATUS_CHOICES = [
        ('lead_accepted', 'Lead Accepted'),
        ('price_confirmed', 'Price Confirmed'),
        ('payment_received', 'Payment Received'),
        ('d1_ready', 'D-1 Ready'),
        ('delivered', 'Delivered'),
        ('paid_out', 'Paid Out'),
        ('disputed', 'Disputed'),
        ('cancelled', 'Cancelled'),
    ]

    PAYOUT_STATUS = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('held', 'Held'),
        ('failed', 'Failed'),
    ]

    order_id            = models.AutoField(primary_key=True)
    order_type          = models.CharField(max_length=100, default='query')
    query               = models.ForeignKey('queries_all.Query', on_delete=models.CASCADE, related_name='orders', null=True, blank=True)
    user                = models.ForeignKey('users_all.User', on_delete=models.CASCADE, related_name='orders')
    vendor              = models.ForeignKey('vendors_all.Vendor', on_delete=models.CASCADE, related_name='orders')

    # Pricing
    approx_budget       = models.FloatField(null=True, blank=True)
    final_amount        = models.FloatField(null=True, blank=True)
    vendor_payout_amount = models.FloatField(null=True, blank=True)
    commission_amount   = models.FloatField(null=True, blank=True)
    commission_rate     = models.FloatField(default=0.15)
    total_price         = models.FloatField(default=0)
    payment_type        = models.CharField(max_length=100, default='razorpay')

    # Event info
    occasion            = models.CharField(max_length=50, null=True, blank=True)
    theme_notes         = models.TextField(null=True, blank=True)
    arrival_time        = models.TimeField(null=True, blank=True)
    service_date        = models.DateTimeField(null=True, blank=True)

    # Address (hidden until payment)
    address             = models.TextField(null=True, blank=True)
    location_id         = models.IntegerField(null=True, blank=True)

    # Status pipeline
    status              = models.CharField(max_length=30, choices=STATUS_CHOICES, default='lead_accepted')

    # Calling
    relay_phone_number  = models.CharField(max_length=20, null=True, blank=True)
    exotel_call_sid     = models.CharField(max_length=255, null=True, blank=True)

    # Payout
    payout_status       = models.CharField(max_length=20, choices=PAYOUT_STATUS, default='pending')
    razorpay_payment_link = models.CharField(max_length=500, null=True, blank=True)
    razorpay_payment_id = models.CharField(max_length=255, null=True, blank=True)
    razorpay_payout_id  = models.CharField(max_length=255, null=True, blank=True)

    # D-1 readiness
    d1_ready            = models.BooleanField(default=False)
    d1_needs_help       = models.BooleanField(default=False)

    # Dispute
    has_dispute         = models.BooleanField(default=False)
    dispute_resolved    = models.BooleanField(default=False)

    # Timestamps
    time_stamp          = models.DateTimeField(default=timezone.now)
    price_confirmed_at  = models.DateTimeField(null=True, blank=True)
    payment_received_at = models.DateTimeField(null=True, blank=True)
    delivery_confirmed_at = models.DateTimeField(null=True, blank=True)
    payout_triggered_at = models.DateTimeField(null=True, blank=True)
    payout_completed_at = models.DateTimeField(null=True, blank=True)

    # Legacy fields (kept for backward compat)
    total_package       = models.IntegerField(default=0)
    total_items         = models.IntegerField(default=0)
    paid_percent        = models.IntegerField(default=0)
    bidding_order_id    = models.IntegerField(default=0)

    def calculate_payout(self):
        if self.final_amount:
            rate = self.commission_rate
            self.commission_amount = round(self.final_amount * rate, 2)
            self.vendor_payout_amount = round(self.final_amount * (1 - rate), 2)

    def __str__(self):
        return f"Order #{self.order_id} — {self.vendor.business_name if self.vendor else 'N/A'} ({self.status})"
