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

TIER_CHOICES = [
    ('starter', 'Starter'),
    ('active', 'Active'),
    ('premium', 'Premium'),
]


class Vendor(models.Model):
    VENDOR_TYPES = [
        ('Photographer', 'Photographer'),
        ('Decorator', 'Decorator'),
        ('Caterer', 'Caterer'),
        ('Venue Provider', 'Venue Provider'),
        ('Makeup Artist', 'Makeup Artist'),
        ('DJ / Musician', 'DJ / Musician'),
        ('Event Planner', 'Event Planner'),
        ('Other', 'Other'),
    ]

    vendor_id           = models.AutoField(primary_key=True)
    name                = models.CharField(max_length=255)
    email               = models.EmailField(unique=True)
    password            = models.CharField(max_length=255)
    business_name       = models.CharField(max_length=255)
    owner_name          = models.CharField(max_length=255, null=True, blank=True)
    vendor_type         = models.CharField(max_length=100, choices=VENDOR_TYPES, null=True, blank=True)
    description         = models.TextField(null=True, blank=True)
    phone               = models.CharField(max_length=20, null=True, blank=True)
    whatsapp_number     = models.CharField(max_length=20, null=True, blank=True)
    whatsapp_verified   = models.BooleanField(default=False)
    address             = models.TextField(null=True, blank=True)
    city                = models.CharField(max_length=100, null=True, blank=True)
    state               = models.CharField(max_length=100, null=True, blank=True)
    country             = models.CharField(max_length=100, null=True, blank=True)
    service_areas       = models.JSONField(default=list, blank=True)
    aadhar_no           = models.CharField(max_length=20, null=True, blank=True)

    # Status flags
    is_active           = models.BooleanField(default=False)
    is_approved         = models.BooleanField(default=False)
    is_verified         = models.BooleanField(default=False)
    is_blacklisted      = models.BooleanField(default=False)
    is_premium          = models.BooleanField(default=False)

    # Timestamps
    approved_at         = models.DateTimeField(null=True, blank=True)
    premium_since       = models.DateTimeField(null=True, blank=True)
    premium_expires_at  = models.DateTimeField(null=True, blank=True)
    score_boost_expires_at = models.DateTimeField(null=True, blank=True)
    created_at          = models.DateTimeField(default=timezone.now)

    # Performance metrics
    score               = models.IntegerField(default=50)
    response_rate       = models.FloatField(default=0.0)
    avg_rating          = models.FloatField(default=0.0)
    completion_rate     = models.FloatField(default=0.0)
    tier                = models.CharField(max_length=20, choices=TIER_CHOICES, default='starter')

    # Lead management
    monthly_lead_count  = models.IntegerField(default=0)
    max_orders_per_day  = models.IntegerField(default=2)

    # Onboarding
    onboarding_step         = models.IntegerField(default=1)
    onboarding_completed    = models.BooleanField(default=False)

    # Razorpay
    razorpay_subscription_id = models.CharField(max_length=255, null=True, blank=True)
    razorpay_linked_account  = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return self.business_name

    def get_commission_rate(self):
        if self.is_premium:
            return 0.10
        completed = self.orders.filter(status='paid_out').count()
        if completed >= 5:
            return 0.12
        return 0.15

    def get_lead_cap(self):
        if self.is_premium:
            return 40
        completed = self.orders.filter(status='paid_out').count()
        if completed >= 5:
            return 18
        return 8

    def update_tier(self):
        completed = self.orders.filter(status='paid_out').count()
        if self.is_premium and completed >= 15:
            self.tier = 'premium'
        elif completed >= 5:
            self.tier = 'active'
        else:
            self.tier = 'starter'


class VendorServiceCategory(models.Model):
    vendor    = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='service_categories')
    occasion  = models.CharField(max_length=50, choices=OCCASION_CHOICES)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ('vendor', 'occasion')

    def __str__(self):
        return f"{self.vendor.business_name} — {self.occasion}"


class VendorPhoto(models.Model):
    REJECTION_REASONS = [
        ('blurry', 'Image is blurry'),
        ('stock', 'Stock photo detected'),
        ('irrelevant', 'Not relevant to services'),
        ('low_res', 'Resolution too low'),
        ('other', 'Other'),
    ]

    vendor          = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='photos')
    photo_url       = models.URLField(max_length=500)
    cloudinary_id   = models.CharField(max_length=255, null=True, blank=True)
    is_approved     = models.BooleanField(null=True, blank=True)
    rejection_reason = models.CharField(max_length=50, choices=REJECTION_REASONS, null=True, blank=True)
    occasion_tag    = models.CharField(max_length=50, choices=OCCASION_CHOICES, null=True, blank=True)
    uploaded_at     = models.DateTimeField(default=timezone.now)
    approved_at     = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Photo for {self.vendor.business_name} — {'Approved' if self.is_approved else 'Pending'}"


class VendorBankDetails(models.Model):
    VERIFICATION_STATUS = [
        ('pending', 'Pending'),
        ('verified', 'Verified'),
        ('failed', 'Failed'),
    ]

    vendor                   = models.OneToOneField(Vendor, on_delete=models.CASCADE, related_name='bank_details')
    account_holder           = models.CharField(max_length=255)
    account_number           = models.CharField(max_length=50)
    ifsc_code                = models.CharField(max_length=20)
    bank_name                = models.CharField(max_length=255)
    branch_name              = models.CharField(max_length=255, null=True, blank=True)
    razorpay_linked_account_id = models.CharField(max_length=255, null=True, blank=True)
    verification_status      = models.CharField(max_length=20, choices=VERIFICATION_STATUS, default='pending')
    submitted_at             = models.DateTimeField(default=timezone.now)
    verified_at              = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.vendor.business_name} — {self.bank_name} ({self.verification_status})"


