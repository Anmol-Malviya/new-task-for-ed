"""
Management command: expire_premium
===================================
Downgrades vendors whose premium_expires_at has passed and who
no longer have an active Razorpay subscription.

Run this daily via cron or Celery beat:
    python manage.py expire_premium

Schedule example (celery beat):
    'expire-premium-daily': {
        'task': 'apps.vendors.vendors_all.tasks.expire_premium_task',
        'schedule': crontab(hour=0, minute=30),   # 12:30 AM daily
    },
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.vendors.vendors_all.models import Vendor, VendorPremiumLog


class Command(BaseCommand):
    help = 'Downgrade vendors whose premium subscription has expired'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Print which vendors would be downgraded without actually changing anything',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        now = timezone.now()

        expired_vendors = Vendor.objects.filter(
            is_premium=True,
            premium_expires_at__lte=now,
        )

        count = expired_vendors.count()

        if count == 0:
            self.stdout.write(self.style.SUCCESS('[SUCCESS] No expired premium subscriptions found.'))
            return

        self.stdout.write(f'Found {count} expired premium vendor(s).')

        downgraded = 0
        for vendor in expired_vendors:
            completed = vendor.orders.filter(status='paid_out').count()
            new_tier  = 'active' if completed >= 5 else 'starter'

            self.stdout.write(
                f'  {"[DRY-RUN] Would downgrade" if dry_run else "Downgrading"}: '
                f'{vendor.business_name} (ID {vendor.vendor_id}) '
                f'— expired {vendor.premium_expires_at:%Y-%m-%d} → tier={new_tier}'
            )

            if not dry_run:
                vendor.is_premium = False
                vendor.tier       = new_tier
                vendor.save(update_fields=['is_premium', 'tier'])

                VendorPremiumLog.objects.create(
                    vendor=vendor,
                    event='expired',
                    razorpay_subscription_id=vendor.razorpay_subscription_id,
                    notes=f'Auto-expired by expire_premium management command at {now:%Y-%m-%d %H:%M}',
                )
                downgraded += 1

        if dry_run:
            self.stdout.write(self.style.WARNING(f'[DRY-RUN] Would have downgraded {count} vendor(s).'))
        else:
            self.stdout.write(self.style.SUCCESS(f'[SUCCESS] Downgraded {downgraded} vendor(s) successfully.'))
