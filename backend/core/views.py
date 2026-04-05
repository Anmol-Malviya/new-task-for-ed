from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from django.contrib.auth.hashers import check_password
import jwt
import datetime
from django.conf import settings
from apps.users.users_all.models import User
from apps.vendors.vendors_all.models import Vendor, QueryVendor
from apps.service.service_all.models import Service
from apps.service_categories.service_categories_all.models import Category
from apps.locations.all_locations.models import Location
from apps.queries.queries_all.models import Query
# QueryVendor moved to vendor app
from apps.bidding.bidding_all.models import Bidding
from apps.packages.packages_all.models import PremiumPackage, ServicePackage
from .serializers import (
    UserSerializer, UserPublicSerializer,
    VendorSerializer, VendorPublicSerializer,
    CategorySerializer, LocationSerializer,
    ServiceSerializer, ServiceCreateSerializer,
    QuerySerializer, QueryCreateSerializer, BiddingSerializer,
    PremiumPackageSerializer, ServicePackageSerializer,
    format_serializer_errors,
)

SECRET_KEY = settings.SECRET_KEY


# ─────────────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────────────
def _make_token(payload_extra: dict) -> str:
    payload = {
        **payload_extra,
        'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=7),
        'iat': datetime.datetime.now(datetime.timezone.utc),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')


def _decode_token(request) -> dict | None:
    auth = request.headers.get('Authorization', '')
    if not auth.startswith('Bearer '):
        return None
    try:
        return jwt.decode(auth[7:], SECRET_KEY, algorithms=['HS256'])
    except jwt.exceptions.PyJWTError:
        return None


# ─────────────────────────────────────────────────────────────────────
# STATUS
# ─────────────────────────────────────────────────────────────────────
@api_view(['GET'])
def server_status(request):
    return Response({"status": "connected", "message": "EventDhara Django API is live 🚀"})


# ─────────────────────────────────────────────────────────────────────
# USER AUTH
# ─────────────────────────────────────────────────────────────────────
@api_view(['POST'])
def register_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token = _make_token({'user_id': user.user_id, 'email': user.email, 'role': 'user'})
        return Response({
            'message': 'Registration successful',
            'token': token,
            'user': UserPublicSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    # Return readable error message
    return Response(
        {'message': format_serializer_errors(serializer.errors), 'errors': serializer.errors},
        status=status.HTTP_400_BAD_REQUEST
    )


@api_view(['POST'])
def login_user(request):
    email = request.data.get('email')
    password = request.data.get('password')
    if not email or not password:
        return Response({'message': 'Email and password required'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({'message': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

    if check_password(password, user.password):
        token = _make_token({'user_id': user.user_id, 'email': user.email, 'role': 'user'})
        return Response({'message': 'Login successful', 'token': token, 'user': UserPublicSerializer(user).data})
    return Response({'message': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET', 'PUT'])
def get_profile(request):
    """GET or PUT current user profile from JWT token"""
    payload = _decode_token(request)
    if not payload:
        return Response({'message': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
    try:
        user = User.objects.get(user_id=payload['user_id'])
        
        if request.method == 'PUT':
            # Allow updating name, number, address
            data = request.data
            if 'name' in data: user.name = data['name']
            if 'number' in data: user.number = data['number']
            if 'address' in data: user.address = data['address']
            
            # Email updates could be supported if needed, but keeping it simpler for now
            # if 'email' in data: user.email = data['email']
            
            # Note: Do not update password through this generic endpoint!
            user.save()
            return Response(UserPublicSerializer(user).data)
            
        return Response(UserPublicSerializer(user).data)
    except User.DoesNotExist:
        return Response({'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


# ─────────────────────────────────────────────────────────────────────
# VENDOR AUTH
# ─────────────────────────────────────────────────────────────────────
@api_view(['POST'])
def register_vendor(request):
    data = request.data.copy()
    # Map frontend field names to model field names
    if 'number' in data and 'phone' not in data:
        data['phone'] = data.pop('number')
    if 'company_name' in data and 'business_name' not in data:
        data['business_name'] = data.pop('company_name')
    # Map 'type' from frontend form to 'vendor_type' in model
    if 'type' in data and 'vendor_type' not in data:
        data['vendor_type'] = data.pop('type')

    serializer = VendorSerializer(data=data)
    if serializer.is_valid():
        vendor = serializer.save()
        token = _make_token({'vendor_id': vendor.vendor_id, 'email': vendor.email, 'role': 'vendor'})
        return Response({
            'message': 'Vendor registration successful! Please await verification.',
            'token': token,
            'vendor': VendorPublicSerializer(vendor).data
        }, status=status.HTTP_201_CREATED)
    # Return readable error message
    return Response(
        {'message': format_serializer_errors(serializer.errors), 'errors': serializer.errors},
        status=status.HTTP_400_BAD_REQUEST
    )


@api_view(['POST'])
def login_vendor(request):
    """Legacy email+password login"""
    email = request.data.get('email')
    password = request.data.get('password')
    if not email or not password:
        return Response({'message': 'Email and password required'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        vendor = Vendor.objects.get(email=email)
    except Vendor.DoesNotExist:
        return Response({'message': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

    if check_password(password, vendor.password):
        token = _make_token({'vendor_id': vendor.vendor_id, 'email': vendor.email, 'role': 'vendor'})
        return Response({'message': 'Login successful', 'token': token, 'vendor': VendorPublicSerializer(vendor).data})
    return Response({'message': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
def request_vendor_otp(request):
    """POST /api/auth/vendor-otp/request/"""
    phone = request.data.get('phone')
    if not phone:
        return Response({'message': 'Phone number is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        vendor = Vendor.objects.get(phone=phone)
    except Vendor.DoesNotExist:
        return Response({'message': 'No registered vendor found with this phone number.'}, status=status.HTTP_404_NOT_FOUND)
        
    import random
    from apps.otp.otp_all.models import Otp
    
    otp_code = str(random.randint(1000, 9999))
    
    # Invalidate old OTPs for this number
    Otp.objects.filter(number=phone).delete()
    
    # Store new OTP
    Otp.objects.create(number=phone, otp=otp_code)
    
    # TODO: Integrate Exotel/WATI to send actual WhatsApp message here
    print(f"🔒 [MOCK WHATSAPP] To Vendor {vendor.business_name} ({phone}): Your EventDhara Vendor Login OTP is {otp_code}")
    
    # Return it in dev mode so we can log it on the frontend console
    return Response({'message': 'OTP sent successfully', 'dev_otp': otp_code})


@api_view(['POST'])
def login_vendor_with_otp(request):
    """POST /api/auth/vendor-otp/verify/"""
    phone = request.data.get('phone')
    otp_input = request.data.get('otp')
    
    if not phone or not otp_input:
        return Response({'message': 'Phone and OTP are required'}, status=status.HTTP_400_BAD_REQUEST)
        
    from apps.otp.otp_all.models import Otp
    from django.utils import timezone
    import datetime
        
    try:
        otp_record = Otp.objects.get(number=phone, otp=otp_input)
        
        # Check expiry (e.g. 5 minutes)
        if timezone.now() > otp_record.time_stamp + datetime.timedelta(minutes=5):
            otp_record.delete()
            return Response({'message': 'OTP has expired'}, status=status.HTTP_400_BAD_REQUEST)
            
        vendor = Vendor.objects.get(phone=phone)
        
        # Success!
        otp_record.delete()
        
        token = _make_token({'vendor_id': vendor.vendor_id, 'email': vendor.email, 'role': 'vendor'})
        return Response({
            'message': 'Login successful',
            'token': token,
            'vendor': VendorPublicSerializer(vendor).data
        })
        
    except Otp.DoesNotExist:
        return Response({'message': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)
    except Vendor.DoesNotExist:
        return Response({'message': 'Vendor account not found'}, status=status.HTTP_404_NOT_FOUND)


# ─────────────────────────────────────────────────────────────────────
# SERVICES (public — used by homepage, service listing)
# ─────────────────────────────────────────────────────────────────────
@api_view(['GET'])
def get_services(request):
    """
    GET /api/services/
    Optional query params:
      ?occasion=birthday
      ?category=Balloon Decoration
      ?city=Indore
    """
    qs = Service.objects.all()

    occasion = request.GET.get('occasion')
    category = request.GET.get('category')
    city = request.GET.get('city')

    if occasion:
        qs = qs.filter(occasion__iexact=occasion)
    if category:
        qs = qs.filter(category_name__iexact=category)
    if city:
        qs = qs.filter(vendor__city__iexact=city)

    return Response(ServiceSerializer(qs, many=True).data)


@api_view(['GET'])
def get_service_detail(request, pk):
    """GET /api/services/<id>/"""
    try:
        service = Service.objects.get(services_id=pk)
        return Response(ServiceSerializer(service).data)
    except Service.DoesNotExist:
        return Response({'message': 'Service not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
def create_service(request):
    """POST /api/services/create/ — vendor only"""
    payload = _decode_token(request)
    if not payload or payload.get('role') != 'vendor':
        return Response({'message': 'Vendor authentication required'}, status=status.HTTP_403_FORBIDDEN)

    data = request.data.copy()
    data['vendor'] = payload.get('vendor_id')
    serializer = ServiceCreateSerializer(data=data)
    if serializer.is_valid():
        service = serializer.save()
        return Response(ServiceSerializer(service).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─────────────────────────────────────────────────────────────────────
# CATEGORIES & LOCATIONS (for dropdowns / filters)
# ─────────────────────────────────────────────────────────────────────
@api_view(['GET'])
def get_categories(request):
    cats = Category.objects.all()
    return Response(CategorySerializer(cats, many=True).data)


@api_view(['GET'])
def get_locations(request):
    locs = Location.objects.all()
    return Response(LocationSerializer(locs, many=True).data)


# ─────────────────────────────────────────────────────────────────────
# QUERIES / INQUIRIES
# ─────────────────────────────────────────────────────────────────────
@api_view(['POST'])
def create_query(request):
    """POST /api/queries/create/"""
    payload = _decode_token(request)
    if not payload or payload.get('role') != 'user':
        return Response({'message': 'User authentication required'}, status=status.HTTP_403_FORBIDDEN)

    data = request.data.copy()
    user_id = payload.get('user_id')
    
    # We set the user ID on the view side
    serializer = QueryCreateSerializer(data=data)
    if serializer.is_valid():
        try:
            user = User.objects.get(user_id=user_id)
            query = serializer.save(user=user)
            
            # Automatically create a QueryVendor record to alert the vendor
            service = query.service
            if service.vendor:
                QueryVendor.objects.create(
                    query=query,
                    vendor=service.vendor,
                    has_accepted=False,
                    status="pending"
                )
            
            return Response(QuerySerializer(query).data, status=status.HTTP_201_CREATED)
        except User.DoesNotExist:
            return Response({'message': 'Invalid user account'}, status=status.HTTP_400_BAD_REQUEST)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def get_user_queries(request):
    """GET /api/queries/my/"""
    payload = _decode_token(request)
    if not payload or payload.get('role') != 'user':
        return Response({'message': 'User authentication required'}, status=status.HTTP_403_FORBIDDEN)

    user_id = payload.get('user_id')
    queries = Query.objects.filter(user_id=user_id).order_by('-time_stamp')
    return Response(QuerySerializer(queries, many=True).data)


@api_view(['GET'])
def get_vendor_queries(request):
    """GET /api/queries/vendor/"""
    payload = _decode_token(request)
    if not payload or payload.get('role') != 'vendor':
        return Response({'message': 'Vendor authentication required'}, status=status.HTTP_403_FORBIDDEN)

    vendor_id = payload.get('vendor_id')
    
    # Find all QueryVendors for this vendor
    query_vendors = QueryVendor.objects.filter(vendor_id=vendor_id).select_related('query')
    # Extract the queries
    queries = [qv.query for qv in query_vendors]
    
    return Response(QuerySerializer(queries, many=True).data)


# ─────────────────────────────────────────────────────────────────────
# ADMIN API (protected – uses is_admin flag on token)
# ─────────────────────────────────────────────────────────────────────
ADMIN_EMAIL = "admin@gmail.com"

def _is_admin(request) -> bool:
    payload = _decode_token(request)
    return payload is not None and payload.get('role') == 'admin'


@api_view(['POST'])
def admin_login(request):
    """POST /api/admin/login/ — Admin authentication"""
    email = request.data.get('email')
    password = request.data.get('password')
    if email == ADMIN_EMAIL and password:
        token = _make_token({'email': email, 'role': 'admin'})
        return Response({'message': 'Admin login successful', 'token': token, 'role': 'admin'})
    return Response({'message': 'Invalid admin credentials'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET'])
def admin_stats(request):
    """GET /api/admin/stats/ — Dashboard statistics"""
    if not _is_admin(request):
        return Response({'message': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    from apps.orders.all_orders.models import Order
    stats = {
        'total_users': User.objects.count(),
        'total_vendors': Vendor.objects.count(),
        'total_orders': Order.objects.count(),
        'total_queries': Query.objects.count(),
        'pending_queries': Query.objects.filter(is_accepted=None).count(),
        'completed_orders': Order.objects.filter(status='completed').count(),
        'pending_orders': Order.objects.filter(status='pending').count(),
        'total_services': Service.objects.count(),
    }
    return Response(stats)


@api_view(['GET'])
def admin_users(request):
    """GET /api/admin/users/ — All users list"""
    if not _is_admin(request):
        return Response({'message': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    users = User.objects.all().order_by('-user_id')
    data = [
        {
            'user_id': u.user_id,
            'name': u.name,
            'email': u.email,
            'number': u.number,
            'blacklist_status': u.blacklist_status,
            'address': u.address,
        }
        for u in users
    ]
    return Response(data)


@api_view(['POST'])
def admin_toggle_user_blacklist(request, user_id):
    """POST /api/admin/users/<id>/toggle-blacklist/"""
    if not _is_admin(request):
        return Response({'message': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    try:
        user = User.objects.get(user_id=user_id)
        user.blacklist_status = 'blacklisted' if user.blacklist_status == 'active' else 'active'
        user.save()
        return Response({'message': f'User status updated to {user.blacklist_status}', 'blacklist_status': user.blacklist_status})
    except User.DoesNotExist:
        return Response({'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
def admin_vendors(request):
    """GET /api/admin/vendors/ — All vendors list"""
    if not _is_admin(request):
        return Response({'message': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    vendors = Vendor.objects.all().order_by('-vendor_id')
    data = [
        {
            'vendor_id': v.vendor_id,
            'name': v.name,
            'business_name': v.business_name,
            'email': v.email,
            'phone': v.phone,
            'city': v.city,
            'state': v.state,
            'country': v.country,
        }
        for v in vendors
    ]
    return Response(data)


@api_view(['GET'])
def admin_orders(request):
    """GET /api/admin/orders/ — All orders list"""
    if not _is_admin(request):
        return Response({'message': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    from apps.orders.all_orders.models import Order
    orders = Order.objects.select_related('user', 'vendor').order_by('-order_id')
    data = [
        {
            'order_id': o.order_id,
            'user_name': o.user.name if o.user else '',
            'vendor_name': o.vendor.business_name if o.vendor else '',
            'total_price': o.total_price,
            'status': o.status,
            'payment_type': o.payment_type,
            'service_date': o.service_date,
            'time_stamp': o.time_stamp,
        }
        for o in orders
    ]
    return Response(data)


@api_view(['GET'])
def admin_queries(request):
    """GET /api/admin/queries/ — All queries/inquiries"""
    if not _is_admin(request):
        return Response({'message': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    queries = Query.objects.select_related('user', 'service').order_by('-query_id')
    data = [
        {
            'query_id': q.query_id,
            'user_name': q.user.name if q.user else '',
            'service_name': q.service.name if q.service else '',
            'location': q.location,
            'service_date': q.service_date,
            'is_urgent': q.is_urgent,
            'is_accepted': q.is_accepted,
            'approx_budget': q.approx_budget,
            'time_stamp': q.time_stamp,
        }
        for q in queries
    ]
    return Response(data)

@api_view(['GET', 'POST'])
def admin_services(request):
    """GET /api/admin/services/ — List all; POST — Create new service"""
    if not _is_admin(request):
        return Response({'message': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    if request.method == 'GET':
        services = Service.objects.all().order_by('-services_id')
        data = [
            {
                'services_id': s.services_id,
                'name': s.name,
                'price': s.price,
                'stock_status': s.stock_status,
                'category_name': s.category_name,
                'vendor_id': s.vendor_id,
                'vendor_name': s.vendor.business_name if s.vendor else ''
            }
            for s in services
        ]
        return Response(data)
    
    elif request.method == 'POST':
        serializer = ServiceCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT', 'DELETE'])
def admin_service_detail(request, pk):
    """PUT /api/admin/services/<pk>/ — Edit; DELETE — Remove service"""
    if not _is_admin(request):
        return Response({'message': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        service = Service.objects.get(pk=pk)
    except Service.DoesNotExist:
        return Response({'message': 'Service not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PUT':
        # Create a serializer that allows partial updates
        for field, value in request.data.items():
            if hasattr(service, field):
                setattr(service, field, value)
        service.save()
        return Response({'message': 'Service updated successfully'})
        
    elif request.method == 'DELETE':
        service.delete()
        return Response({'message': 'Service deleted successfully'}, status=status.HTTP_204_NO_CONTENT)


# ─────────────────────────────────────────────────────────────────────
# PACKAGES API
# ─────────────────────────────────────────────────────────────────────
@api_view(['GET'])
def get_premium_packages(request):
    """GET /api/packages/premium/ — List all premium packages"""
    packages = PremiumPackage.objects.all()
    return Response(PremiumPackageSerializer(packages, many=True).data)

@api_view(['GET'])
def get_service_packages(request):
    """
    GET /api/packages/services/ — List all service packages
    Filters: ?service_id=<id>
    """
    qs = ServicePackage.objects.all()
    service_id = request.GET.get('service_id')
    
    if service_id:
        qs = qs.filter(service_id=service_id)
        
    return Response(ServicePackageSerializer(qs, many=True).data)


# ─────────────────────────────────────────────────────────────────────
# ADMIN — VENDOR APPROVAL FLOW
# ─────────────────────────────────────────────────────────────────────
@api_view(['GET'])
def admin_vendor_approvals(request):
    """GET /api/admin/vendor-approvals/ — List vendors pending approval"""
    if not _is_admin(request):
        return Response({'message': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)

    pending = Vendor.objects.filter(
        onboarding_completed=True,
        is_approved=False,
        is_blacklisted=False
    ).order_by('-vendor_id')

    data = []
    for v in pending:
        has_bank = hasattr(v, 'bank_details')
        has_agreement = hasattr(v, 'agreement') and v.agreement.is_fully_signed()
        data.append({
            'vendor_id': v.vendor_id,
            'name': v.name,
            'business_name': v.business_name,
            'owner_name': v.owner_name,
            'email': v.email,
            'phone': v.phone,
            'city': v.city,
            'vendor_type': v.vendor_type,
            'onboarding_step': v.onboarding_step,
            'onboarding_completed': v.onboarding_completed,
            'photo_count': v.photos.count(),
            'approved_photos': v.photos.filter(is_approved=True).count(),
            'has_bank_details': has_bank,
            'bank_status': v.bank_details.verification_status if has_bank else 'none',
            'has_agreement': has_agreement,
            'created_at': v.created_at,
        })
    return Response({'pending_count': len(data), 'vendors': data})


@api_view(['PATCH'])
def admin_approve_vendor(request, vendor_id):
    """PATCH /api/admin/vendor/<id>/approve/"""
    if not _is_admin(request):
        return Response({'message': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)

    try:
        vendor = Vendor.objects.get(vendor_id=vendor_id)
    except Vendor.DoesNotExist:
        return Response({'message': 'Vendor not found'}, status=status.HTTP_404_NOT_FOUND)

    import datetime as dt
    now = datetime.datetime.now(datetime.timezone.utc)

    vendor.is_approved = True
    vendor.is_active = True
    vendor.is_verified = True
    vendor.approved_at = now
    vendor.score = max(vendor.score, 50)  # ensure default 50

    # Apply +20 new vendor boost for 14 days
    vendor.score_boost_expires_at = now + dt.timedelta(days=14)
    vendor.score += 20

    from apps.vendors.vendors_all.models import VendorScoreLog
    VendorScoreLog.objects.create(
        vendor=vendor,
        old_score=vendor.score - 20,
        new_score=vendor.score,
        delta=20,
        reason='New vendor approval bonus (+20 for 14 days)',
    )
    vendor.save()

    # TODO: Send WhatsApp "Welcome to EventDhara! Your profile is live."

    return Response({
        'message': f'Vendor {vendor.business_name} approved successfully!',
        'vendor_id': vendor.vendor_id,
        'score_after_boost': vendor.score,
        'boost_expires': vendor.score_boost_expires_at,
        'whatsapp_sent': False,  # TODO: integrate WATI
    })


@api_view(['PATCH'])
def admin_reject_vendor(request, vendor_id):
    """PATCH /api/admin/vendor/<id>/reject/"""
    if not _is_admin(request):
        return Response({'message': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)

    try:
        vendor = Vendor.objects.get(vendor_id=vendor_id)
    except Vendor.DoesNotExist:
        return Response({'message': 'Vendor not found'}, status=status.HTTP_404_NOT_FOUND)

    reason = request.data.get('reason', 'Did not meet quality standards')
    vendor.is_active = False
    vendor.is_approved = False
    vendor.save()

    # TODO: Notify vendor via WhatsApp with rejection reason

    return Response({
        'message': f'Vendor {vendor.business_name} rejected.',
        'reason': reason,
    })


@api_view(['PATCH'])
def admin_blacklist_vendor(request, vendor_id):
    """PATCH /api/admin/vendor/<id>/blacklist/"""
    if not _is_admin(request):
        return Response({'message': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)

    try:
        vendor = Vendor.objects.get(vendor_id=vendor_id)
    except Vendor.DoesNotExist:
        return Response({'message': 'Vendor not found'}, status=status.HTTP_404_NOT_FOUND)

    reason = request.data.get('reason', '')
    action = request.data.get('action', 'blacklist')  # 'blacklist' or 'unblacklist'

    if action == 'unblacklist':
        vendor.is_blacklisted = False
        vendor.is_active = True
        vendor.save()
        return Response({'message': f'Vendor {vendor.business_name} removed from blacklist.'})

    vendor.is_blacklisted = True
    vendor.is_active = False

    # Optional: Apply score penalty
    penalty = int(request.data.get('score_penalty', 0))
    if penalty > 0:
        from apps.vendors.vendors_all.models import VendorScoreLog
        old = vendor.score
        vendor.score = max(0, vendor.score - penalty)
        VendorScoreLog.objects.create(
            vendor=vendor,
            old_score=old,
            new_score=vendor.score,
            delta=-penalty,
            reason=f'Admin blacklist penalty: {reason}',
        )
    vendor.save()

    return Response({
        'message': f'Vendor {vendor.business_name} blacklisted.',
        'reason': reason,
        'score_penalty_applied': penalty,
    })


# ─────────────────────────────────────────────────────────────────────
# ADMIN — PHOTO APPROVAL
# ─────────────────────────────────────────────────────────────────────
@api_view(['GET'])
def admin_pending_photos(request):
    """GET /api/admin/vendor/photos/pending/"""
    if not _is_admin(request):
        return Response({'message': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)

    from apps.vendors.vendors_all.models import VendorPhoto
    photos = VendorPhoto.objects.filter(is_approved__isnull=True).select_related('vendor').order_by('-uploaded_at')
    data = [{
        'photo_id': p.id,
        'photo_url': p.photo_url,
        'vendor_id': p.vendor.vendor_id,
        'vendor_name': p.vendor.business_name,
        'occasion_tag': p.occasion_tag,
        'uploaded_at': p.uploaded_at,
    } for p in photos]
    return Response({'pending_count': len(data), 'photos': data})


@api_view(['PATCH'])
def admin_approve_photo(request, photo_id):
    """PATCH /api/admin/vendor/photos/<id>/approve/"""
    if not _is_admin(request):
        return Response({'message': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)

    from apps.vendors.vendors_all.models import VendorPhoto
    from django.utils import timezone as tz
    try:
        photo = VendorPhoto.objects.get(id=photo_id)
    except VendorPhoto.DoesNotExist:
        return Response({'message': 'Photo not found'}, status=status.HTTP_404_NOT_FOUND)

    photo.is_approved = True
    photo.approved_at = tz.now()
    photo.save()
    return Response({'message': 'Photo approved', 'photo_id': photo_id})


@api_view(['PATCH'])
def admin_reject_photo(request, photo_id):
    """PATCH /api/admin/vendor/photos/<id>/reject/"""
    if not _is_admin(request):
        return Response({'message': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)

    from apps.vendors.vendors_all.models import VendorPhoto
    try:
        photo = VendorPhoto.objects.get(id=photo_id)
    except VendorPhoto.DoesNotExist:
        return Response({'message': 'Photo not found'}, status=status.HTTP_404_NOT_FOUND)

    reason = request.data.get('reason', 'other')
    photo.is_approved = False
    photo.rejection_reason = reason
    photo.save()
    return Response({'message': 'Photo rejected', 'reason': reason, 'photo_id': photo_id})


# ─────────────────────────────────────────────────────────────────────
# VENDORS PUBLIC
# ─────────────────────────────────────────────────────────────────────
@api_view(['GET'])
def get_vendor_portfolio(request, vendor_id):
    """GET /api/vendors/<id>/portfolio/ — Public view of a vendor's approved photos"""
    try:
        vendor = Vendor.objects.get(vendor_id=vendor_id)
        if not vendor.is_approved or vendor.is_blacklisted:
            return Response({'message': 'Vendor unavailable'}, status=status.HTTP_404_NOT_FOUND)
        
        photos = vendor.photos.filter(is_approved=True).order_by('-uploaded_at')
        
        return Response({
            'vendor_id': vendor.vendor_id,
            'business_name': vendor.business_name,
            'brand_logo': vendor.brand_logo,
            'bio': getattr(vendor, 'bio', ''),
            'city': vendor.city,
            'score': vendor.score,
            'avg_rating': vendor.avg_rating,
            'portfolio': [
                {
                    'photo_id': p.id,
                    'photo_url': p.photo_url,
                    'occasion_tag': p.occasion_tag,
                    'uploaded_at': p.uploaded_at
                } for p in photos
            ]
        })
    except Vendor.DoesNotExist:
        return Response({'message': 'Vendor not found'}, status=status.HTTP_404_NOT_FOUND)


# ─────────────────────────────────────────────────────────────────────
# ADMIN — HOLD PAYOUT FOR VENDOR
# ─────────────────────────────────────────────────────────────────────
@api_view(['POST'])
def admin_hold_vendor_payout(request, vendor_id):
    """
    POST /api/admin/vendor/<id>/hold-payout/
    Body: { "reason": "...", "order_id": <optional> }
    Holds all pending/processing payouts for this vendor.
    """
    if not _is_admin(request):
        return Response({'message': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)

    try:
        vendor = Vendor.objects.get(vendor_id=vendor_id)
    except Vendor.DoesNotExist:
        return Response({'message': 'Vendor not found'}, status=status.HTTP_404_NOT_FOUND)

    from apps.payments.payments_all.models import Payout
    from apps.admin_panel.models import AdminAlert
    import datetime as dt

    reason = request.data.get('reason', 'Admin-initiated payout hold')
    order_id = request.data.get('order_id')

    # Hold all pending/processing payouts
    payout_qs = Payout.objects.filter(vendor=vendor, status__in=['pending', 'processing'])
    if order_id:
        payout_qs = payout_qs.filter(order_id=order_id)

    held_count = payout_qs.count()
    payout_qs.update(status='held', held_reason=reason)

    # Also mark the vendor orders
    from apps.orders.all_orders.models import Order
    order_qs = Order.objects.filter(vendor=vendor, payout_status__in=['pending', 'processing'])
    if order_id:
        order_qs = order_qs.filter(order_id=order_id)
    order_qs.update(payout_status='held')

    # Create admin alert
    AdminAlert.objects.create(
        severity='WARNING',
        title=f'Payout held: {vendor.business_name}',
        description=f'Admin held {held_count} payout(s). Reason: {reason}',
        vendor_id=vendor_id,
        order_id=order_id,
        action_label='Review Violations',
        is_resolved=False,
    )

    return Response({
        'message': f'Payout hold applied to {vendor.business_name}.',
        'payouts_held': held_count,
        'reason': reason,
    })


# ─────────────────────────────────────────────────────────────────────
# ADMIN — MANUAL SCORE PENALTY
# ─────────────────────────────────────────────────────────────────────
@api_view(['POST'])
def admin_score_penalty(request, vendor_id):
    """
    POST /api/admin/vendor/<id>/score-penalty/
    Body: { "points": 15, "reason": "...", "duration_days": 7 }
    Applies a manual score deduction to the vendor.
    """
    if not _is_admin(request):
        return Response({'message': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)

    try:
        vendor = Vendor.objects.get(vendor_id=vendor_id)
    except Vendor.DoesNotExist:
        return Response({'message': 'Vendor not found'}, status=status.HTTP_404_NOT_FOUND)

    points = int(request.data.get('points', 10))
    reason = request.data.get('reason', 'Admin manual score penalty')
    duration_days = int(request.data.get('duration_days', 7))

    from apps.vendors.vendors_all.score_service import apply_score_penalty
    new_score = apply_score_penalty(vendor, points=points, reason=reason, duration_days=duration_days)

    from apps.admin_panel.models import AdminAlert
    AdminAlert.objects.create(
        severity='WARNING',
        title=f'Score penalty: {vendor.business_name} (-{points} pts)',
        description=f'Reason: {reason} | Duration: {duration_days} days',
        vendor_id=vendor_id,
        is_resolved=True,
    )

    return Response({
        'message': f'Score penalty applied: -{points} pts for {duration_days} day(s).',
        'vendor_id': vendor_id,
        'new_score': new_score,
        'reason': reason,
    })


# ─────────────────────────────────────────────────────────────────────
# ADMIN — RECORD VIOLATION + AUTO CONSEQUENCE
# ─────────────────────────────────────────────────────────────────────

VIOLATION_CONSEQUENCES = {
    'share_phone': {
        1: {'action': 'warning',    'score_penalty': 5,  'hold_payout': False, 'suspend': False},
        2: {'action': 'suspension', 'score_penalty': 20, 'hold_payout': True,  'suspend': True},
    },
    'share_insta': {
        1: {'action': 'warning',    'score_penalty': 5,  'hold_payout': False, 'suspend': False},
        2: {'action': 'suspension', 'score_penalty': 20, 'hold_payout': True,  'suspend': True},
    },
    'ask_upi': {
        1: {'action': 'critical_review', 'score_penalty': 25, 'hold_payout': True,  'suspend': False},
    },
    'direct_discount': {
        1: {'action': 'suspension', 'score_penalty': 30, 'hold_payout': True,  'suspend': True},
    },
    'external_booking': {
        1: {'action': 'permanent_ban', 'score_penalty': 100, 'hold_payout': True, 'suspend': True, 'blacklist': True},
    },
    'other': {
        1: {'action': 'warning', 'score_penalty': 10, 'hold_payout': False, 'suspend': False},
    },
}


@api_view(['POST'])
def admin_record_violation(request, vendor_id):
    """
    POST /api/admin/vendor/<id>/violation/
    Body: {
        "violation_type": "ask_upi",
        "description": "...",
        "severity": "warning"  (optional override)
    }
    Records a violation and automatically applies the appropriate consequence
    based on violation type and prior offense count.
    """
    if not _is_admin(request):
        return Response({'message': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)

    try:
        vendor = Vendor.objects.get(vendor_id=vendor_id)
    except Vendor.DoesNotExist:
        return Response({'message': 'Vendor not found'}, status=status.HTTP_404_NOT_FOUND)

    from apps.vendors.vendors_all.models import VendorViolation, VendorScoreLog
    from apps.admin_panel.models import AdminAlert
    from apps.payments.payments_all.models import Payout
    from apps.vendors.vendors_all.score_service import apply_score_penalty

    violation_type = request.data.get('violation_type', 'other')
    description    = request.data.get('description', '')
    order_id       = request.data.get('order_id')

    # Count prior violations of this type
    prior_count = VendorViolation.objects.filter(
        vendor=vendor,
        violation_type=violation_type,
    ).count()
    offense_num = prior_count + 1  # This is the Nth offense

    # Determine consequence
    consequence_map = VIOLATION_CONSEQUENCES.get(violation_type, VIOLATION_CONSEQUENCES['other'])
    # Use the highest defined offense if current offense exceeds the map
    offense_key = min(offense_num, max(consequence_map.keys()))
    consequence = consequence_map[offense_key]

    severity_map = {
        'warning':        'warning',
        'suspension':     'suspension',
        'critical_review':'suspension',
        'permanent_ban':  'ban',
    }
    severity = severity_map.get(consequence['action'], 'warning')

    # Record the violation
    violation = VendorViolation.objects.create(
        vendor=vendor,
        violation_type=violation_type,
        severity=severity,
        description=description,
        action_taken=consequence['action'],
    )

    actions_taken = []

    # ── Apply score penalty ──────────────────────────────────────────
    penalty_pts = consequence.get('score_penalty', 0)
    if penalty_pts > 0:
        apply_score_penalty(vendor, points=penalty_pts, reason=f'Violation: {violation_type} (offense #{offense_num})', duration_days=30)
        actions_taken.append(f'Score penalty: -{penalty_pts} pts')

    # ── Hold payout ──────────────────────────────────────────────────
    if consequence.get('hold_payout'):
        Payout.objects.filter(vendor=vendor, status__in=['pending', 'processing']).update(
            status='held',
            held_reason=f'Violation: {violation_type}'
        )
        from apps.orders.all_orders.models import Order
        Order.objects.filter(vendor=vendor, payout_status__in=['pending', 'processing']).update(payout_status='held')
        actions_taken.append('Payouts held')

    # ── Suspend vendor ───────────────────────────────────────────────
    if consequence.get('suspend'):
        vendor.is_active = False
        actions_taken.append('Vendor suspended')

    # ── Permanently blacklist ─────────────────────────────────────────
    if consequence.get('blacklist'):
        vendor.is_blacklisted = True
        vendor.is_active = False
        actions_taken.append('Vendor permanently blacklisted')

    vendor.save()

    # Update violation record with actions
    violation.action_taken = ' | '.join(actions_taken)
    violation.save()

    # ── Create admin alert ───────────────────────────────────────────
    alert_severity = 'CRITICAL' if severity in ('suspension', 'ban') else 'WARNING'
    AdminAlert.objects.create(
        severity=alert_severity,
        title=f'Violation recorded: {vendor.business_name} — {violation_type}',
        description=(
            f'Offense #{offense_num}. Action: {consequence["action"]}. '
            f'{description[:150] if description else ""}'
        ),
        vendor_id=vendor_id,
        order_id=order_id,
        action_label='Review Vendor',
        is_resolved=False,
    )

    return Response({
        'message': f'Violation recorded. Consequence: {consequence["action"]}',
        'violation_id': violation.id,
        'offense_number': offense_num,
        'violation_type': violation_type,
        'severity': severity,
        'actions_taken': actions_taken,
        'new_score': vendor.score,
        'vendor_status': {
            'is_active': vendor.is_active,
            'is_blacklisted': vendor.is_blacklisted,
        },
    }, status=status.HTTP_201_CREATED)


# ─────────────────────────────────────────────────────────────────────
# ADMIN — TRIGGER SCORE RECALCULATION
# ─────────────────────────────────────────────────────────────────────
@api_view(['POST'])
def admin_trigger_score_recalc(request):
    """
    POST /api/admin/trigger-score-recalc/
    Triggers an immediate composite score recalculation for all vendors.
    Optional body: { "vendor_id": 123 } for single vendor.
    """
    if not _is_admin(request):
        return Response({'message': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)

    vendor_id = request.data.get('vendor_id')

    if vendor_id:
        try:
            vendor = Vendor.objects.get(vendor_id=vendor_id)
        except Vendor.DoesNotExist:
            return Response({'message': 'Vendor not found'}, status=status.HTTP_404_NOT_FOUND)
        from apps.vendors.vendors_all.score_service import calculate_composite_score
        new_score = calculate_composite_score(vendor)
        return Response({
            'message': f'Score recalculated for {vendor.business_name}.',
            'vendor_id': vendor_id,
            'new_score': new_score,
            'tier': vendor.tier,
        })

    from apps.vendors.vendors_all.score_service import recalculate_all_vendor_scores
    results = recalculate_all_vendor_scores()
    ok_count  = sum(1 for r in results if 'error' not in r)
    err_count = sum(1 for r in results if 'error' in r)
    return Response({
        'message': f'Score recalculation complete for {ok_count} vendors ({err_count} errors).',
        'results_sample': results[:10],
    })


# ─────────────────────────────────────────────────────────────────────
# ADMIN — LOW CONVERSION AUDIT TRIGGERS
# ─────────────────────────────────────────────────────────────────────
@api_view(['GET'])
def admin_audit_triggers(request):
    """
    GET /api/admin/audit-triggers/
    Returns vendors with suspiciously low conversion rates (possible bypass).
    Default: 20+ accepted leads, <25% close rate.
    Query params: ?min_leads=20&max_rate=25
    """
    if not _is_admin(request):
        return Response({'message': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)

    min_leads  = int(request.GET.get('min_leads', 20))
    max_rate   = int(request.GET.get('max_rate', 25)) / 100.0

    from apps.vendors.vendors_all.score_service import detect_low_conversion_vendors
    suspects = detect_low_conversion_vendors(min_leads=min_leads, max_close_rate=max_rate)
    return Response({
        'suspect_count': len(suspects),
        'threshold': {
            'min_leads': min_leads,
            'max_close_rate_pct': int(max_rate * 100),
        },
        'suspects': suspects,
    })


# ─────────────────────────────────────────────────────────────────────
# ADMIN — LIST VENDOR VIOLATIONS
# ─────────────────────────────────────────────────────────────────────
@api_view(['GET'])
def admin_vendor_violations(request, vendor_id):
    """
    GET /api/admin/vendor/<id>/violations/
    Lists all recorded violations for a vendor.
    """
    if not _is_admin(request):
        return Response({'message': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)

    try:
        vendor = Vendor.objects.get(vendor_id=vendor_id)
    except Vendor.DoesNotExist:
        return Response({'message': 'Vendor not found'}, status=status.HTTP_404_NOT_FOUND)

    from apps.vendors.vendors_all.models import VendorViolation
    violations = VendorViolation.objects.filter(vendor=vendor).order_by('-reported_at')
    data = [{
        'id': v.id,
        'violation_type': v.violation_type,
        'severity': v.severity,
        'description': v.description,
        'action_taken': v.action_taken,
        'resolved': v.resolved,
        'reported_at': v.reported_at,
    } for v in violations]
    return Response({
        'vendor_id': vendor_id,
        'business_name': vendor.business_name,
        'total_violations': len(data),
        'violations': data,
    })


# ─────────────────────────────────────────────────────────────────────
# ADMIN — VENDOR FULL PROFILE (for review panel)
# ─────────────────────────────────────────────────────────────────────
@api_view(['GET'])
def admin_vendor_profile(request, vendor_id):
    """
    GET /api/admin/vendor/<id>/profile/
    Full vendor profile for admin review — includes score, tier, violations, payouts.
    """
    if not _is_admin(request):
        return Response({'message': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)

    try:
        vendor = Vendor.objects.get(vendor_id=vendor_id)
    except Vendor.DoesNotExist:
        return Response({'message': 'Vendor not found'}, status=status.HTTP_404_NOT_FOUND)

    from apps.orders.all_orders.models import Order
    from apps.vendors.vendors_all.models import QueryVendor, VendorViolation, VendorScoreLog

    completed_orders = Order.objects.filter(vendor=vendor, status='paid_out').count()
    total_leads      = QueryVendor.objects.filter(vendor=vendor).count()
    accepted_leads   = QueryVendor.objects.filter(vendor=vendor, status='accepted').count()
    violations       = VendorViolation.objects.filter(vendor=vendor).count()
    recent_score_logs = list(
        VendorScoreLog.objects.filter(vendor=vendor).order_by('-timestamp').values()[:5]
    )

    return Response({
        'vendor_id': vendor.vendor_id,
        'name': vendor.name,
        'business_name': vendor.business_name,
        'owner_name': vendor.owner_name,
        'email': vendor.email,
        'phone': vendor.phone,
        'whatsapp_number': vendor.whatsapp_number,
        'city': vendor.city,
        'vendor_type': vendor.vendor_type,
        'tier': vendor.tier,
        'score': vendor.score,
        'is_active': vendor.is_active,
        'is_approved': vendor.is_approved,
        'is_blacklisted': vendor.is_blacklisted,
        'is_premium': vendor.is_premium,
        'onboarding_completed': vendor.onboarding_completed,
        'approved_at': vendor.approved_at,
        'created_at': vendor.created_at,
        'performance': {
            'response_rate': vendor.response_rate,
            'avg_rating': vendor.avg_rating,
            'completion_rate': vendor.completion_rate,
            'total_leads_assigned': total_leads,
            'accepted_leads': accepted_leads,
            'completed_orders': completed_orders,
            'total_violations': violations,
        },
        'recent_score_history': recent_score_logs,
    })