class VendorAgreement(models.Model):
    vendor                    = models.OneToOneField(Vendor, on_delete=models.CASCADE, related_name='agreement')
    non_solicitation_clause   = models.BooleanField(default=False)
    commission_rate_agreed    = models.BooleanField(default=False)
    dispute_policy_agreed     = models.BooleanField(default=False)
    platform_rules_agreed     = models.BooleanField(default=False)
    signed_at                 = models.DateTimeField(null=True, blank=True)
    ip_address                = models.GenericIPAddressField(null=True, blank=True)

    def is_fully_signed(self):
        return all([
            self.non_solicitation_clause,
            self.commission_rate_agreed,
            self.dispute_policy_agreed,
            self.platform_rules_agreed,
        ])

    def __str__(self):
        return f"Agreement: {self.vendor.business_name} — {'Signed' if self.signed_at else 'Unsigned'}"


class VendorAvailability(models.Model):
    BLOCK_TYPES = [
        ('manual', 'Personal Holiday'),
        ('recurring', 'Recurring (Weekly)'),
        ('auto', 'Auto-blocked (Max Orders)'),
    ]
    RECURRING_DAYS = [
        (0, 'Monday'), (1, 'Tuesday'), (2, 'Wednesday'),
        (3, 'Thursday'), (4, 'Friday'), (5, 'Saturday'), (6, 'Sunday'),
    ]

    vendor        = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='availability')
    blocked_date  = models.DateField(null=True, blank=True)
    block_type    = models.CharField(max_length=20, choices=BLOCK_TYPES, default='manual')
    recurring_day = models.IntegerField(choices=RECURRING_DAYS, null=True, blank=True)
    reason        = models.CharField(max_length=255, null=True, blank=True)
    created_at    = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.vendor.business_name} — Blocked: {self.blocked_date or f'Every {self.get_recurring_day_display()}'}"


class VendorScoreLog(models.Model):
    vendor      = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='score_logs')
    old_score   = models.IntegerField()
    new_score   = models.IntegerField()
    delta       = models.IntegerField()
    reason      = models.CharField(max_length=255)
    timestamp   = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.vendor.business_name}: {self.old_score} → {self.new_score} ({self.reason})"


class VendorViolation(models.Model):
    VIOLATION_TYPES = [
        ('share_phone', 'Shared personal phone'),
        ('share_insta', 'Shared Instagram/business name'),
        ('ask_upi', 'Asked for direct UPI'),
        ('direct_discount', 'Offered direct booking discount'),
        ('external_booking', 'Booked client outside platform'),
        ('other', 'Other'),
    ]
    SEVERITY = [
        ('warning', 'Warning'),
        ('suspension', 'Suspension'),
        ('ban', 'Permanent Ban'),
    ]

    vendor        = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='violations')
    violation_type = models.CharField(max_length=50, choices=VIOLATION_TYPES)
    severity      = models.CharField(max_length=20, choices=SEVERITY)
    description   = models.TextField(null=True, blank=True)
    action_taken  = models.TextField(null=True, blank=True)
    reported_at   = models.DateTimeField(default=timezone.now)
    resolved      = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.vendor.business_name}: {self.violation_type} ({self.severity})"


class QueryVendor(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined'),
        ('expired', 'Expired'),
        ('replaced', 'Replaced'),
    ]

    query_vendor_id   = models.AutoField(primary_key=True)
    query             = models.ForeignKey('queries_all.Query', on_delete=models.CASCADE, related_name='vendor_assignments')
    vendor            = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='lead_assignments')
    vendor_position   = models.IntegerField(default=1)
    has_accepted      = models.BooleanField(default=False)
    status            = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    assigned_at       = models.DateTimeField(default=timezone.now)
    expires_at        = models.DateTimeField(null=True, blank=True)
    accepted_at       = models.DateTimeField(null=True, blank=True)
    declined_at       = models.DateTimeField(null=True, blank=True)
    is_expired        = models.BooleanField(default=False)
    has_been_replaced = models.BooleanField(default=False)
    duration          = models.IntegerField(null=True, blank=True)
    last_message_at   = models.DateTimeField(null=True, blank=True)
    mode_office       = models.BooleanField(null=True, blank=True)

    def __str__(self):
        return f"Lead #{self.query_id} → {self.vendor.business_name} (pos {self.vendor_position}: {self.status})"


class VendorPremiumLog(models.Model):
    EVENT_CHOICES = [
        ('subscribed',   'Subscribed'),
        ('renewed',      'Renewed'),
        ('cancelled',    'Cancelled'),
        ('expired',      'Expired'),
        ('halted',       'Payment Halted'),
    ]

    vendor                   = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='premium_logs')
    event                    = models.CharField(max_length=20, choices=EVENT_CHOICES)
    razorpay_subscription_id = models.CharField(max_length=255, null=True, blank=True)
    razorpay_payment_id      = models.CharField(max_length=255, null=True, blank=True)
    amount                   = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    notes                    = models.TextField(null=True, blank=True)
    timestamp                = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.vendor.business_name} — Premium {self.event} @ {self.timestamp:%Y-%m-%d}"
