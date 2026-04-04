"""
Seed script for Vendors
"""
import django, os
import random
from django.contrib.auth.hashers import make_password

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.models import Vendor, Service

vendors_data = [
    {
        'name': 'Rahul Sharma',
        'email': 'rahul.decor@example.com',
        'business_name': 'Sharma Decorations',
        'description': 'Expert in premium floral and balloon decorations for all occasions.',
        'phone': '9876543210',
        'address': 'Vijay Nagar, Indore',
        'city': 'Indore',
        'state': 'Madhya Pradesh',
        'country': 'India',
    },
    {
        'name': 'Priya Singh',
        'email': 'priya.photo@example.com',
        'business_name': 'Singh Photography',
        'description': 'Capturing your special moments with cinematic excellence.',
        'phone': '8765432109',
        'address': 'Arera Colony, Bhopal',
        'city': 'Bhopal',
        'state': 'Madhya Pradesh',
        'country': 'India',
    },
    {
        'name': 'Amit Verma',
        'email': 'amit.events@example.com',
        'business_name': 'Amit Event Planners',
        'description': 'Full-service event planning and management for weddings and corporate events.',
        'phone': '7654321098',
        'address': 'Madan Mahal, Jabalpur',
        'city': 'Jabalpur',
        'state': 'Madhya Pradesh',
        'country': 'India',
    },
    {
        'name': 'Ananya Goel',
        'email': 'ananya.makeup@example.com',
        'business_name': 'Glow by Ananya',
        'description': 'Professional HD and airbrush makeup for brides and parties.',
        'phone': '6543210987',
        'address': 'Gwalior Fort Road, Gwalior',
        'city': 'Gwalior',
        'state': 'Madhya Pradesh',
        'country': 'India',
    }
]

created_vendors = []
for v_data in vendors_data:
    vendor, created = Vendor.objects.update_or_create(
        email=v_data['email'],
        defaults={
            **v_data,
            'password': make_password('12345678')
        }
    )
    created_vendors.append(vendor)
    if created:
        print(f"✅ Vendor created: {vendor.business_name} ({vendor.email})")
    else:
        print(f"ℹ️  Vendor updated: {vendor.business_name}")

# Link services to vendors randomly
all_services = Service.objects.all()
for service in all_services:
    if created_vendors:
        vendor = random.choice(created_vendors)
        service.vendor = vendor
        service.save()

print(f"\n✅ All {all_services.count()} services have been linked to random vendors.")
print("✅ Seeding complete!")
