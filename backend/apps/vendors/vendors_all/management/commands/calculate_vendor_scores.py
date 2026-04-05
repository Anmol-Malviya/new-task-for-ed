"""
calculate_vendor_scores management command
==========================================
Run every Monday at 6 AM (via Celery beat or cron):
  python manage.py calculate_vendor_scores

Uses the composite 5-factor score algorithm from score_service.py.
Also updates vendor tier, runs decline-penalty checks, and triggers
audit alerts for low-conversion vendors.
"""
from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone
from apps.vendors.vendors_all.score_service import (
    recalculate_all_vendor_scores,
    check_and_apply_decline_penalty,
    detect_low_conversion_vendors,
)
from apps.vendors.vendors_all.models import Vendor


class Command(BaseCommand):
    help = (
        'Recalculates composite scores for all active vendors (every Monday). '
        'Uses 5-factor algorithm: availability, rating, response rate, lead load + modifiers.'
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--vendor-id',
            type=int,
            default=None,
            help='Recalculate score for a single vendor (by ID) instead of all.',
        )
        parser.add_argument(
            '--audit',
            action='store_true',
            default=False,
            help='Also run low-conversion audit and print suspects.',
        )

    def handle(self, *args, **options):
        vendor_id = options.get('vendor_id')

        if vendor_id:
            # ── Single vendor mode ───────────────────────────────────
            try:
                vendor = Vendor.objects.get(vendor_id=vendor_id)
            except Vendor.DoesNotExist:
                raise CommandError(f'Vendor #{vendor_id} not found.')

            from apps.vendors.vendors_all.score_service import calculate_composite_score
            new_score = calculate_composite_score(vendor)
            self.stdout.write(self.style.SUCCESS(
                f'✓ Vendor #{vendor_id} ({vendor.business_name}): score → {new_score}, tier → {vendor.tier}'
            ))
        else:
            # ── Bulk recalculation ───────────────────────────────────
            self.stdout.write('⏳  Starting weekly vendor score recalculation (composite 5-factor)...')
            results = recalculate_all_vendor_scores()

            ok  = [r for r in results if 'error' not in r]
            err = [r for r in results if 'error' in r]

            self.stdout.write(self.style.SUCCESS(f'✓  Recalculated scores for {len(ok)} vendors.'))
            if err:
                self.stdout.write(self.style.WARNING(f'⚠  Errors for {len(err)} vendors:'))
                for e in err:
                    self.stdout.write(f"   vendor_id={e['vendor_id']}: {e['error']}")

        # ── Decline penalty check ────────────────────────────────────
        self.stdout.write('🔍  Checking decline penalties...')
        penalised = 0
        for vendor in Vendor.objects.filter(is_active=True, is_blacklisted=False):
            if check_and_apply_decline_penalty(vendor):
                penalised += 1
        if penalised:
            self.stdout.write(self.style.WARNING(f'⚠  Applied decline penalty to {penalised} vendors.'))
        else:
            self.stdout.write('✓  No decline penalties this week.')

        # ── Low-conversion audit ─────────────────────────────────────
        if options.get('audit'):
            self.stdout.write('🔍  Running low-conversion audit...')
            suspects = detect_low_conversion_vendors()
            if suspects:
                self.stdout.write(self.style.WARNING(f'⚠  {len(suspects)} vendors flagged for audit:'))
                for s in suspects:
                    self.stdout.write(
                        f"   #{s['vendor_id']} {s['business_name']} — "
                        f"{s['accepted_leads']} leads, {s['closed_orders']} closed "
                        f"({s['conversion_rate']}%) [{s['city']}]"
                    )
                # Auto-create admin alerts
                from apps.admin_panel.models import AdminAlert
                for s in suspects:
                    AdminAlert.objects.get_or_create(
                        vendor_id=s['vendor_id'],
                        title=f"Low conversion audit: {s['business_name']}",
                        defaults={
                            'severity': 'WARNING',
                            'description': (
                                f"{s['accepted_leads']} leads accepted, only "
                                f"{s['closed_orders']} closed ({s['conversion_rate']}%). "
                                f"Possible platform bypass — review call logs."
                            ),
                            'is_resolved': False,
                        }
                    )
            else:
                self.stdout.write('✓  No low-conversion vendors detected.')

        self.stdout.write(self.style.SUCCESS('✅  Score recalculation complete.'))

