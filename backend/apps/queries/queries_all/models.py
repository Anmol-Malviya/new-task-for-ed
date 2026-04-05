from django.db import models
from django.utils import timezone


OCCASION_CHOICES = [
    ('birthday', 'Birthday'),
    ('anniversary', 'Anniversary'),
    ('baby_shower', 'Baby Shower'),
    ('wedding', 'Wedding'),
    ('corporate', 'Corporate'),
    ('other', 'Other'),
]


class Query(models.Model):
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('assigned', 'Assigned'),
        ('accepted', 'Accepted'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('no_vendor_found', 'No Vendor Found'),
    ]

    query_id        = models.AutoField(primary_key=True)
    service         = models.ForeignKey('service_all.Service', on_delete=models.CASCADE, null=True, blank=True)
    user            = models.ForeignKey('users_all.User', on_delete=models.CASCADE, related_name='queries')

    # Occasion & event details
    occasion        = models.CharField(max_length=50, choices=OCCASION_CHOICES, null=True, blank=True)
    theme_note      = models.TextField(null=True, blank=True)
    event_date      = models.DateField(null=True, blank=True)
    arrival_time    = models.TimeField(null=True, blank=True)
    guest_count     = models.IntegerField(null=True, blank=True)

    # Location (partial shown to vendor, full unlocked after payment)
    location        = models.CharField(max_length=255, null=True, blank=True)
    city_area       = models.CharField(max_length=100, null=True, blank=True)
    full_address    = models.TextField(null=True, blank=True)
    floor_details   = models.CharField(max_length=100, null=True, blank=True)
    distance_km     = models.FloatField(null=True, blank=True)

    # Budget
    approx_budget   = models.FloatField(null=True, blank=True)
    budget_range_min = models.FloatField(null=True, blank=True)
    budget_range_max = models.FloatField(null=True, blank=True)

    # Status
    status          = models.CharField(max_length=30, choices=STATUS_CHOICES, default='open')
    is_accepted     = models.BooleanField(null=True, blank=True)
    is_urgent       = models.BooleanField(default=False)
    all_vendors_declined = models.BooleanField(default=False)

    # Contact (hidden until payment)
    client_name     = models.CharField(max_length=255, null=True, blank=True)
    client_phone    = models.CharField(max_length=20, null=True, blank=True)

    # Legacy
    service_date    = models.DateTimeField(null=True, blank=True)

    time_stamp      = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Query #{self.query_id} — {self.occasion} by {self.user.name if self.user else 'N/A'} ({self.status})"
