from django.db import models
from django.utils import timezone


class AdminAlert(models.Model):
    """Real-time alerts shown in Panel 1 Live Dashboard."""
    SEVERITY_CHOICES = [
        ('CRITICAL', 'Critical'),
        ('WARNING', 'Warning'),
        ('INFO', 'Info'),
    ]

    alert_id = models.AutoField(primary_key=True)
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='INFO')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    # Reference fields — can point to a query, vendor, or order
    query_id = models.IntegerField(null=True, blank=True)
    order_id = models.IntegerField(null=True, blank=True)
    vendor_id = models.IntegerField(null=True, blank=True)
    action_label = models.CharField(max_length=100, blank=True, null=True)  # e.g. "Reassign Now"
    is_resolved = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        app_label = 'admin_panel'

    def __str__(self):
        return f"[{self.severity}] {self.title}"


class CityHealth(models.Model):
    """Tracks per-city performance metrics shown in Panel 1 City Health Bars."""
    city_name = models.CharField(max_length=100, unique=True)
    active_leads = models.IntegerField(default=0)
    total_orders = models.IntegerField(default=0)
    active_vendors = models.IntegerField(default=0)
    gmv_today = models.FloatField(default=0.0)  # Gross Merchandise Value
    last_updated = models.DateTimeField(default=timezone.now)

    class Meta:
        app_label = 'admin_panel'

    def __str__(self):
        return f"{self.city_name} — GMV: ₹{self.gmv_today}"


class Dispute(models.Model):
    """Tracks order disputes with SLA tracking — Panel 5."""
    STATUS_CHOICES = [
        ('OPEN', 'Open'),
        ('UNDER_REVIEW', 'Under Review'),
        ('REFUNDED', 'Refunded'),
        ('PAYOUT_HELD', 'Payout Held'),
        ('RESOLVED', 'Resolved'),
    ]

    dispute_id = models.AutoField(primary_key=True)
    order_id = models.IntegerField()
    user_id = models.IntegerField(null=True, blank=True)
    vendor_id = models.IntegerField(null=True, blank=True)
    reason = models.TextField()
    user_complaint_text = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='OPEN')
    payout_held = models.BooleanField(default=False)
    refund_issued = models.BooleanField(default=False)
    resolution_notes = models.TextField(blank=True, null=True)
    # SLA: dispute must be resolved within 48hrs
    created_at = models.DateTimeField(default=timezone.now)
    sla_deadline = models.DateTimeField()  # auto set on save
    resolved_at = models.DateTimeField(null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.sla_deadline:
            import datetime
            self.sla_deadline = self.created_at + datetime.timedelta(hours=48)
        super().save(*args, **kwargs)

    @property
    def hours_remaining(self):
        """Returns hours left before SLA breach."""
        import datetime
        if self.status == 'RESOLVED':
            return 0
        delta = self.sla_deadline - timezone.now()
        return max(0, round(delta.total_seconds() / 3600, 1))

    @property
    def is_sla_breached(self):
        return timezone.now() > self.sla_deadline and self.status not in ('RESOLVED',)

    class Meta:
        ordering = ['sla_deadline']
        app_label = 'admin_panel'

    def __str__(self):
        return f"Dispute #{self.dispute_id} — Order {self.order_id} [{self.status}]"


class SystemConfig(models.Model):
    """Single-row table holding algorithm parameters — Panel 9."""
    config_id = models.AutoField(primary_key=True)
    # Algorithm weights (must sum to ~1.0)
    weight_rating = models.FloatField(default=0.40)
    weight_acceptance_rate = models.FloatField(default=0.30)
    weight_response_time = models.FloatField(default=0.20)
    weight_reviews = models.FloatField(default=0.10)
    # Commission matrix per tier
    commission_tier1 = models.FloatField(default=0.12)  # 12% — Basic
    commission_tier2 = models.FloatField(default=0.10)  # 10% — Premium
    commission_tier3 = models.FloatField(default=0.08)  # 8% — Enterprise
    # Vendor acceptance window (minutes)
    acceptance_window_minutes = models.IntegerField(default=15)
    # Automation toggles
    auto_reassign_on_timeout = models.BooleanField(default=True)
    auto_hold_on_dispute = models.BooleanField(default=True)
    broadcast_wa_on_new_lead = models.BooleanField(default=False)
    # Metadata
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.CharField(max_length=100, default='admin')

    class Meta:
        app_label = 'admin_panel'

    def __str__(self):
        return f"SystemConfig (updated: {self.updated_at})"

    @classmethod
    def get_config(cls):
        """Always returns the single config row, creating it if it doesn't exist."""
        config, _ = cls.objects.get_or_create(config_id=1)
        return config
