from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.vendors.vendors_all.models import Vendor, VendorScoreLog
from apps.queries.queries_all.models import QueryVendor
from apps.orders.all_orders.models import Order
import datetime

class Command(BaseCommand):
    help = 'Recalculates scores for all vendors based on response rate, rating, and completion rate. Designed to run every Monday.'

    def handle(self, *args, **options):
        self.stdout.write("Starting weekly vendor score recalculation...")
        vendors = Vendor.objects.filter(is_active=True, is_approved=True)
        now = timezone.now()
        thirty_days_ago = now - datetime.timedelta(days=30)
        
        count = 0
        for vendor in vendors:
            old_score = vendor.score
            
            # --- 1. Response Rate (Last 30 Days) ---
            recent_queries = QueryVendor.objects.filter(vendor=vendor, query__time_stamp__gte=thirty_days_ago)
            total_recent = recent_queries.count()
            
            if total_recent > 0:
                responded = recent_queries.filter(status__in=['accepted', 'declined']).count()
                vendor.response_rate = round((responded / total_recent) * 100, 2)
            else:
                # If no leads recent, keep response rate optimistic or hold steady
                if vendor.response_rate == 0:
                    vendor.response_rate = 100.0  # Default good standing
                    
            # --- 2. Completion Rate ---
            total_orders = vendor.orders.count()
            if total_orders > 0:
                completed = vendor.orders.filter(status__in=['delivered', 'paid_out']).count()
                cancelled = vendor.orders.filter(status='cancelled').count()
                
                if (total_orders - cancelled) > 0:
                     vendor.completion_rate = round((completed / (total_orders - cancelled)) * 100, 2)
                else:
                     vendor.completion_rate = 100.0
            else:
                vendor.completion_rate = 100.0

            # --- 3. Base Calculation ---
            # Score formula: 
            # 50 base points for just being here + 
            # (Response Rate / 100 * 25) + 
            # (Completion Rate / 100 * 15) + 
            # (Avg Rating / 5.0 * 10)
            
            base_score = 50
            resp_points = (vendor.response_rate / 100) * 25
            comp_points = (vendor.completion_rate / 100) * 15
            rating_points = (vendor.avg_rating / 5.0) * 10 if vendor.avg_rating > 0 else 10 # give benefit if no rating

            new_score = int(base_score + resp_points + comp_points + rating_points)

            # Check if active boost
            if vendor.score_boost_expires_at and vendor.score_boost_expires_at > now:
                new_score += 20
                
            # Floor / Ceiling
            new_score = max(0, min(new_score, 100))
            
            if old_score != new_score:
                VendorScoreLog.objects.create(
                    vendor=vendor,
                    old_score=old_score,
                    new_score=new_score,
                    delta=new_score - old_score,
                    reason=f'Weekly Recalc (Resp: {vendor.response_rate}%, Comp: {vendor.completion_rate}%, Rate: {vendor.avg_rating})'
                )
            
            vendor.score = new_score
            vendor.save(update_fields=['score', 'response_rate', 'completion_rate'])
            count += 1
            
        self.stdout.write(self.style.SUCCESS(f"Recalculated scores for {count} vendors."))
