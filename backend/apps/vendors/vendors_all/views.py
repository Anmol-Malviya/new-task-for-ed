"""
Vendor API Views — All authenticated vendor endpoints.
JWT token must include role='vendor' and vendor_id.

Onboarding Steps:
  Step 1 → PUT /api/vendor/profile/
  Step 2 → POST /api/vendor/categories/
  Step 3 → POST /api/vendor/photos/
  Step 4 → POST /api/vendor/bank-details/
  Step 5 → POST /api/vendor/agreement/sign/
"""

import datetime
from django.utils import timezone
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .models import (
    Vendor, VendorServiceCategory, VendorPhoto,
    VendorBankDetails, VendorAgreement, VendorAvailability,
    VendorScoreLog, QueryVendor
)
from .serializers import (
    VendorPublicSerializer, VendorProfileUpdateSerializer,
    VendorServiceCategorySerializer, VendorPhotoSerializer,
    VendorBankDetailsSerializer, VendorAgreementSerializer,
    VendorAvailabilitySerializer, VendorOnboardingStatusSerializer,
    QueryVendorSerializer, VendorScoreLogSerializer,
)
from apps.orders.all_orders.models import Order
from apps.payments.payments_all.models import Payout


# ─────────────────────────────────────────────
# Auth helper
# ─────────────────────────────────────────────
import jwt
from django.conf import settings as django_settings

def _decode_vendor(request):
    auth = request.headers.get('Authorization', '')
    if not auth.startswith('Bearer '):
        return None
    try:
        payload = jwt.decode(auth[7:], django_settings.SECRET_KEY, algorithms=['HS256'])
        if payload.get('role') != 'vendor':
            return None
        return payload
    except jwt.exceptions.PyJWTError:
        return None


