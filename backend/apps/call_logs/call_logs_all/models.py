from django.db import models
from django.utils import timezone


class PhoneCall(models.Model):
    CALL_STATUS = [
        ('initiated', 'Initiated'),
        ('ringing', 'Ringing'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('no_answer', 'No Answer'),
    ]

    call_id          = models.AutoField(primary_key=True)
    order            = models.ForeignKey('all_orders.Order', on_delete=models.CASCADE, related_name='calls')
    vendor           = models.ForeignKey('vendors_all.Vendor', on_delete=models.CASCADE, related_name='calls')
    relay_number     = models.CharField(max_length=20)
    vendor_number    = models.CharField(max_length=20, null=True, blank=True)
    client_number_masked = models.CharField(max_length=20, null=True, blank=True)
    duration_seconds = models.IntegerField(default=0)
    call_status      = models.CharField(max_length=20, choices=CALL_STATUS, default='initiated')
    exotel_call_sid  = models.CharField(max_length=255, null=True, blank=True)
    recording_url    = models.URLField(max_length=500, null=True, blank=True)
    timestamp        = models.DateTimeField(default=timezone.now)
    ended_at         = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Call #{self.call_id} — Order #{self.order_id} ({self.call_status}, {self.duration_seconds}s)"
