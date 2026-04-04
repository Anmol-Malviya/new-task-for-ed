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
