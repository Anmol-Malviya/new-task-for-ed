from django.core.management.base import BaseCommand
from django.utils import timezone
import datetime
from apps.orders.all_orders.models import Order
from apps.payments.payments_all.models import Payout
from apps.payments.payments_all.razorpay_service import trigger_vendor_payout
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Checks for orders delivered 72+ hours ago and initiates their vendor payouts via Razorpay Route.'

    def handle(self, *args, **options):
        self.stdout.write("Checking for matured payouts (72+ hours post-delivery)...")
        now = timezone.now()
        threshold = now - datetime.timedelta(hours=72)
        
        # Find orders that are delivered but not paid out yet
        matured_orders = Order.objects.filter(
            status='delivered',
            delivery_confirmed_at__lte=threshold
        )
        
        count = 0
        for order in matured_orders:
            # Create Payout record if not exists
            payout, created = Payout.objects.get_or_create(
                order=order,
                defaults={
                    'vendor': order.vendor,
                    'amount': order.vendor_payout_amount,
                    'commission_rate': order.commission_rate,
                    'commission_amount': order.commission_amount,
                    'gross_amount': order.final_amount,
                    'status': 'pending',
                }
            )
            
            if payout.status == 'pending':
                self.stdout.write(f"Initiating payout {payout.payout_id} for Order {order.order_id}...")
                success, result = trigger_vendor_payout(payout.payout_id)
                if success:
                    self.stdout.write(self.style.SUCCESS(f" -> Success! Payout ID: {result}"))
                    count += 1
                else:
                    self.stdout.write(self.style.ERROR(f" -> Failed: {result}"))
                    
        self.stdout.write(self.style.SUCCESS(f"Processed {count} automated payouts."))
