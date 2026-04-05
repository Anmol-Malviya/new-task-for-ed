from django.core.management.base import BaseCommand
from django.utils import timezone
import datetime
from apps.orders.all_orders.models import Order
from apps.payments.payments_all.models import Payout
from apps.admin_panel.models import Dispute

class Command(BaseCommand):
    help = 'Processes escrow payouts for orders that are delivered and cross the 72-hour mark with no active disputes.'

    def handle(self, *args, **kwargs):
        now = timezone.now()
        # Find orders bounded for payout triggers
        # Payout triggers on Client Confirmation OR 72h passes (no dispute)
        # Note: If client confirmations trigger immediately, that's done via a separate view.
        # This script acts as the 72h fallback.
        
        target_time = now - datetime.timedelta(hours=72)
        
        orders = Order.objects.filter(
            status='delivered',
            delivery_confirmed_at__lte=target_time,
            has_dispute=False,
            payout_status='pending'
        ).select_related('vendor')
        
        processed_count = 0
        for order in orders:
            # Check for unresolved disputes specifically bounded by the order
            active_dispute = Dispute.objects.filter(order_id=order.order_id, status__in=['OPEN', 'UNDER_REVIEW']).exists()
            if active_dispute:
                order.has_dispute = True
                order.payout_status = 'held'
                order.save(update_fields=['has_dispute', 'payout_status'])
                self.stdout.write(self.style.WARNING(f"Order #{order.order_id} has an active dispute. Holding payout."))
                continue

            # Ensure Payout fields are calculated properly from vendor tiers
            # (which handles Tiered Commission Logic: 15% / 12% / 10%)
            if order.vendor_payout_amount is None:
                order.commission_rate = order.vendor.get_commission_rate()
                order.calculate_payout()
            
            # Create the Payout record
            payout_record, created = Payout.objects.get_or_create(
                order=order,
                defaults={
                    'vendor': order.vendor,
                    'amount': order.vendor_payout_amount,
                    'commission_rate': order.commission_rate,
                    'commission_amount': order.commission_amount,
                    'gross_amount': order.final_amount,
                    'razorpay_linked_account': order.vendor.bank_details.razorpay_linked_account_id if hasattr(order.vendor, 'bank_details') else None,
                    'status': 'processing',
                    'initiated_at': now
                }
            )
            
            if created:
                order.status = 'paid_out'
                order.payout_status = 'processing'
                order.payout_triggered_at = now
                order.save(update_fields=['status', 'payout_status', 'payout_triggered_at'])
                processed_count += 1
                
                # Logic to trigger Razorpay Route transfers goes here
                # RazorpayService.create_transfer(...)
                
                self.stdout.write(self.style.SUCCESS(f"Processed payout for Order #{order.order_id} -> Payout #{payout_record.payout_id}"))

        self.stdout.write(self.style.SUCCESS(f"Escrow processor finished. 72h trigger initiated '{processed_count}' payouts."))
