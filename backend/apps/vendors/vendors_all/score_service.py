"""
Vendor Composite Score Calculation Service
==========================================
Calculates a vendor's algorithm score (0–100) for lead assignment priority.

Score Factors (100 pts total):
  1. City + Area Match    →  max 30 pts  (applied at lead-assignment time)
  2. Date Availability    →  max 25 pts  (availability over next 30 days)
  3. Customer Rating Avg  →  max 20 pts  (avg_rating / 5.0)
  4. Response Rate 30d    →  max 15 pts  (accepted / total assigned in 30 days)
  5. Current Lead Load    →  max 10 pts  (inverse of active leads vs cap)

Modifiers:
  - New vendor boost:  +20 pts for first 14 days after admin approval
  - Premium boost:     +15 pts always while is_premium=True
  - Decline penalty:   –10 pts for 7 days (if 2+ declines in a week)
"""

import datetime
from django.utils import timezone


# ─────────────────────────────────────────────────────────
# SCORE CALCULATION
# ─────────────────────────────────────────────────────────

def calculate_composite_score(vendor) -> int:
    """
    Calculate and persist the composite score for a single vendor.
    Returns the new integer score (0–100).
    """
    from apps.orders.all_orders.models import Order
    from apps.vendors.vendors_all.models import QueryVendor, VendorScoreLog

    now = timezone.now()
    score = 0

    # ── Factor 2: Date Availability (max 25 pts) ─────────────────────
    upcoming_30d = [now.date() + datetime.timedelta(days=i) for i in range(30)]

    blocked_dates = set(
        vendor.availability.filter(
            blocked_date__in=upcoming_30d
        ).values_list('blocked_date', flat=True)
    )
    recurring_days = set(
        vendor.availability.filter(
            block_type='recurring',
            recurring_day__isnull=False
        ).values_list('recurring_day', flat=True)
    )
    booked_dates = set(
        Order.objects.filter(
            vendor=vendor,
            service_date__date__in=upcoming_30d,
            status__in=['lead_accepted', 'price_confirmed', 'payment_received', 'd1_ready']
        ).values_list('service_date__date', flat=True)
    )

    unavailable_count = sum(
        1 for d in upcoming_30d
        if d in blocked_dates or d.weekday() in recurring_days or d in booked_dates
    )
    availability_ratio = 1.0 - (unavailable_count / 30)
    score += round(availability_ratio * 25)

    # ── Factor 3: Customer Rating Avg (max 20 pts) ───────────────────
    rating_pts = round((vendor.avg_rating / 5.0) * 20) if vendor.avg_rating else 0
    score += min(rating_pts, 20)

    # ── Factor 4: Response Rate 30d (max 15 pts) ─────────────────────
    thirty_days_ago = now - datetime.timedelta(days=30)
    total_30d = QueryVendor.objects.filter(
        vendor=vendor,
        assigned_at__gte=thirty_days_ago
    ).exclude(status='pending').count()

    accepted_30d = QueryVendor.objects.filter(
        vendor=vendor,
        assigned_at__gte=thirty_days_ago,
        status='accepted'
    ).count()

    if total_30d > 0:
        rr_30d = accepted_30d / total_30d
        vendor.response_rate = round(rr_30d * 100, 1)
    else:
        rr_30d = (vendor.response_rate / 100.0) if vendor.response_rate else 0.0

    score += round(rr_30d * 15)

    # ── Factor 5: Current Lead Load (max 10 pts) ─────────────────────
    # Fewer active leads → more capacity → higher score
    active_leads = Order.objects.filter(
        vendor=vendor,
        status__in=['lead_accepted', 'price_confirmed', 'payment_received']
    ).count()
    cap = vendor.get_lead_cap()
    load_ratio = (1.0 - min(active_leads / cap, 1.0)) if cap > 0 else 0.0
    score += round(load_ratio * 10)

    # ── Modifier: New vendor boost (+20 for first 14 days) ───────────
    if vendor.score_boost_expires_at and vendor.score_boost_expires_at > now:
        score += 20

    # ── Modifier: Premium algorithm boost (+15 always) ───────────────
    if vendor.is_premium:
        score += 15

    # ── Clamp and persist ────────────────────────────────────────────
    score = max(0, min(100, score))

    old_score = vendor.score

    # Update tier based on completed orders
    completed_orders = Order.objects.filter(vendor=vendor, status='paid_out').count()
    if vendor.is_premium and completed_orders >= 15:
        new_tier = 'premium'
    elif completed_orders >= 5:
        new_tier = 'active'
    else:
        new_tier = 'starter'

    vendor.score        = score
    vendor.response_rate = round(rr_30d * 100, 1) if total_30d > 0 else vendor.response_rate
    vendor.tier         = new_tier
    vendor.save(update_fields=['score', 'response_rate', 'tier'])

    # Log score change
    if old_score != score:
        VendorScoreLog.objects.create(
            vendor=vendor,
            old_score=old_score,
            new_score=score,
            delta=score - old_score,
            reason='Weekly recalculation (Monday 6 AM)',
        )

    return score


