import logging
from datetime import timedelta
from django.utils import timezone
from apps.queries.queries_all.models import Query
from apps.vendors.vendors_all.models import Vendor, QueryVendor, VendorServiceCategory

logger = logging.getLogger(__name__)

def assign_lead_to_vendors(query_id):
    """
    Finds the best matching vendors and creates an ordered queue (1 -> 2 -> 3).
    """
    try:
        query = Query.objects.get(query_id=query_id)
    except Query.DoesNotExist:
        return False

    if query.status != 'open':
        return False

    # 1. Match Occasion
    matching_services = VendorServiceCategory.objects.filter(occasion=query.occasion)
    vendor_ids = matching_services.values_list('vendor_id', flat=True)

    # 2. Filter vendors by City / Service Area and sort by score
    # simple match for now: vendors matching city or service areas
    vendors = Vendor.objects.filter(
        vendor_id__in=vendor_ids,
        is_active=True,
        is_approved=True,
        is_blacklisted=False,
    )
    
    if query.city_area:
        # Simplistic area match
        vendors = vendors.filter(city__icontains=query.city_area)

    if query.event_date:
        # Exclude vendors who have blocked this date manually or otherwise
        vendors = vendors.exclude(
            availability__blocked_date=query.event_date
        )

    # Order by score descending
    vendors = vendors.order_by('-score')[:3]

    if not vendors.exists():
        query.status = 'no_vendor_found'
        query.all_vendors_declined = True
        query.save()
        return False

    # Create ordered queue
    position = 1
    for vendor in vendors:
        QueryVendor.objects.create(
            query=query,
            vendor=vendor,
            vendor_position=position,
            status='pending',
            # Set expiry for first vendor
            expires_at=timezone.now() + timedelta(minutes=20) if position == 1 else None
        )
        position += 1

    query.status = 'assigned'
    query.save()
    
    # Normally we would trigger WhatsApp notification here for vendor_position=1
    # send_whatsapp_lead_notification(query, vendors[0])
    
    return True

def auto_route_expired_leads():
    """
    Called every minute (e.g. by Celery Beat or cron) to check for expired leads
    and route them to the next vendor in line.
    """
    now = timezone.now()
    expired_assignments = QueryVendor.objects.filter(
        status='pending',
        expires_at__lte=now,
        is_expired=False
    )

    for assignment in expired_assignments:
        assignment.status = 'expired'
        assignment.is_expired = True
        assignment.save()

        # Score penalty for ignoring
        vendor = assignment.vendor
        vendor.score = max(0, vendor.score - 10)
        vendor.save()

        # Find next vendor
        next_assignment = QueryVendor.objects.filter(
            query=assignment.query,
            vendor_position=assignment.vendor_position + 1
        ).first()

        if next_assignment:
            # Activate next vendor
            next_assignment.expires_at = now + timedelta(minutes=20)
            next_assignment.save()
            # send_whatsapp_lead_notification(assignment.query, next_assignment.vendor)
        else:
            # All vendors declined / expired
            query = assignment.query
            query.all_vendors_declined = True
            query.status = 'no_vendor_found'
            query.save()
            # Alert Admin Telegram could happen here
