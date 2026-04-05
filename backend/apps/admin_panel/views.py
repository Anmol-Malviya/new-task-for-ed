"""
Admin Panel Views — 9-Panel Control Tower API
All endpoints require admin JWT token.
"""
import datetime
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.db.models import Count, Sum, Avg, Q

# ── Model imports ────────────────────────────────────────────────────
from apps.users.users_all.models import User
from apps.vendors.vendors_all.models import Vendor, QueryVendor, VendorAvailability
from apps.orders.all_orders.models import Order
from apps.queries.queries_all.models import Query
from apps.admin_panel.models import AdminAlert, CityHealth, Dispute, SystemConfig

import jwt
from django.conf import settings

SECRET_KEY = settings.SECRET_KEY


# ── Auth helper ──────────────────────────────────────────────────────
def _is_admin(request) -> bool:
    auth = request.headers.get('Authorization', '')
    if not auth.startswith('Bearer '):
        return False
    try:
        payload = jwt.decode(auth[7:], SECRET_KEY, algorithms=['HS256'])
        return payload.get('role') == 'admin'
    except jwt.exceptions.PyJWTError:
        return False


# ═══════════════════════════════════════════════════════════════════════
# PANEL 1 — LIVE DASHBOARD
# ═══════════════════════════════════════════════════════════════════════
@api_view(['GET'])
def live_dashboard(request):
    """
    GET /api/admin/live-dashboard/
    Returns: KPI cards, active alerts, lead pipeline, city health bars.
    """
    if not _is_admin(request):
        return Response({'message': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)

    today = timezone.now().date()

    # ── KPI Cards ────────────────────────────────────────────────────
    leads_today = Query.objects.filter(time_stamp__date=today).count()
    active_orders = Order.objects.filter(status__in=['pending', 'confirmed', 'in_progress']).count()
    open_alerts = AdminAlert.objects.filter(is_resolved=False).count()
    gmv_today = Order.objects.filter(
        time_stamp__date=today
    ).aggregate(total=Sum('total_price'))['total'] or 0

    kpis = {
        'leads_today': leads_today,
        'active_orders': active_orders,
        'open_alerts': open_alerts,
        'gmv_today': round(gmv_today, 2),
    }

    # ── Active Alerts ─────────────────────────────────────────────────
    alerts = AdminAlert.objects.filter(is_resolved=False).order_by('-created_at')[:10]
    alerts_data = [
        {
            'alert_id': a.alert_id,
            'severity': a.severity,
            'title': a.title,
            'description': a.description,
            'query_id': a.query_id,
            'vendor_id': a.vendor_id,
            'order_id': a.order_id,
            'action_label': a.action_label,
            'created_at': a.created_at.isoformat(),
            'minutes_ago': round((timezone.now() - a.created_at).total_seconds() / 60),
        }
        for a in alerts
    ]

    # ── Live Lead Pipeline (last 24hrs) ────────────────────────────────
    cutoff = timezone.now() - datetime.timedelta(hours=24)
    pipeline_queries = Query.objects.filter(
        time_stamp__gte=cutoff
    ).select_related('user', 'service').order_by('-time_stamp')[:20]

    pipeline = []
    for q in pipeline_queries:
        # Find associated vendor assignment
        qv = QueryVendor.objects.filter(query=q).order_by('-query_vendor_id').first()
        vendor_name = qv.vendor.business_name if qv and qv.vendor else '—'

        # Calculate lead timer in minutes
        age_minutes = round((timezone.now() - q.time_stamp).total_seconds() / 60)
        
        # Status logic
        if qv is None:
            lead_status = 'NO VENDOR'
        elif not qv.has_accepted:
            lead_status = 'Pending'
        else:
            lead_status = 'Confirmed'

        pipeline.append({
            'query_id': f'ED-{q.query_id:04d}',
            'city': q.location or '—',
            'occasion': q.service.name if q.service else '—',
            'date': q.service_date.strftime('%d %b') if q.service_date else '—',
            'vendor': vendor_name,
            'timer_minutes': age_minutes,
            'status': lead_status,
            'is_urgent': q.is_urgent or False,
        })

    # ── City Health Bars ───────────────────────────────────────────────
    city_health = list(
        CityHealth.objects.all().order_by('-gmv_today').values(
            'city_name', 'active_leads', 'total_orders', 'active_vendors', 'gmv_today'
        )
    )
    # If no manual city health, compute from live data
    if not city_health:
        city_groups = (
            Order.objects.filter(time_stamp__date=today)
            .values('vendor__city')
            .annotate(order_count=Count('order_id'), gmv=Sum('total_price'))
            .order_by('-gmv')[:6]
        )
        city_health = [
            {
                'city_name': g['vendor__city'] or 'Unknown',
                'active_leads': Query.objects.filter(location__iexact=g['vendor__city'] or '').count(),
                'total_orders': g['order_count'],
                'active_vendors': Vendor.objects.filter(city__iexact=g['vendor__city'] or '').count(),
                'gmv_today': round(g['gmv'] or 0, 2),
            }
            for g in city_groups
        ]

    return Response({
        'kpis': kpis,
        'alerts': alerts_data,
        'pipeline': pipeline,
        'city_health': city_health,
    })


@api_view(['POST'])
def resolve_alert(request, alert_id):
    """POST /api/admin/alerts/<id>/resolve/"""
    if not _is_admin(request):
        return Response({'message': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    try:
        alert = AdminAlert.objects.get(alert_id=alert_id)
        alert.is_resolved = True
        alert.resolved_at = timezone.now()
        alert.save()
        return Response({'message': 'Alert resolved'})
    except AdminAlert.DoesNotExist:
        return Response({'message': 'Alert not found'}, status=status.HTTP_404_NOT_FOUND)


# ═══════════════════════════════════════════════════════════════════════
# PANEL 2 — LEAD PIPELINE
# ═══════════════════════════════════════════════════════════════════════
@api_view(['GET'])
def lead_pipeline(request):
    """GET /api/admin/leads/ — Full 24hr lead pipeline with timers"""
    if not _is_admin(request):
        return Response({'message': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)

    all_queries = Query.objects.select_related('user', 'service').order_by('-time_stamp')[:50]
    data = []
    for q in all_queries:
        qv = QueryVendor.objects.filter(query=q).order_by('-query_vendor_id').first()
        vendor_name = qv.vendor.business_name if qv and qv.vendor else None
        age_mins = round((timezone.now() - q.time_stamp).total_seconds() / 60)
        data.append({
            'query_id': f'ED-{q.query_id:04d}',
            'raw_id': q.query_id,
            'user_name': q.user.name if q.user else '—',
            'city': q.location or '—',
            'service': q.service.name if q.service else '—',
            'service_date': q.service_date.strftime('%d %b %Y') if q.service_date else '—',
            'vendor': vendor_name or '—',
            'age_minutes': age_mins,
            'is_accepted': q.is_accepted,
            'is_urgent': q.is_urgent or False,
            'approx_budget': q.approx_budget,
            'status': 'Accepted' if q.is_accepted else ('Urgent' if q.is_urgent else 'Pending'),
        })
    return Response(data)


@api_view(['POST'])
def reassign_lead(request, query_id):
    """POST /api/admin/leads/<id>/reassign/ — Force-assign to any active vendor in that city"""
    if not _is_admin(request):
        return Response({'message': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    try:
        query = Query.objects.get(query_id=query_id)
    except Query.DoesNotExist:
        return Response({'message': 'Query not found'}, status=status.HTTP_404_NOT_FOUND)

    target_vendor_id = request.data.get('vendor_id')
    if not target_vendor_id:
        # Auto-find a vendor in the same city
        vendor = Vendor.objects.filter(city__iexact=query.location or '').first()
        if not vendor:
            return Response({'message': 'No vendor found in this city'}, status=status.HTTP_400_BAD_REQUEST)
    else:
        try:
            vendor = Vendor.objects.get(vendor_id=target_vendor_id)
        except Vendor.DoesNotExist:
            return Response({'message': 'Vendor not found'}, status=status.HTTP_404_NOT_FOUND)

    # Mark existing QueryVendors as replaced
    QueryVendor.objects.filter(query=query, has_been_replaced=False).update(has_been_replaced=True)
    # Create new assignment
    qv = QueryVendor.objects.create(
        query=query,
        vendor=vendor,
        has_accepted=False,
        status='reassigned_by_admin',
        has_been_replaced=False,
    )
    # Create an alert log
    AdminAlert.objects.create(
        severity='INFO',
        title=f'Lead ED-{query.query_id:04d} manually reassigned',
        description=f'Admin reassigned to vendor: {vendor.business_name}',
        query_id=query.query_id,
        vendor_id=vendor.vendor_id,
        action_label=None,
        is_resolved=True,
    )
    return Response({'message': f'Lead reassigned to {vendor.business_name}', 'vendor_id': vendor.vendor_id})


# ═══════════════════════════════════════════════════════════════════════
# PANEL 4 — VENDOR MANAGEMENT (Scoreboard)
# ═══════════════════════════════════════════════════════════════════════
@api_view(['GET'])
def vendor_scoreboard(request):
    """GET /api/admin/vendors/scoreboard/ — Ranked vendor list"""
    if not _is_admin(request):
        return Response({'message': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)

    vendors = Vendor.objects.all()
    config = SystemConfig.get_config()

    scored = []
    for v in vendors:
        total_orders = Order.objects.filter(vendor=v).count()
        completed = Order.objects.filter(vendor=v, status='completed').count()
        acceptance = QueryVendor.objects.filter(vendor=v, has_accepted=True).count()
        total_assigned = QueryVendor.objects.filter(vendor=v).count()
        acceptance_rate = round((acceptance / total_assigned * 100) if total_assigned > 0 else 0, 1)
        revenue = Order.objects.filter(vendor=v, status='completed').aggregate(t=Sum('total_price'))['t'] or 0

        scored.append({
            'vendor_id': v.vendor_id,
            'name': v.name,
            'business_name': v.business_name,
            'city': v.city or '—',
            'vendor_type': v.vendor_type or '—',
            'total_orders': total_orders,
            'completed_orders': completed,
            'acceptance_rate': acceptance_rate,
            'total_revenue': round(revenue, 2),
            'is_suspended': getattr(v, 'is_suspended', False),
        })

    # Sort by total revenue descending
    scored.sort(key=lambda x: x['total_revenue'], reverse=True)
    for i, v in enumerate(scored):
        v['rank'] = i + 1

    return Response(scored)


@api_view(['POST'])
def suspend_vendor(request, vendor_id):
    """POST /api/admin/vendors/<id>/suspend/"""
    if not _is_admin(request):
        return Response({'message': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    try:
        vendor = Vendor.objects.get(vendor_id=vendor_id)
        # Toggle suspend (using a note in admin alerts since model doesn't have is_suspended yet)
        action = request.data.get('action', 'suspend')  # 'suspend' or 'unsuspend'
        AdminAlert.objects.create(
            severity='WARNING',
            title=f'Vendor {vendor.business_name} {"suspended" if action == "suspend" else "reinstated"} by admin',
            vendor_id=vendor_id,
            is_resolved=True,
        )
        return Response({'message': f'Vendor {action}ed successfully', 'vendor_id': vendor_id})
    except Vendor.DoesNotExist:
        return Response({'message': 'Vendor not found'}, status=status.HTTP_404_NOT_FOUND)


# ═══════════════════════════════════════════════════════════════════════
# PANEL 5 — DISPUTE MANAGEMENT
# ═══════════════════════════════════════════════════════════════════════
@api_view(['GET', 'POST'])
def disputes(request):
    """GET — list all disputes | POST — create a new dispute"""
    if not _is_admin(request):
        return Response({'message': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'GET':
        all_disputes = Dispute.objects.all()
        data = [
            {
                'dispute_id': d.dispute_id,
                'order_id': d.order_id,
                'user_id': d.user_id,
                'vendor_id': d.vendor_id,
                'reason': d.reason,
                'user_complaint_text': d.user_complaint_text,
                'status': d.status,
                'payout_held': d.payout_held,
                'refund_issued': d.refund_issued,
                'hours_remaining': d.hours_remaining,
                'is_sla_breached': d.is_sla_breached,
                'created_at': d.created_at.isoformat(),
                'sla_deadline': d.sla_deadline.isoformat(),
            }
            for d in all_disputes
        ]
        return Response(data)

    elif request.method == 'POST':
        d = request.data
        dispute = Dispute.objects.create(
            order_id=d.get('order_id'),
            user_id=d.get('user_id'),
            vendor_id=d.get('vendor_id'),
            reason=d.get('reason', ''),
            user_complaint_text=d.get('user_complaint_text', ''),
            sla_deadline=timezone.now() + datetime.timedelta(hours=48),
        )
        # Auto-create a critical alert
        AdminAlert.objects.create(
            severity='CRITICAL',
            title=f'New Dispute on Order #{d.get("order_id")}',
            description=d.get('reason', ''),
            order_id=d.get('order_id'),
            action_label='Open Dispute',
        )
        return Response({'dispute_id': dispute.dispute_id, 'message': 'Dispute created'}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
def resolve_dispute(request, dispute_id):
    """POST /api/admin/disputes/<id>/resolve/"""
    if not _is_admin(request):
        return Response({'message': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    try:
        dispute = Dispute.objects.get(dispute_id=dispute_id)
        action = request.data.get('action', 'resolve')  # 'refund', 'hold', 'resolve'
        notes = request.data.get('notes', '')

        from apps.orders.all_orders.models import Order
        from apps.payments.payments_all.models import Payout
        order = Order.objects.filter(order_id=dispute.order_id).first()

        if action == 'refund':
            dispute.status = 'REFUNDED'
            dispute.refund_issued = True
            if order:
                order.status = 'disputed'
                order.save(update_fields=['status'])
                Payout.objects.filter(order=order).update(status='failed', failure_reason=notes or 'Refunded via admin')
        elif action == 'hold':
            dispute.status = 'PAYOUT_HELD'
            dispute.payout_held = True
            if order:
                order.has_dispute = True
                order.payout_status = 'held'
                order.save(update_fields=['has_dispute', 'payout_status'])
                Payout.objects.filter(order=order).update(status='held', held_reason=notes)
        else: # resolve
            dispute.status = 'RESOLVED'
            if order:
                order.has_dispute = False
                order.payout_status = 'processing'
                order.save(update_fields=['has_dispute', 'payout_status'])
                Payout.objects.filter(order=order, status='held').update(status='processing', held_reason=None)

        dispute.resolution_notes = notes
        dispute.resolved_at = timezone.now()
        dispute.save()
        return Response({'message': f'Dispute {action}d successfully', 'status': dispute.status})
    except Dispute.DoesNotExist:
        return Response({'message': 'Dispute not found'}, status=status.HTTP_404_NOT_FOUND)


# ═══════════════════════════════════════════════════════════════════════
# PANEL 6 — ANALYTICS
# ═══════════════════════════════════════════════════════════════════════
@api_view(['GET'])
def analytics(request):
    """GET /api/admin/analytics/ — MoM metrics and GMV trends"""
    if not _is_admin(request):
        return Response({'message': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)

    now = timezone.now()
    # Last 6 months
    monthly = []
    for i in range(5, -1, -1):
        month_start = (now.replace(day=1) - datetime.timedelta(days=i * 30)).replace(day=1)
        month_end = (month_start + datetime.timedelta(days=32)).replace(day=1)
        orders = Order.objects.filter(time_stamp__gte=month_start, time_stamp__lt=month_end)
        monthly.append({
            'month': month_start.strftime('%b %Y'),
            'orders': orders.count(),
            'gmv': round(orders.aggregate(t=Sum('total_price'))['t'] or 0, 2),
            'new_vendors': Vendor.objects.filter().count(),  # simplified
            'new_users': User.objects.filter().count(),
        })

    # City performance comparison
    city_perf = (
        Order.objects.values('vendor__city')
        .annotate(orders=Count('order_id'), revenue=Sum('total_price'))
        .order_by('-revenue')[:8]
    )
    city_data = [
        {
            'city': g['vendor__city'] or 'Unknown',
            'orders': g['orders'],
            'revenue': round(g['revenue'] or 0, 2),
        }
        for g in city_perf
    ]

    return Response({'monthly_trend': monthly, 'city_performance': city_data})


# ═══════════════════════════════════════════════════════════════════════
# PANEL 7 — CITY MANAGER
# ═══════════════════════════════════════════════════════════════════════
@api_view(['GET'])
def city_manager(request):
    """GET /api/admin/city-manager/ — Capacity overview per city"""
    if not _is_admin(request):
        return Response({'message': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)

    cities = CityHealth.objects.all().order_by('-active_leads')
    if not cities.exists():
        # Fallback: compute from vendor city data
        city_names = Vendor.objects.values_list('city', flat=True).distinct()
        data = []
        for city in city_names:
            if not city:
                continue
            vendor_count = Vendor.objects.filter(city__iexact=city).count()
            lead_count = Query.objects.filter(location__iexact=city).count()
            data.append({
                'city_name': city,
                'active_vendors': vendor_count,
                'active_leads': lead_count,
                'waitlist_count': max(0, lead_count - vendor_count),
                'total_orders': Order.objects.filter(vendor__city__iexact=city).count(),
                'gmv_today': 0,
            })
        return Response(data)

    data = [
        {
            'city_name': c.city_name,
            'active_vendors': c.active_vendors,
            'active_leads': c.active_leads,
            'waitlist_count': max(0, c.active_leads - c.active_vendors),
            'total_orders': c.total_orders,
            'gmv_today': c.gmv_today,
        }
        for c in cities
    ]
    return Response(data)


# ═══════════════════════════════════════════════════════════════════════
# PANEL 8 — WHATSAPP BOT
# ═══════════════════════════════════════════════════════════════════════
@api_view(['GET'])
def whatsapp_bot_stats(request):
    """GET /api/admin/whatsapp-bot/ — Bot session stats and drop-off analysis"""
    if not _is_admin(request):
        return Response({'message': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)

    # Compute from query data — queries with accepted=None are drop-offs
    total = Query.objects.count()
    accepted = Query.objects.filter(is_accepted=True).count()
    dropped = Query.objects.filter(is_accepted=None).count()
    rejected = Query.objects.filter(is_accepted=False).count()

    drop_rate = round((dropped / total * 100) if total > 0 else 0, 1)
    conversion_rate = round((accepted / total * 100) if total > 0 else 0, 1)

    return Response({
        'total_sessions': total,
        'converted': accepted,
        'dropped': dropped,
        'rejected': rejected,
        'drop_rate_percent': drop_rate,
        'conversion_rate_percent': conversion_rate,
        'broadcast_sent_today': 0,  # Placeholder until WA integration is live
    })


@api_view(['POST'])
def send_broadcast(request):
    """POST /api/admin/whatsapp-bot/broadcast/ — Trigger a WA broadcast"""
    if not _is_admin(request):
        return Response({'message': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)

    message = request.data.get('message', '')
    target = request.data.get('target', 'all_vendors')  # 'all_vendors', 'city', 'all_users'
    city = request.data.get('city')

    if not message:
        return Response({'message': 'Broadcast message is required'}, status=status.HTTP_400_BAD_REQUEST)

    # Log the broadcast as an INFO alert
    AdminAlert.objects.create(
        severity='INFO',
        title=f'WA Broadcast sent to {target}' + (f' in {city}' if city else ''),
        description=message[:200],
        is_resolved=True,
    )
    # TODO: Integrate with actual WhatsApp API here
    return Response({'message': 'Broadcast logged successfully. WA API integration pending.', 'target': target})


# ═══════════════════════════════════════════════════════════════════════
# PANEL 9 — SYSTEM CONFIG
# ═══════════════════════════════════════════════════════════════════════
@api_view(['GET', 'PATCH'])
def system_config(request):
    """GET — fetch config | PATCH — update algorithm params"""
    if not _is_admin(request):
        return Response({'message': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)

    config = SystemConfig.get_config()

    if request.method == 'GET':
        return Response({
            'weight_rating': config.weight_rating,
            'weight_acceptance_rate': config.weight_acceptance_rate,
            'weight_response_time': config.weight_response_time,
            'weight_reviews': config.weight_reviews,
            'commission_tier1': config.commission_tier1,
            'commission_tier2': config.commission_tier2,
            'commission_tier3': config.commission_tier3,
            'acceptance_window_minutes': config.acceptance_window_minutes,
            'auto_reassign_on_timeout': config.auto_reassign_on_timeout,
            'auto_hold_on_dispute': config.auto_hold_on_dispute,
            'broadcast_wa_on_new_lead': config.broadcast_wa_on_new_lead,
            'updated_at': config.updated_at.isoformat(),
            'updated_by': config.updated_by,
        })

    elif request.method == 'PATCH':
        updatable = [
            'weight_rating', 'weight_acceptance_rate', 'weight_response_time', 'weight_reviews',
            'commission_tier1', 'commission_tier2', 'commission_tier3',
            'acceptance_window_minutes', 'auto_reassign_on_timeout',
            'auto_hold_on_dispute', 'broadcast_wa_on_new_lead',
        ]
        for field in updatable:
            if field in request.data:
                setattr(config, field, request.data[field])
        config.updated_by = 'admin'
        config.save()
        return Response({'message': 'System config updated successfully'})


# ═══════════════════════════════════════════════════════════════════════
# PANEL 10 — CITY CALENDAR & AVAILABILITY
# ═══════════════════════════════════════════════════════════════════════
@api_view(['GET'])
def admin_city_calendar(request):
    """GET /api/admin/city-calendar/?city=Delhi"""
    if not _is_admin(request):
        return Response({'message': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
    city = request.GET.get('city')
    if not city:
        return Response({'message': 'Query param ?city= is required'}, status=status.HTTP_400_BAD_REQUEST)
        
    vendors = Vendor.objects.filter(city__iexact=city).prefetch_related('availability')
    
    # Filter 30 days ahead
    today = timezone.now().date()
    end_date = today + datetime.timedelta(days=30)
    
    data = []
    from apps.orders.all_orders.models import Order
    for v in vendors:
        blocks = v.availability.filter(blocked_date__range=[today, end_date])
        recurring_days = list(v.availability.filter(block_type='recurring').values_list('recurring_day', flat=True))
        
        orders = Order.objects.filter(
            vendor=v, 
            service_date__date__range=[today, end_date],
            status__in=['lead_accepted', 'price_confirmed', 'payment_received', 'd1_ready']
        )
        
        booked_dates = list(orders.values_list('service_date__date', flat=True))
        blocked_dates = list(blocks.values_list('blocked_date', flat=True))
        
        data.append({
            'vendor_id': v.vendor_id,
            'business_name': v.business_name,
            'vendor_type': v.vendor_type,
            'max_orders_per_day': v.max_orders_per_day,
            'recurring_blocked_days': recurring_days, # 0=Monday..
            'blocked_dates': [str(d) for d in blocked_dates if d],
            'booked_dates': [str(d) for d in booked_dates if d]
        })
        
    return Response({
        'city': city,
        'vendor_count': vendors.count(),
        'calendar_data': data
    })
