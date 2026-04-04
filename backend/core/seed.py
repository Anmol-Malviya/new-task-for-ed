"""
Seed script — run with:
  & "c:\Users\anmol\OneDrive\Pictures\ED-AI\.venv\Scripts\python.exe" manage.py shell < core/seed.py
"""
import django, os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.service.service_all.models import Service
from apps.service_categories.service_categories_all.models import Category
from apps.locations.all_locations.models import Location

# ── Locations ─────────────────────────────────────────────────────────
cities = ["Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain", "Rewa"]
for c in cities:
    Location.objects.get_or_create(name=c)

# ── Categories ────────────────────────────────────────────────────────
categories = [
    ("Balloon Decoration", 1), ("Floral Decoration", 2), ("Cake & Desserts", 3),
    ("Photography", 4), ("Videography", 5), ("Makeup & Styling", 6),
    ("DJ & Music", 7), ("Mehndi", 8), ("Lighting", 9), ("Invitation Cards", 10),
]
for name, num in categories:
    Category.objects.get_or_create(name=name, defaults={'number': num})

# ── Services ──────────────────────────────────────────────────────────
services_data = [
    # Birthday
    dict(name='Premium Balloon Decoration', category_name='Balloon Decoration', occasion='birthday',
         price=2499, original_price=3499, ratings=4.9, review_count=312, badge='Best Seller',
         image_url='https://eventdhara.in/assets/birthday_deco-BY5efEb2.webp',
         short_desc='Stunning balloon arches, pillars & customized themes for your birthday party.'),
    dict(name='Birthday Photography Package', category_name='Photography', occasion='birthday',
         price=3999, original_price=5999, ratings=4.8, review_count=187, badge='Top Rated',
         image_url='https://eventdhara.in/assets/photography-CfqeqwVs.webp',
         short_desc='Professional candid & portrait photography for birthday celebrations.'),
    dict(name='Custom Birthday Cake', category_name='Cake & Desserts', occasion='birthday',
         price=1299, original_price=1799, ratings=4.7, review_count=256, badge=None,
         image_url='https://eventdhara.in/assets/birthday_cake-CagO_9aR.webp',
         short_desc='Delicious custom fondant cakes shaped to your birthday theme.'),
    dict(name='Floral Birthday Setup', category_name='Floral Decoration', occasion='birthday',
         price=3299, original_price=4499, ratings=4.8, review_count=145, badge='New',
         image_url='https://eventdhara.in/assets/floral_setup-B7JWLcCR.webp',
         short_desc='Fresh floral arrangements and centerpieces for a beautiful birthday setting.'),

    # Anniversary
    dict(name='Romantic Anniversary Decoration', category_name='Floral Decoration', occasion='anniversary',
         price=4999, original_price=6999, ratings=4.9, review_count=198, badge='Premium',
         image_url='https://eventdhara.in/assets/anniversary-Dz7v_JvS.webp',
         short_desc='Rose petal trails, candle lighting, and floral backdrop for your anniversary.'),
    dict(name='Anniversary Couple Photoshoot', category_name='Photography', occasion='anniversary',
         price=5499, original_price=7499, ratings=4.9, review_count=132, badge='Best Seller',
         image_url='https://eventdhara.in/assets/photography-CfqeqwVs.webp',
         short_desc='Cinematic couple photoshoot with stunning location setups.'),
    dict(name='Anniversary Cake & Desserts', category_name='Cake & Desserts', occasion='anniversary',
         price=1999, original_price=2799, ratings=4.7, review_count=88, badge=None,
         image_url='https://eventdhara.in/assets/anniversary_cake-CGGU7GEq.webp',
         short_desc='Elegant tiered cakes and dessert tables for your anniversary celebration.'),

    # Wedding
    dict(name='Grand Floral Wedding Decoration', category_name='Floral Decoration', occasion='wedding',
         price=24999, original_price=34999, ratings=5.0, review_count=423, badge='Top Rated',
         image_url='https://eventdhara.in/assets/floral_setup-B7JWLcCR.webp',
         short_desc='Mandap decoration, floral arches, stage setup, and guest area décor.'),
    dict(name='Wedding Photography & Video', category_name='Photography', occasion='wedding',
         price=39999, original_price=59999, ratings=4.9, review_count=317, badge='Premium',
         image_url='https://eventdhara.in/assets/photography-CfqeqwVs.webp',
         short_desc='Complete wedding coverage - pre-wedding shoot, ceremony, and reception.'),
    dict(name='Bridal Makeup & Styling', category_name='Makeup & Styling', occasion='wedding',
         price=9999, original_price=14999, ratings=4.9, review_count=289, badge='Best Seller',
         image_url='https://eventdhara.in/assets/makeup-7cNvNqxk.webp',
         short_desc='HD bridal makeup with traditional or contemporary looks by expert artists.'),

    # Baby Shower
    dict(name='Baby Shower Balloon Decoration', category_name='Balloon Decoration', occasion='baby_shower',
         price=3499, original_price=4999, ratings=4.8, review_count=167, badge='Trending',
         image_url='https://eventdhara.in/assets/birthday_deco-BY5efEb2.webp',
         short_desc='Pastel balloon walls, ceiling balloons, and baby shower-themed setups.'),
    dict(name='Baby Shower Photography', category_name='Photography', occasion='baby_shower',
         price=4499, original_price=5999, ratings=4.7, review_count=98, badge=None,
         image_url='https://eventdhara.in/assets/photography-CfqeqwVs.webp',
         short_desc='Precious memories captured with candid and posed shots at your baby shower.'),

    # Engagement
    dict(name='Engagement Ring Ceremony Décor', category_name='Floral Decoration', occasion='engagement',
         price=8999, original_price=12999, ratings=4.8, review_count=211, badge='Popular',
         image_url='https://eventdhara.in/assets/anniversary-Dz7v_JvS.webp',
         short_desc='Elegant floral and lighting setup for a memorable ring ceremony.'),
    dict(name='Engagement Photoshoot', category_name='Photography', occasion='engagement',
         price=6499, original_price=8999, ratings=4.9, review_count=174, badge='Best Seller',
         image_url='https://eventdhara.in/assets/photography-CfqeqwVs.webp',
         short_desc='Pre-engagement and ceremony photography to cherish forever.'),

    # Bachelorette
    dict(name='Bachelorette Party Decoration', category_name='Balloon Decoration', occasion='bachelorette',
         price=3999, original_price=5499, ratings=4.7, review_count=143, badge='Fun',
         image_url='https://eventdhara.in/assets/birthday_deco-BY5efEb2.webp',
         short_desc='Glam décor with sparkles, balloons, and neon signs for the bride-to-be.'),
]

created_count = 0
for s in services_data:
    obj, created = Service.objects.get_or_create(
        name=s['name'],
        occasion=s['occasion'],
        defaults={k: v for k, v in s.items() if k not in ('name', 'occasion')}
    )
    if created:
        created_count += 1

print(f"✅ Seed complete: {created_count} services created ({len(services_data) - created_count} already existed)")
print(f"ℹ️  Total services in DB: {Service.objects.count()}")