def apply_score_penalty(vendor, points: int, reason: str, duration_days: int = 7):
    """
    Apply a temporary score penalty to a vendor.
    Logs the deduction. The weekly recalculation will re-apply active penalties.
    """
    from apps.vendors.vendors_all.models import VendorScoreLog

    old_score = vendor.score
    new_score = max(0, old_score - points)
    vendor.score = new_score
    vendor.save(update_fields=['score'])

    VendorScoreLog.objects.create(
        vendor=vendor,
        old_score=old_score,
        new_score=new_score,
        delta=-points,
        reason=f'Penalty ({duration_days}d): {reason}',
    )
    return new_score


# ─────────────────────────────────────────────────────────
# BULK RECALCULATION (Celery / cron)
# ─────────────────────────────────────────────────────────

def recalculate_all_vendor_scores():
    """
    Called every Monday at 6 AM via Celery beat or management command.
    Recalculates composite scores for all active, non-blacklisted vendors.
    Returns a summary list.
    """
    from apps.vendors.vendors_all.models import Vendor
    vendors = Vendor.objects.filter(is_active=True, is_blacklisted=False)
    results = []
    for vendor in vendors:
        try:
            new_score = calculate_composite_score(vendor)
            results.append({'vendor_id': vendor.vendor_id, 'business_name': vendor.business_name, 'new_score': new_score})
        except Exception as exc:
            results.append({'vendor_id': vendor.vendor_id, 'error': str(exc)})
    return results


# ─────────────────────────────────────────────────────────
# LEAD ASSIGNMENT ALGORITHM
# ─────────────────────────────────────────────────────────

def assign_leads_to_best_vendors(query, count: int = 3):
    """
    Lead Assignment Algorithm — ordered list of best vendors for a query.

    Filters:
      - is_active=True, is_approved=True, is_blacklisted=False
      - City match (if available)
      - Occasion category match
      - Not blocked/booked on event_date
      - Within monthly lead cap

    Scoring: uses vendor.score + 30pt city-match bonus for final ordering.

    Returns: list of (vendor, position) tuples, max `count` entries.
    """
    from apps.vendors.vendors_all.models import Vendor, VendorAvailability, QueryVendor

    event_date = getattr(query, 'event_date', None)
    city       = getattr(query, 'location', None) or getattr(query, 'city', None)
    occasion   = getattr(query, 'occasion', None)

    # ── Base filter ──────────────────────────────────────────────────
    qs = Vendor.objects.filter(
        is_active=True,
        is_approved=True,
        is_blacklisted=False,
        onboarding_completed=True,
    )

    # ── City filter ──────────────────────────────────────────────────
    if city:
        qs = qs.filter(city__iexact=city)

    # ── Occasion filter ──────────────────────────────────────────────
    if occasion:
        qs = qs.filter(service_categories__occasion=occasion).distinct()

    # ── Availability filter on event_date ────────────────────────────
    if event_date:
        manual_blocked = VendorAvailability.objects.filter(
            blocked_date=event_date
        ).values_list('vendor_id', flat=True)
        recurring_blocked = VendorAvailability.objects.filter(
            block_type='recurring',
            recurring_day=event_date.weekday()
        ).values_list('vendor_id', flat=True)
        exclude_ids = set(list(manual_blocked) + list(recurring_blocked))
        if exclude_ids:
            qs = qs.exclude(vendor_id__in=exclude_ids)

    # ── Lead cap filter ──────────────────────────────────────────────
    now = timezone.now()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    candidates = []
    for v in qs.order_by('-score'):
        this_month_leads = QueryVendor.objects.filter(
            vendor=v,
            assigned_at__gte=month_start
        ).count()
        if this_month_leads >= v.get_lead_cap():
            continue  # Cap reached

        # City-match bonus for tie-breaking (factor 1: 30 pts)
        area_bonus = 30 if city and v.city and v.city.lower() == city.lower() else 0
        effective_score = v.score + area_bonus
        candidates.append((v, effective_score))

    # ── Sort and select top N ────────────────────────────────────────
    candidates.sort(key=lambda x: x[1], reverse=True)
    return [(v, idx + 1) for idx, (v, _) in enumerate(candidates[:count])]