def _get_vendor(request):
    payload = _decode_vendor(request)
    if not payload:
        return None, Response({'message': 'Vendor authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
    try:
        vendor = Vendor.objects.get(vendor_id=payload['vendor_id'])
        return vendor, None
    except Vendor.DoesNotExist:
        return None, Response({'message': 'Vendor not found'}, status=status.HTTP_404_NOT_FOUND)


def _advance_onboarding(vendor, step_completed):
    """Advance onboarding step if this is the current step."""
    if vendor.onboarding_step == step_completed:
        vendor.onboarding_step = step_completed + 1
    if vendor.onboarding_step > 5 and not vendor.onboarding_completed:
        # Check all 5 steps are done
        has_categories = vendor.service_categories.exists()
        has_photos = vendor.photos.filter().count() >= 1
        has_bank = hasattr(vendor, 'bank_details')
        has_agreement = hasattr(vendor, 'agreement') and vendor.agreement.is_fully_signed()
        if has_categories and has_photos and has_bank and has_agreement:
            vendor.onboarding_completed = True
    vendor.save()


# ─────────────────────────────────────────────
# PROFILE
# ─────────────────────────────────────────────
@api_view(['GET', 'PUT'])
def vendor_profile(request):
    """GET/PUT /api/vendor/profile/"""
    vendor, err = _get_vendor(request)
    if err:
        return err

    if request.method == 'GET':
        return Response(VendorPublicSerializer(vendor).data)

    serializer = VendorProfileUpdateSerializer(vendor, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        _advance_onboarding(vendor, 1)
        return Response(VendorPublicSerializer(vendor).data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─────────────────────────────────────────────
# ONBOARDING STATUS
# ─────────────────────────────────────────────
@api_view(['GET'])
def vendor_onboarding_status(request):
    """GET /api/vendor/onboarding-status/"""
    vendor, err = _get_vendor(request)
    if err:
        return err

    has_profile = bool(vendor.owner_name and vendor.city and vendor.phone)
    has_categories = vendor.service_categories.exists()
    has_photos = vendor.photos.exists()
    has_bank = hasattr(vendor, 'bank_details')
    has_agreement = hasattr(vendor, 'agreement') and vendor.agreement.is_fully_signed()

    data = {
        'step': vendor.onboarding_step,
        'completed': vendor.onboarding_completed,
        'percent': min(int((vendor.onboarding_step - 1) / 5 * 100), 100) if not vendor.onboarding_completed else 100,
        'steps_detail': {
            '1_basic_profile': has_profile,
            '2_service_categories': has_categories,
            '3_portfolio_photos': has_photos,
            '4_bank_details': has_bank,
            '5_agreement': has_agreement,
        },
        'can_receive_leads': vendor.onboarding_completed and vendor.is_approved and vendor.is_active,
        'admin_approval_status': 'approved' if vendor.is_approved else ('pending' if vendor.onboarding_completed else 'incomplete'),
    }
    return Response(data)


# ─────────────────────────────────────────────
# STEP 2 — SERVICE CATEGORIES
# ─────────────────────────────────────────────
@api_view(['GET', 'POST'])
def vendor_categories(request):
    """GET/POST /api/vendor/categories/"""
    vendor, err = _get_vendor(request)
    if err:
        return err

    if request.method == 'GET':
        cats = vendor.service_categories.all()
        return Response(VendorServiceCategorySerializer(cats, many=True).data)

    # POST: Replace all categories
    occasions = request.data.get('occasions', [])
    if not occasions:
        return Response({'message': 'At least one occasion category required'}, status=status.HTTP_400_BAD_REQUEST)

    valid = [c[0] for c in VendorServiceCategory._meta.get_field('occasion').choices]
    invalid = [o for o in occasions if o not in valid]
    if invalid:
        return Response({'message': f'Invalid occasions: {invalid}. Valid: {valid}'}, status=status.HTTP_400_BAD_REQUEST)

    vendor.service_categories.all().delete()
    for occ in occasions:
        VendorServiceCategory.objects.create(vendor=vendor, occasion=occ)

    _advance_onboarding(vendor, 2)
    cats = vendor.service_categories.all()
    return Response(VendorServiceCategorySerializer(cats, many=True).data, status=status.HTTP_201_CREATED)


# ─────────────────────────────────────────────
# STEP 3 — PORTFOLIO PHOTOS
# ─────────────────────────────────────────────
@api_view(['GET'])
def vendor_photos(request):
    """GET /api/vendor/photos/"""
    vendor, err = _get_vendor(request)
    if err:
        return err

    photos = vendor.photos.all().order_by('-uploaded_at')
    return Response({
        'count': photos.count(),
        'approved_count': photos.filter(is_approved=True).count(),
        'min_required': 8,
        'photos': VendorPhotoSerializer(photos, many=True).data,
    })


@api_view(['POST'])
def vendor_photos_upload(request):
    """POST /api/vendor/photos/ — Upload photo (URL from Cloudinary)"""
    vendor, err = _get_vendor(request)
    if err:
        return err

    data = request.data.copy()
    photo_url = data.get('photo_url')
    if not photo_url:
        return Response({'message': 'photo_url is required'}, status=status.HTTP_400_BAD_REQUEST)

    photo = VendorPhoto.objects.create(
        vendor=vendor,
        photo_url=photo_url,
        cloudinary_id=data.get('cloudinary_id', ''),
        occasion_tag=data.get('occasion_tag', None),
        is_approved=None,  # Pending admin review
    )

    # Advance onboarding if first photo uploaded
    if vendor.photos.count() >= 1:
        _advance_onboarding(vendor, 3)

    return Response(VendorPhotoSerializer(photo).data, status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
def vendor_photo_delete(request, photo_id):
    """DELETE /api/vendor/photos/<id>/"""
    vendor, err = _get_vendor(request)
    if err:
        return err

    try:
        photo = vendor.photos.get(id=photo_id)
        photo.delete()
        return Response({'message': 'Photo deleted'}, status=status.HTTP_204_NO_CONTENT)
    except VendorPhoto.DoesNotExist:
        return Response({'message': 'Photo not found'}, status=status.HTTP_404_NOT_FOUND)


# ─────────────────────────────────────────────
# STEP 4 — BANK DETAILS
# ─────────────────────────────────────────────
@api_view(['GET', 'POST'])
def vendor_bank_details(request):
    """GET/POST /api/vendor/bank-details/"""
    vendor, err = _get_vendor(request)
    if err:
        return err

    if request.method == 'GET':
        try:
            return Response(VendorBankDetailsSerializer(vendor.bank_details).data)
        except VendorBankDetails.DoesNotExist:
            return Response({'message': 'Bank details not submitted yet'}, status=status.HTTP_404_NOT_FOUND)

    # POST: Create or update
    try:
        bank = vendor.bank_details
        serializer = VendorBankDetailsSerializer(bank, data=request.data, partial=True)
    except VendorBankDetails.DoesNotExist:
        serializer = VendorBankDetailsSerializer(data=request.data)

    if serializer.is_valid():
        bank = serializer.save(vendor=vendor)
        _advance_onboarding(vendor, 4)
        
        # Trigger Razorpay linked account creation
        if not vendor.razorpay_linked_account:
            from apps.payments.payments_all.razorpay_service import create_linked_account
            acc_id = create_linked_account(
                vendor_name=bank.account_holder,
                vendor_email=vendor.email,
                account_number=bank.account_number,
                ifsc_code=bank.ifsc_code
            )
            if acc_id:
                vendor.razorpay_linked_account = acc_id
                vendor.save(update_fields=['razorpay_linked_account'])
                bank.razorpay_linked_account_id = acc_id
                bank.save(update_fields=['razorpay_linked_account_id'])

        return Response(VendorBankDetailsSerializer(bank).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def vendor_bank_status(request):
    """GET /api/vendor/bank-details/status/"""
    vendor, err = _get_vendor(request)
    if err:
        return err
    try:
        return Response({'status': vendor.bank_details.verification_status})
    except VendorBankDetails.DoesNotExist:
        return Response({'status': 'not_submitted'})


# ─────────────────────────────────────────────
# STEP 5 — AGREEMENT SIGNING
# ─────────────────────────────────────────────
@api_view(['GET', 'POST'])
def vendor_agreement(request):
    """POST /api/vendor/agreement/sign/"""
    vendor, err = _get_vendor(request)
    if err:
        return err

    if request.method == 'GET':
        try:
            return Response(VendorAgreementSerializer(vendor.agreement).data)
        except VendorAgreement.DoesNotExist:
            return Response({'signed': False, 'signed_at': None})

    data = request.data
    required_clauses = [
        'non_solicitation_clause',
        'commission_rate_agreed',
        'dispute_policy_agreed',
        'platform_rules_agreed',
    ]
    for clause in required_clauses:
        if not data.get(clause):
            return Response({'message': f'Must agree to: {clause}'}, status=status.HTTP_400_BAD_REQUEST)

    # Get client IP
    ip = request.META.get('HTTP_X_FORWARDED_FOR', request.META.get('REMOTE_ADDR', '127.0.0.1'))
    if ',' in ip:
        ip = ip.split(',')[0].strip()

    try:
        agreement = vendor.agreement
        agreement.non_solicitation_clause = True
        agreement.commission_rate_agreed = True
        agreement.dispute_policy_agreed = True
        agreement.platform_rules_agreed = True
        agreement.signed_at = timezone.now()
        agreement.ip_address = ip
        agreement.save()
    except VendorAgreement.DoesNotExist:
        agreement = VendorAgreement.objects.create(
            vendor=vendor,
            non_solicitation_clause=True,
            commission_rate_agreed=True,
            dispute_policy_agreed=True,
            platform_rules_agreed=True,
            signed_at=timezone.now(),
            ip_address=ip,
        )

    _advance_onboarding(vendor, 5)
    return Response({
        'message': 'Agreement signed successfully',
        'signed_at': agreement.signed_at,
        'onboarding_completed': vendor.onboarding_completed,
    })


# ─────────────────────────────────────────────
# LEADS
# ─────────────────────────────────────────────
@api_view(['GET'])
def vendor_leads(request):
    """GET /api/vendor/leads/ — List assigned leads"""
    vendor, err = _get_vendor(request)
    if err:
        return err

    leads = QueryVendor.objects.filter(
        vendor=vendor
    ).select_related('query').order_by('-assigned_at')

    # Filter by status
    lead_status = request.GET.get('status', 'all')
    if lead_status != 'all':
        leads = leads.filter(status=lead_status)

    # Auto-expire overdue leads
    now = timezone.now()
    for lead in leads.filter(status='pending', expires_at__lt=now, is_expired=False):
        lead.is_expired = True
        lead.status = 'expired'
        lead.save()

    return Response(QueryVendorSerializer(leads, many=True).data)


@api_view(['POST'])
def vendor_lead_accept(request, lead_id):
    """POST /api/vendor/leads/<id>/accept/"""
    vendor, err = _get_vendor(request)
    if err:
        return err

    try:
        lead = QueryVendor.objects.select_related('query').get(
            query_vendor_id=lead_id, vendor=vendor
        )
    except QueryVendor.DoesNotExist:
        return Response({'message': 'Lead not found'}, status=status.HTTP_404_NOT_FOUND)

    now = timezone.now()

    # Check expiry
    if lead.is_expired or (lead.expires_at and lead.expires_at < now):
        lead.is_expired = True
        lead.status = 'expired'
        lead.save()
        return Response({'message': 'Lead has expired — you had 20 minutes to respond'}, status=status.HTTP_410_GONE)

    if lead.status != 'pending':
        return Response({'message': f'Lead is already {lead.status}'}, status=status.HTTP_409_CONFLICT)

    # Accept the lead
    lead.has_accepted = True
    lead.status = 'accepted'
    lead.accepted_at = now
    lead.save()

    # Update query status
    lead.query.status = 'accepted'
    lead.query.is_accepted = True
    lead.query.save()

    # Create order
    query = lead.query
    commission_rate = vendor.get_commission_rate()
    order = Order.objects.create(
        query=query,
        user=query.user,
        vendor=vendor,
        occasion=query.occasion,
        theme_notes=query.theme_note,
        event_date=datetime.datetime.combine(query.event_date, datetime.time.min) if query.event_date else None,
        city_area=query.city_area if hasattr(query, 'city_area') else '',
        approx_budget=query.approx_budget,
        commission_rate=commission_rate,
        status='lead_accepted',
    )

    # Score: update response rate
    _update_vendor_response_rate(vendor)

    return Response({
        'message': 'Lead accepted! Order created.',
        'order_id': order.order_id,
        'order_status': order.status,
        'commission_rate': commission_rate,
        'note': 'Call the client using the masked number in the order detail page.',
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
def vendor_lead_decline(request, lead_id):
    """POST /api/vendor/leads/<id>/decline/"""
    vendor, err = _get_vendor(request)
    if err:
        return err

    try:
        lead = QueryVendor.objects.get(query_vendor_id=lead_id, vendor=vendor)
    except QueryVendor.DoesNotExist:
        return Response({'message': 'Lead not found'}, status=status.HTTP_404_NOT_FOUND)

    if lead.status != 'pending':
        return Response({'message': f'Lead is already {lead.status}'}, status=status.HTTP_409_CONFLICT)

    lead.status = 'declined'
    lead.declined_at = timezone.now()
    lead.save()

    # TODO: Trigger routing to next vendor
    _update_vendor_response_rate(vendor)

    return Response({'message': 'Lead declined. Another vendor will be notified.'})


def _update_vendor_response_rate(vendor):
    """Recalculate response rate after lead action."""
    total = QueryVendor.objects.filter(vendor=vendor).exclude(status='pending').count()
    accepted = QueryVendor.objects.filter(vendor=vendor, status='accepted').count()
    if total > 0:
        vendor.response_rate = round((accepted / total) * 100, 1)
        vendor.save(update_fields=['response_rate'])


# ─────────────────────────────────────────────
# ORDERS
# ─────────────────────────────────────────────
@api_view(['GET'])
def vendor_orders(request):
    """GET /api/vendor/orders/"""
    vendor, err = _get_vendor(request)
    if err:
        return err

    orders = Order.objects.filter(vendor=vendor).select_related('user', 'query').order_by('-time_stamp')

    order_status = request.GET.get('status')
    if order_status:
        orders = orders.filter(status=order_status)

    data = []
    for o in orders:
        data.append({
            'order_id': o.order_id,
            'status': o.status,
            'occasion': o.occasion,
            'event_date': o.service_date or (o.event_date if hasattr(o, 'event_date') else None),
            'approx_budget': o.approx_budget,
            'final_amount': o.final_amount,
            'vendor_payout_amount': o.vendor_payout_amount,
            'commission_rate': o.commission_rate,
            'theme_notes': o.theme_notes,
            'arrival_time': o.arrival_time,
            'city_area': o.query.city_area if o.query else '',
            'relay_phone': o.relay_phone_number,
            # Client info gated behind payment
            'client_name': o.user.name if o.status in ['payment_received', 'd1_ready', 'delivered', 'paid_out'] else '****',
            'client_phone_masked': ('XXXXXX' + o.user.number[-4:]) if hasattr(o.user, 'number') and o.user.number else '****',
            'full_address': o.address if o.status in ['payment_received', 'd1_ready', 'delivered', 'paid_out'] else None,
            'payout_status': o.payout_status,
            'time_stamp': o.time_stamp,
        })
    return Response(data)


@api_view(['GET'])
def vendor_order_detail(request, order_id):
    """GET /api/vendor/orders/<id>/"""
    vendor, err = _get_vendor(request)
    if err:
        return err

    try:
        o = Order.objects.select_related('user', 'query').get(order_id=order_id, vendor=vendor)
    except Order.DoesNotExist:
        return Response({'message': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

    payment_received = o.status in ['payment_received', 'd1_ready', 'delivered', 'paid_out']

    # Phone visibility: D-1 (24h before event) or after payment
    show_real_phone = payment_received
    if o.service_date:
        d1_check = o.service_date - datetime.timedelta(hours=24)
        if timezone.now() >= d1_check:
            show_real_phone = True

    return Response({
        'order_id': o.order_id,
        'status': o.status,
        'occasion': o.occasion,
        'event_date': o.service_date,
        'theme_notes': o.theme_notes,
        'arrival_time': o.arrival_time,
        'approx_budget': o.approx_budget,
        'final_amount': o.final_amount,
        'vendor_payout_amount': o.vendor_payout_amount,
        'commission_amount': o.commission_amount,
        'commission_rate': o.commission_rate,
        'payout_status': o.payout_status,
        'relay_phone': o.relay_phone_number if o.relay_phone_number else '88XX XXXX XX',
        # Client info — gated
        'client_name': o.user.name if payment_received else '*** (Unlocked after payment)',
        'client_phone': (o.user.number if hasattr(o.user, 'number') else '') if show_real_phone else 'XXXXXX' + str(o.user.number)[-4:] if hasattr(o.user, 'number') and o.user.number else '****',
        'full_address': o.address if payment_received else None,
        'floor_details': o.query.floor_details if o.query and payment_received else None,
        'city_area': o.query.city_area if o.query else '',
        'd1_ready': o.d1_ready,
        'has_dispute': o.has_dispute,
        'pipeline_steps': _get_pipeline_steps(o),
    })


def _get_pipeline_steps(order):
    STATUS_ORDER = ['lead_accepted', 'price_confirmed', 'payment_received', 'd1_ready', 'delivered', 'paid_out']
    current_idx = STATUS_ORDER.index(order.status) if order.status in STATUS_ORDER else -1
    return [
        {
            'key': s,
            'label': s.replace('_', ' ').title(),
            'done': i <= current_idx,
            'active': i == current_idx,
        }
        for i, s in enumerate(STATUS_ORDER)
    ]


@api_view(['PATCH'])
def vendor_confirm_price(request, order_id):
    """PATCH /api/vendor/orders/<id>/confirm-price/"""
    vendor, err = _get_vendor(request)
    if err:
        return err

    try:
        order = Order.objects.get(order_id=order_id, vendor=vendor)
    except Order.DoesNotExist:
        return Response({'message': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

    if order.status != 'lead_accepted':
        return Response({'message': 'Price can only be confirmed from lead_accepted status'}, status=status.HTTP_400_BAD_REQUEST)

    final_amount = request.data.get('final_amount')
    if not final_amount:
        return Response({'message': 'final_amount is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        final_amount = float(final_amount)
    except ValueError:
        return Response({'message': 'final_amount must be a number'}, status=status.HTTP_400_BAD_REQUEST)

    order.final_amount = final_amount
    order.commission_rate = vendor.get_commission_rate()
    order.calculate_payout()
    order.status = 'price_confirmed'
    order.price_confirmed_at = timezone.now()
    order.save()

    from apps.payments.payments_all.razorpay_service import create_payment_link
    plink_url, plink_id = create_payment_link(
        order_id=order.order_id,
        amount=order.final_amount,
        customer_name=order.user.name if order.user else 'Client',
        customer_phone=order.user.number if hasattr(order.user, 'number') else ''
    )
    
    if plink_url:
        order.razorpay_payment_link = plink_url
        order.save(update_fields=['razorpay_payment_link'])
        # TODO: send whatsapp notification

    return Response({
        'message': 'Price confirmed! Payment link will be sent to client.',
        'final_amount': order.final_amount,
        'your_payout': order.vendor_payout_amount,
        'commission': order.commission_amount,
        'commission_rate_pct': f'{int(order.commission_rate * 100)}%',
        'status': order.status,
    })


@api_view(['PATCH'])
def vendor_mark_delivered(request, order_id):
    """PATCH /api/vendor/orders/<id>/mark-delivered/"""
    vendor, err = _get_vendor(request)
    if err:
        return err

    try:
        order = Order.objects.select_related('user').get(order_id=order_id, vendor=vendor)
    except Order.DoesNotExist:
        return Response({'message': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

    if order.status not in ['payment_received', 'd1_ready']:
        return Response({'message': f'Cannot mark delivered from status: {order.status}'}, status=status.HTTP_400_BAD_REQUEST)

    order.status = 'delivered'
    order.delivery_confirmed_at = timezone.now()
    order.save()

    # TODO: Trigger 72-hr payout countdown via Celery
    # TODO: Send WhatsApp to client: "Confirm delivery to release payment to vendor"

    return Response({
        'message': 'Order marked as delivered. Payout will be processed after client confirms or within 72 hours.',
        'payout_amount': order.vendor_payout_amount,
        'status': order.status,
    })


@api_view(['POST'])
def vendor_initiate_call(request, order_id):
    """POST /api/vendor/orders/<id>/call/"""
    vendor, err = _get_vendor(request)
    if err:
        return err

    try:
        order = Order.objects.select_related('user').get(order_id=order_id, vendor=vendor)
    except Order.DoesNotExist:
        return Response({'message': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

    if order.status not in ['lead_accepted', 'price_confirmed', 'payment_received', 'd1_ready']:
        return Response({'message': 'Cannot initiate call at this order stage'}, status=status.HTTP_400_BAD_REQUEST)

    from apps.call_logs.call_logs_all.exotel_service import initiate_masked_call
    from apps.call_logs.call_logs_all.models import PhoneCall
    import os
    
    relay_number = order.relay_phone_number or os.getenv("EXOTEL_CALLER_ID", "8800000000")
    
    # Fire Exotel Call
    success, result_or_sid = initiate_masked_call(vendor.phone or vendor.whatsapp_number, order.user.number)

    call = PhoneCall.objects.create(
        order=order,
        vendor=vendor,
        relay_number=relay_number,
        call_status='initiated' if success else 'failed',
        exotel_call_sid=result_or_sid if success else None,
    )
    
    if not success:
        return Response({'message': f'Call failed to trigger: {result_or_sid}'}, status=status.HTTP_502_BAD_GATEWAY)

    return Response({
        'message': 'Call initiated via masked relay number',
        'relay_number': relay_number,
        'call_id': call.call_id,
        'note': 'Real phone numbers are hidden on both sides.',
        'guidelines': [
            '✅ Focus on understanding requirements',
            '✅ Confirm event date and budget range',
            '✅ Discuss theme preferences',
            '❌ Do NOT share your personal number or Instagram',
            '❌ Do NOT ask for direct UPI payment',
            '❌ Do NOT offer discounts for direct bookings',
        ],
    })


@api_view(['PATCH'])
def vendor_d1_readiness(request, order_id):
    """PATCH /api/vendor/orders/<id>/d1-ready/"""
    vendor, err = _get_vendor(request)
    if err:
        return err

    try:
        order = Order.objects.get(order_id=order_id, vendor=vendor)
    except Order.DoesNotExist:
        return Response({'message': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

    is_ready = request.data.get('is_ready', True)
    needs_help = request.data.get('needs_help', False)

    order.d1_ready = is_ready
    order.d1_needs_help = needs_help
    if is_ready:
        order.status = 'd1_ready'
    order.save()

    return Response({'message': 'D-1 readiness updated', 'status': order.status})


# ─────────────────────────────────────────────
# AVAILABILITY CALENDAR
# ─────────────────────────────────────────────
@api_view(['GET'])
def vendor_availability(request):
    """GET /api/vendor/availability/"""
    vendor, err = _get_vendor(request)
    if err:
        return err

    blocks = vendor.availability.all().order_by('blocked_date')
    # Also get booked dates from active orders
    booked_dates = list(
        Order.objects.filter(
            vendor=vendor,
            status__in=['lead_accepted', 'price_confirmed', 'payment_received', 'd1_ready']
        ).values_list('service_date__date', flat=True)
    )

    return Response({
        'blocked_dates': VendorAvailabilitySerializer(blocks, many=True).data,
        'booked_dates': [str(d) for d in booked_dates if d],
        'max_orders_per_day': vendor.max_orders_per_day,
    })


@api_view(['POST'])
def vendor_block_date(request):
    """POST /api/vendor/availability/block/"""
    vendor, err = _get_vendor(request)
    if err:
        return err

    blocked_date = request.data.get('blocked_date')
    block_type = request.data.get('block_type', 'manual')
    reason = request.data.get('reason', '')
    recurring_day = request.data.get('recurring_day', None)

    # Prevent blocking dates with active orders
    if blocked_date:
        active_on_date = Order.objects.filter(
            vendor=vendor,
            service_date__date=blocked_date,
            status__in=['lead_accepted', 'price_confirmed', 'payment_received', 'd1_ready']
        ).exists()
        if active_on_date:
            return Response({'message': 'Cannot block a date with an active booking'}, status=status.HTTP_400_BAD_REQUEST)

    block = VendorAvailability.objects.create(
        vendor=vendor,
        blocked_date=blocked_date,
        block_type=block_type,
        recurring_day=recurring_day,
        reason=reason,
    )
    return Response(VendorAvailabilitySerializer(block).data, status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
def vendor_unblock_date(request, date):
    """DELETE /api/vendor/availability/<date>/"""
    vendor, err = _get_vendor(request)
    if err:
        return err

    deleted, _ = VendorAvailability.objects.filter(vendor=vendor, blocked_date=date).delete()
    if deleted:
        return Response({'message': f'Date {date} unblocked'}, status=status.HTTP_204_NO_CONTENT)
    return Response({'message': 'No blocked date found'}, status=status.HTTP_404_NOT_FOUND)


# ─────────────────────────────────────────────
# EARNINGS
# ─────────────────────────────────────────────
@api_view(['GET'])
def vendor_earnings(request):
    """GET /api/vendor/earnings/"""
    vendor, err = _get_vendor(request)
    if err:
        return err

    from django.db.models import Sum, Count
    from django.utils.timezone import now
    import calendar

    today = now()
    month_start = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    all_payouts = Payout.objects.filter(vendor=vendor)
    completed_payouts = all_payouts.filter(status='completed')
    pending_payouts = all_payouts.filter(status__in=['pending', 'processing'])
    this_month = completed_payouts.filter(initiated_at__gte=month_start)

    return Response({
        'total_earned': completed_payouts.aggregate(total=Sum('amount'))['total'] or 0,
        'pending_payout': pending_payouts.aggregate(total=Sum('amount'))['total'] or 0,
        'this_month': this_month.aggregate(total=Sum('amount'))['total'] or 0,
        'total_orders': Order.objects.filter(vendor=vendor, status='paid_out').count(),
        'this_month_orders': Order.objects.filter(vendor=vendor, status='paid_out', payout_completed_at__gte=month_start).count(),
        'commission_rate': f'{int(vendor.get_commission_rate() * 100)}%',
        'tier': vendor.tier,
    })


@api_view(['GET'])
def vendor_payouts(request):
    """GET /api/vendor/payouts/"""
    vendor, err = _get_vendor(request)
    if err:
        return err

    payouts = Payout.objects.filter(vendor=vendor).select_related('order').order_by('-initiated_at')
    data = []
    for p in payouts:
        data.append({
            'payout_id': p.payout_id,
            'order_id': p.order_id,
            'gross_amount': p.gross_amount,
            'commission_rate': f'{int(p.commission_rate * 100)}%',
            'commission_amount': p.commission_amount,
            'net_amount': p.amount,
            'status': p.status,
            'initiated_at': p.initiated_at,
            'completed_at': p.completed_at,
            'razorpay_payout_id': p.razorpay_payout_id,
        })
    return Response(data)


# ─────────────────────────────────────────────
# SCORE
# ─────────────────────────────────────────────
@api_view(['GET'])
def vendor_score(request):
    """GET /api/vendor/score/"""
    vendor, err = _get_vendor(request)
    if err:
        return err

    # Next Monday recalculation
    today = timezone.now()
    days_until_monday = (7 - today.weekday()) % 7 or 7
    next_monday = today + datetime.timedelta(days=days_until_monday)
    next_monday = next_monday.replace(hour=6, minute=0, second=0, microsecond=0)

    score_logs = VendorScoreLog.objects.filter(vendor=vendor).order_by('-timestamp')[:10]

    return Response({
        'score': vendor.score,
        'tier': vendor.tier,
        'is_premium': vendor.is_premium,
        'breakdown': {
            'response_rate': vendor.response_rate,
            'avg_rating': vendor.avg_rating,
            'completion_rate': vendor.completion_rate,
        },
        'score_factors': {
            'city_area_match': 'Up to 30 pts',
            'date_availability': 'Up to 25 pts',
            'customer_rating': f'{vendor.avg_rating} / 5.0 → Up to 20 pts',
            'response_rate_30d': f'{vendor.response_rate}% → Up to 15 pts',
            'current_lead_load': 'Up to 10 pts',
        },
        'next_recalculation': next_monday,
        'recent_changes': VendorScoreLogSerializer(score_logs, many=True).data,
        'has_new_vendor_boost': vendor.score_boost_expires_at and vendor.score_boost_expires_at > timezone.now(),
        'score_boost_expires': vendor.score_boost_expires_at,
    })


# ─────────────────────────────────────────────
# PREMIUM
# ─────────────────────────────────────────────
@api_view(['GET'])
def vendor_premium_status(request):
    """GET /api/vendor/premium/status/"""
    vendor, err = _get_vendor(request)
    if err:
        return err

    completed_orders = Order.objects.filter(vendor=vendor, status='paid_out').count()
    eligible = completed_orders >= 15

    return Response({
        'is_premium': vendor.is_premium,
        'premium_since': vendor.premium_since,
        'premium_expires_at': vendor.premium_expires_at,
        'razorpay_subscription_id': vendor.razorpay_subscription_id,
        'is_eligible': eligible,
        'completed_orders': completed_orders,
        'orders_needed_for_eligibility': max(0, 15 - completed_orders),
        'current_commission': f'{int(vendor.get_commission_rate() * 100)}%',
        'premium_commission': '10%',
        'current_lead_cap': vendor.get_lead_cap(),
        'premium_lead_cap': 40,
        'benefits': [
            'Commission drops to 10% (save ₹5,000+/mo at scale)',
            '40 leads/month (vs 8-18 standard)',
            '+15 algorithm boost points (always)',
            'EventDhara Partner badge on profile',
            'Homepage showcase feature',
            '2-hour priority support queue',
        ],
    })


@api_view(['POST'])
def vendor_premium_subscribe(request):
    """POST /api/vendor/premium/subscribe/ — Initiate Razorpay ₹999/mo subscription"""
    vendor, err = _get_vendor(request)
    if err:
        return err

    completed_orders = Order.objects.filter(vendor=vendor, status='paid_out').count()
    if completed_orders < 15:
        return Response({
            'message': f'Premium available after 15 completed orders. You have {completed_orders}.',
            'orders_needed': 15 - completed_orders,
        }, status=status.HTTP_403_FORBIDDEN)

    import os
    from django.conf import settings as dj_settings

    rz_key    = os.getenv('RAZORPAY_KEY_ID', getattr(dj_settings, 'RAZORPAY_KEY_ID', ''))
    rz_secret = os.getenv('RAZORPAY_KEY_SECRET', getattr(dj_settings, 'RAZORPAY_KEY_SECRET', ''))

    if not rz_key or not rz_secret:
        return Response({
            'message': 'Razorpay not configured. Ask admin to manually enable premium.',
            'subscription_id': None,
            'razorpay_key': None,
        })

    try:
        import razorpay
        client = razorpay.Client(auth=(rz_key, rz_secret))

        plan_id = os.getenv('RAZORPAY_PREMIUM_PLAN_ID', None)
        if not plan_id:
            plan = client.plan.create({
                'period': 'monthly',
                'interval': 1,
                'item': {
                    'name': 'EventDhara Premium Partner',
                    'amount': 99900,
                    'currency': 'INR',
                    'description': '10% commission, 40 leads/month, priority support',
                },
                'notes': {'product': 'eventdhara_premium'},
            })
            plan_id = plan['id']

        subscription = client.subscription.create({
            'plan_id': plan_id,
            'customer_notify': 1,
            'total_count': 12,
            'notes': {
                'vendor_id': str(vendor.vendor_id),
                'vendor_email': vendor.email,
            },
        })

        vendor.razorpay_subscription_id = subscription['id']
        vendor.save(update_fields=['razorpay_subscription_id'])

        return Response({
            'message': 'Subscription created — complete the Razorpay checkout to activate.',
            'subscription_id': subscription['id'],
            'razorpay_key': rz_key,
            'amount': 999,
            'currency': 'INR',
            'name': 'EventDhara Premium',
            'description': '₹999/month — 10% commission + 40 leads/mo',
            'prefill': {
                'name': vendor.owner_name or vendor.name,
                'email': vendor.email,
                'contact': vendor.phone or vendor.whatsapp_number or '',
            },
        })
    except Exception as exc:
        return Response({'message': f'Subscription creation failed: {str(exc)}'}, status=status.HTTP_502_BAD_GATEWAY)


@api_view(['POST'])
def vendor_premium_cancel(request):
    """POST /api/vendor/premium/cancel/ — Cancel active Razorpay subscription"""
    vendor, err = _get_vendor(request)
    if err:
        return err

    if not vendor.is_premium:
        return Response({'message': 'No active premium subscription.'}, status=status.HTTP_400_BAD_REQUEST)

    if not vendor.razorpay_subscription_id:
        return Response({'message': 'No subscription ID on file. Contact support.'}, status=status.HTTP_400_BAD_REQUEST)

    import os
    from django.conf import settings as dj_settings
    from .models import VendorPremiumLog

    rz_key    = os.getenv('RAZORPAY_KEY_ID', getattr(dj_settings, 'RAZORPAY_KEY_ID', ''))
    rz_secret = os.getenv('RAZORPAY_KEY_SECRET', getattr(dj_settings, 'RAZORPAY_KEY_SECRET', ''))
    cancel_at_cycle_end = bool(request.data.get('cancel_at_cycle_end', True))

    try:
        import razorpay
        client = razorpay.Client(auth=(rz_key, rz_secret))
        client.subscription.cancel(vendor.razorpay_subscription_id, {
            'cancel_at_cycle_end': 1 if cancel_at_cycle_end else 0,
        })
        VendorPremiumLog.objects.create(
            vendor=vendor,
            event='cancelled',
            razorpay_subscription_id=vendor.razorpay_subscription_id,
            notes=f"Vendor-requested cancel: cancel_at_cycle_end={cancel_at_cycle_end}",
        )
        msg = ("Your premium stays active until the billing cycle ends." if cancel_at_cycle_end
               else "Premium cancelled immediately.")
        return Response({'message': msg, 'cancel_at_cycle_end': cancel_at_cycle_end})
    except Exception as exc:
        return Response({'message': f'Cancellation failed: {str(exc)}'}, status=status.HTTP_502_BAD_GATEWAY)


# ─────────────────────────────────────────────────────────────────
# PREMIUM WEBHOOK  (public — verified by Razorpay HMAC signature)
# ─────────────────────────────────────────────────────────────────
from rest_framework.decorators import authentication_classes, permission_classes

@api_view(['POST'])
@authentication_classes([])
@permission_classes([])
def vendor_premium_webhook(request):
    """POST /api/vendor/premium/webhook/"""
    import os, hmac, hashlib
    from django.conf import settings as dj_settings
    from .models import VendorPremiumLog

    rz_webhook_secret = os.getenv('RAZORPAY_WEBHOOK_SECRET',
                                   getattr(dj_settings, 'RAZORPAY_WEBHOOK_SECRET', ''))
    if rz_webhook_secret:
        sig      = request.headers.get('X-Razorpay-Signature', '')
        expected = hmac.new(rz_webhook_secret.encode(), request.body, hashlib.sha256).hexdigest()
        if not hmac.compare_digest(expected, sig):
            return Response({'error': 'Bad signature'}, status=status.HTTP_400_BAD_REQUEST)

    payload = request.data
    event   = payload.get('event', '')
    entity  = payload.get('payload', {}).get('subscription', {}).get('entity', {})
    sub_id  = entity.get('id', '')

    try:
        vendor = Vendor.objects.get(razorpay_subscription_id=sub_id)
    except Vendor.DoesNotExist:
        vid = entity.get('notes', {}).get('vendor_id')
        if not vid:
            return Response({'status': 'unknown_vendor'})
        try:
            vendor = Vendor.objects.get(vendor_id=int(vid))
            vendor.razorpay_subscription_id = sub_id
            vendor.save(update_fields=['razorpay_subscription_id'])
        except Vendor.DoesNotExist:
            return Response({'status': 'vendor_not_found'})

    pmt     = payload.get('payload', {}).get('payment', {}).get('entity', {})
    pay_id  = pmt.get('id')
    amt_inr = pmt.get('amount', 0) / 100 or None
    now     = timezone.now()

    if event == 'subscription.activated':
        vendor.is_premium         = True
        vendor.premium_since      = vendor.premium_since or now
        vendor.premium_expires_at = now + datetime.timedelta(days=31)
        vendor.tier               = 'premium'
        vendor.save(update_fields=['is_premium', 'premium_since', 'premium_expires_at', 'tier'])
        VendorPremiumLog.objects.create(vendor=vendor, event='subscribed',
            razorpay_subscription_id=sub_id, razorpay_payment_id=pay_id, amount=amt_inr)

    elif event == 'subscription.charged':
        vendor.is_premium         = True
        vendor.premium_expires_at = (vendor.premium_expires_at or now) + datetime.timedelta(days=31)
        vendor.save(update_fields=['is_premium', 'premium_expires_at'])
        VendorPremiumLog.objects.create(vendor=vendor, event='renewed',
            razorpay_subscription_id=sub_id, razorpay_payment_id=pay_id, amount=amt_inr)

    elif event in ('subscription.cancelled', 'subscription.completed'):
        VendorPremiumLog.objects.create(vendor=vendor, event='cancelled',
            razorpay_subscription_id=sub_id, notes=f"webhook:{event}")
        if not vendor.premium_expires_at or vendor.premium_expires_at <= now:
            completed = vendor.orders.filter(status='paid_out').count()
            vendor.is_premium = False
            vendor.tier = 'active' if completed >= 5 else 'starter'
            vendor.save(update_fields=['is_premium', 'tier'])

    elif event in ('subscription.halted', 'subscription.paused'):
        completed = vendor.orders.filter(status='paid_out').count()
        vendor.is_premium = False
        vendor.tier = 'active' if completed >= 5 else 'starter'
        vendor.save(update_fields=['is_premium', 'tier'])
        VendorPremiumLog.objects.create(vendor=vendor, event='halted',
            razorpay_subscription_id=sub_id, notes=f"webhook:{event}")

    return Response({'status': 'processed', 'event': event})


# ─────────────────────────────────────────────
# ADMIN: GRANT / REVOKE PREMIUM
# ─────────────────────────────────────────────
@api_view(['POST'])
def admin_grant_premium(request, vendor_id_param):
    """POST /api/vendor/premium/admin/grant/<vendor_id>/ — Admin manually grant"""
    from .models import VendorPremiumLog
    import os
    from django.conf import settings as dj_settings

    expected = os.getenv('ADMIN_TOKEN', getattr(dj_settings, 'ADMIN_TOKEN', 'admin-secret'))
    if request.headers.get('X-Admin-Token', '') != expected:
        return Response({'message': 'Admin authentication required'}, status=status.HTTP_403_FORBIDDEN)

    try:
        vendor = Vendor.objects.get(vendor_id=vendor_id_param)
    except Vendor.DoesNotExist:
        return Response({'message': 'Vendor not found'}, status=status.HTTP_404_NOT_FOUND)

    months = int(request.data.get('months', 1))
    now    = timezone.now()
    vendor.is_premium         = True
    vendor.premium_since      = vendor.premium_since or now
    vendor.premium_expires_at = (vendor.premium_expires_at or now) + datetime.timedelta(days=31 * months)
    vendor.tier               = 'premium'
    vendor.save(update_fields=['is_premium', 'premium_since', 'premium_expires_at', 'tier'])
    VendorPremiumLog.objects.create(vendor=vendor, event='subscribed',
        notes=f"Admin grant: {months} month(s)")
    return Response({'message': f'Premium granted for {months} month(s)', 'expires_at': vendor.premium_expires_at})


@api_view(['POST'])
def admin_revoke_premium(request, vendor_id_param):
    """POST /api/vendor/premium/admin/revoke/<vendor_id>/ — Admin revoke"""
    from .models import VendorPremiumLog
    import os
    from django.conf import settings as dj_settings

    expected = os.getenv('ADMIN_TOKEN', getattr(dj_settings, 'ADMIN_TOKEN', 'admin-secret'))
    if request.headers.get('X-Admin-Token', '') != expected:
        return Response({'message': 'Admin authentication required'}, status=status.HTTP_403_FORBIDDEN)

    try:
        vendor = Vendor.objects.get(vendor_id=vendor_id_param)
    except Vendor.DoesNotExist:
        return Response({'message': 'Vendor not found'}, status=status.HTTP_404_NOT_FOUND)

    completed = vendor.orders.filter(status='paid_out').count()
    vendor.is_premium               = False
    vendor.razorpay_subscription_id = None
    vendor.tier = 'active' if completed >= 5 else 'starter'
    vendor.save(update_fields=['is_premium', 'tier', 'razorpay_subscription_id'])
    VendorPremiumLog.objects.create(vendor=vendor, event='expired', notes='Admin revoke')
    return Response({'message': 'Premium revoked'})

