from django.core.management.base import BaseCommand
from core.models import Service, Category, Location


class Command(BaseCommand):
    help = 'Seed database with sample services for all occasions'

    def handle(self, *args, **options):
        # Locations
        cities = ["Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain", "Rewa"]
        for c in cities:
            Location.objects.get_or_create(name=c)
        self.stdout.write(f'  Locations: {len(cities)} ensured')

        # Categories
        categories = [
            ("Balloon Decoration", 1), ("Floral Decoration", 2),
            ("Cake & Desserts", 3), ("Photography", 4), ("Videography", 5),
            ("Makeup & Styling", 6), ("DJ & Music", 7), ("Mehndi", 8),
            ("Lighting", 9), ("Invitation Cards", 10),
        ]
        for name, num in categories:
            Category.objects.get_or_create(name=name, defaults={'number': num})
        self.stdout.write(f'  Categories: {len(categories)} ensured')

        # Services
        services_data = [
            # Birthday
            {'name': 'Premium Balloon Decoration', 'category_name': 'Balloon Decoration',
             'occasion': 'birthday', 'price': 2499, 'original_price': 3499,
             'ratings': 4.9, 'review_count': 312, 'badge': 'Best Seller',
             'image_url': '/images/ed/birthday/01.jpg',
             'short_desc': 'Stunning balloon arches, pillars & customized themes.'},
            {'name': 'Birthday Photography Package', 'category_name': 'Photography',
             'occasion': 'birthday', 'price': 3999, 'original_price': 5999,
             'ratings': 4.8, 'review_count': 187, 'badge': 'Top Rated',
             'image_url': '/images/ed/ring_ceremony/0c522bb625edab9c391e86739a78f2bd.jpg',
             'short_desc': 'Professional candid & portrait photography.'},
            {'name': 'Custom Birthday Cake', 'category_name': 'Cake & Desserts',
             'occasion': 'birthday', 'price': 1299, 'original_price': 1799,
             'ratings': 4.7, 'review_count': 256, 'badge': None,
             'image_url': '/images/ed/birthday/02.jpg',
             'short_desc': 'Delicious custom fondant cakes.'},
            {'name': 'Floral Birthday Setup', 'category_name': 'Floral Decoration',
             'occasion': 'birthday', 'price': 3299, 'original_price': 4499,
             'ratings': 4.8, 'review_count': 145, 'badge': 'New',
             'image_url': '/images/ed/anniversary/0257132cab7b41faef5e6db31867aaf4.jpg',
             'short_desc': 'Fresh floral arrangements and centerpieces.'},
            # Anniversary
            {'name': 'Romantic Anniversary Decoration', 'category_name': 'Floral Decoration',
             'occasion': 'anniversary', 'price': 4999, 'original_price': 6999,
             'ratings': 4.9, 'review_count': 198, 'badge': 'Premium',
             'image_url': '/images/ed/anniversary/15d3755609549dfa8ed643feca2e51e4.jpg',
             'short_desc': 'Rose petal trails, candles, and floral backdrop.'},
            {'name': 'Anniversary Couple Photoshoot', 'category_name': 'Photography',
             'occasion': 'anniversary', 'price': 5499, 'original_price': 7499,
             'ratings': 4.9, 'review_count': 132, 'badge': 'Best Seller',
             'image_url': '/images/ed/ring_ceremony/1e7921f32f76e3a14f530b2bd1e1e151.jpg',
             'short_desc': 'Cinematic couple photoshoot with stunning setups.'},
            {'name': 'Anniversary Cake & Desserts', 'category_name': 'Cake & Desserts',
             'occasion': 'anniversary', 'price': 1999, 'original_price': 2799,
             'ratings': 4.7, 'review_count': 88, 'badge': None,
             'image_url': '/images/ed/anniversary/20192c8079962726190f0afe2d10c87b.jpg',
             'short_desc': 'Elegant tiered cakes and dessert tables.'},
            # Wedding
            {'name': 'Grand Floral Wedding Decoration', 'category_name': 'Floral Decoration',
             'occasion': 'wedding', 'price': 24999, 'original_price': 34999,
             'ratings': 5.0, 'review_count': 423, 'badge': 'Top Rated',
             'image_url': '/images/ed/mandap/Mandap1.jpeg',
             'short_desc': 'Mandap, floral arches, stage setup, and guest decor.'},
            {'name': 'Wedding Photography & Video', 'category_name': 'Photography',
             'occasion': 'wedding', 'price': 39999, 'original_price': 59999,
             'ratings': 4.9, 'review_count': 317, 'badge': 'Premium',
             'image_url': '/images/ed/ring_ceremony/2436a25752856e537e9ba21717cd3abd.jpg',
             'short_desc': 'Complete wedding coverage - ceremony and reception.'},
            {'name': 'Bridal Makeup & Styling', 'category_name': 'Makeup & Styling',
             'occasion': 'wedding', 'price': 9999, 'original_price': 14999,
             'ratings': 4.9, 'review_count': 289, 'badge': 'Best Seller',
             'image_url': '/images/ed/general/027f0ddfe684d42faf7dc9b227ee25ef.jpg',
             'short_desc': 'HD bridal makeup by expert artists.'},
            {'name': 'Mehndi Design — Full Hands', 'category_name': 'Mehndi',
             'occasion': 'wedding', 'price': 2499, 'original_price': 3500,
             'ratings': 4.8, 'review_count': 178, 'badge': None,
             'image_url': '/images/ed/mehndi/image_1.jpg',
             'short_desc': 'Beautiful traditional and contemporary mehndi designs.'},
            {'name': 'Mandap Decoration Premium', 'category_name': 'Floral Decoration',
             'occasion': 'wedding', 'price': 14999, 'original_price': 19999,
             'ratings': 4.9, 'review_count': 211, 'badge': 'Premium',
             'image_url': '/images/ed/mandap/Mandap2.jpeg',
             'short_desc': 'Elaborate mandap with fresh flowers and draping.'},
            # Baby Shower
            {'name': 'Baby Shower Balloon Decoration', 'category_name': 'Balloon Decoration',
             'occasion': 'baby_shower', 'price': 3499, 'original_price': 4999,
             'ratings': 4.8, 'review_count': 167, 'badge': 'Trending',
             'image_url': '/images/ed/baby_shower/06ecd407e0ed2480d5d952c758565957.jpg',
             'short_desc': 'Pastel balloon walls and baby shower themed setups.'},
            {'name': 'Baby Shower Photography', 'category_name': 'Photography',
             'occasion': 'baby_shower', 'price': 4499, 'original_price': 5999,
             'ratings': 4.7, 'review_count': 98, 'badge': None,
             'image_url': '/images/ed/baby_shower/1b378ae61fbdf94690ecd8e0b8dc966d.jpg',
             'short_desc': 'Candid and posed shots at your baby shower.'},
            {'name': 'Baby Shower Floral Decor', 'category_name': 'Floral Decoration',
             'occasion': 'baby_shower', 'price': 2999, 'original_price': 3999,
             'ratings': 4.8, 'review_count': 134, 'badge': None,
             'image_url': '/images/ed/baby_shower/1b5a19a88cdbd22086a2176d7f039757.jpg',
             'short_desc': 'Soft pastel floral arrangement for a dreamy shower.'},
            # Haldi
            {'name': 'Haldi Ceremony Decoration', 'category_name': 'Floral Decoration',
             'occasion': 'bachelorette', 'price': 5999, 'original_price': 8999,
             'ratings': 4.8, 'review_count': 189, 'badge': 'Popular',
             'image_url': '/images/ed/haldi/image_10.jpg',
             'short_desc': 'Vibrant marigold and folk-style haldi ceremony decor.'},
            # Engagement
            {'name': 'Engagement Ring Ceremony Decor', 'category_name': 'Floral Decoration',
             'occasion': 'engagement', 'price': 8999, 'original_price': 12999,
             'ratings': 4.8, 'review_count': 211, 'badge': 'Popular',
             'image_url': '/images/ed/ring_ceremony/13a9c39a54f65bb548ad1c451e3dbb16.jpg',
             'short_desc': 'Elegant floral and lighting for ring ceremony.'},
            {'name': 'Engagement Photoshoot', 'category_name': 'Photography',
             'occasion': 'engagement', 'price': 6499, 'original_price': 8999,
             'ratings': 4.9, 'review_count': 174, 'badge': 'Best Seller',
             'image_url': '/images/ed/ring_ceremony/28977c48ec8fb5d9532376edcb578ffc.jpg',
             'short_desc': 'Pre-engagement and ceremony photography.'},
            # Bachelorette
            {'name': 'Bachelorette Party Decoration', 'category_name': 'Balloon Decoration',
             'occasion': 'bachelorette', 'price': 3999, 'original_price': 5499,
             'ratings': 4.7, 'review_count': 143, 'badge': 'Fun',
             'image_url': '/images/ed/stage/0ed2b5eb190dd53044a007c199cc2eb1.jpg',
             'short_desc': 'Glam decor with sparkles and neon signs.'},
        ]

        created = 0
        for s in services_data:
            obj, was_created = Service.objects.get_or_create(
                name=s['name'],
                occasion=s.get('occasion'),
                defaults={k: v for k, v in s.items() if k not in ('name', 'occasion')}
            )
            if was_created:
                created += 1

        self.stdout.write(self.style.SUCCESS(
            f'  Services: {created} created, {len(services_data) - created} already existed'
        ))
        self.stdout.write(self.style.SUCCESS(
            f'Seed complete! Total services in DB: {Service.objects.count()}'
        ))