# ─────────────────────────────────────────────────────────
# DECLINE PENALTY CHECKER
# ─────────────────────────────────────────────────────────

def check_and_apply_decline_penalty(vendor):
    """
    Check if vendor has had 2+ declines in the last 7 days.
    If so, apply -10 score penalty for 7 days.
    """
    from apps.vendors.vendors_all.models import QueryVendor, VendorScoreLog

    one_week_ago = timezone.now() - datetime.timedelta(days=7)
    decline_count = QueryVendor.objects.filter(
        vendor=vendor,
        status__in=['declined', 'expired'],
        declined_at__gte=one_week_ago
    ).count()

    if decline_count >= 2:
        # Check if penalty already applied this week
        already_penalised = VendorScoreLog.objects.filter(
            vendor=vendor,
            reason__icontains='decline penalty',
            timestamp__gte=one_week_ago,
        ).exists()
        if not already_penalised:
            apply_score_penalty(
                vendor,
                points=10,
                reason='2+ declines in 7 days (response rate penalty)',
                duration_days=7,
            )
            return True
    return False


# ─────────────────────────────────────────────────────────
# TIER UPGRADE DETECTION
# ─────────────────────────────────────────────────────────

def get_tier_upgrade_notification(vendor) -> dict | None:
    """
    Returns notification info if the vendor just crossed a tier threshold,
    or None if no upgrade occurred.
    """
    from apps.orders.all_orders.models import Order

    completed = Order.objects.filter(vendor=vendor, status='paid_out').count()
    old_tier  = vendor.tier

    if completed >= 15 and vendor.is_premium and old_tier != 'premium':
        return {
            'new_tier': 'premium',
            'message': '🌟 Congratulations! You\'ve unlocked the EventDhara Partner tier!',
            'benefits': ['10% commission', '40 leads/month', '+15 algo boost', 'Partner badge'],
        }
    if completed >= 5 and old_tier == 'starter':
        return {
            'new_tier': 'active',
            'message': '✅ You\'ve reached Active Vendor status (12% commission, up to 18 leads/month)',
            'benefits': ['12% commission (down from 15%)', 'Up to 18 leads/month', 'Verified badge'],
        }
    return None


# ─────────────────────────────────────────────────────────
# LOW CONVERSION AUDIT TRIGGER
# ─────────────────────────────────────────────────────────

def detect_low_conversion_vendors(min_leads: int = 20, max_close_rate: float = 0.25):
    """
    Detects vendors with suspiciously low platform conversion rates.
    Default: 20+ leads but fewer than 25% closed → possible bypass.
    Returns list of suspicious vendor IDs with their conversion data.
    """
    from apps.vendors.vendors_all.models import Vendor, QueryVendor
    from apps.orders.all_orders.models import Order

    suspects = []
    for vendor in Vendor.objects.filter(is_active=True, is_blacklisted=False):
        total_assigned = QueryVendor.objects.filter(vendor=vendor, status='accepted').count()
        if total_assigned < min_leads:
            continue
        closed = Order.objects.filter(vendor=vendor, status='paid_out').count()
        rate = closed / total_assigned if total_assigned > 0 else 0.0
        if rate < max_close_rate:
            suspects.append({
                'vendor_id': vendor.vendor_id,
                'business_name': vendor.business_name,
                'accepted_leads': total_assigned,
                'closed_orders': closed,
                'conversion_rate': round(rate * 100, 1),
                'city': vendor.city,
            })
    return suspects
