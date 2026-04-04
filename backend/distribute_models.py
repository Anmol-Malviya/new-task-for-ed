import os
import re

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
APPS_DIR = os.path.join(BASE_DIR, 'apps')
CORE_MODELS_PATH = os.path.join(BASE_DIR, 'core', 'models.py')

# Mapping from Model className -> app label.
# This will map where each model should logically live based on the new folder structure.
MODEL_MAPPING = {
    'User': 'users.users_all',
    'Vendor': 'vendors.vendors_all',
    'Admin': 'auth.auth',
    'Otp': 'otp.otp_all',
    'Location': 'locations.locations_all',
    'Category': 'service_categories.all_categories',
    'Tag': 'tags.all_tags',
    'Package': 'packages.all_packages',
    'PackageType': 'packages.package_types',
    'PackageCategory': 'packages.package_categories',
    'PackageTypeCategory': 'packages.package_type_categories',
    'Service': 'service.service_all',
    'ServicePackage': 'service.service_packages',
    'ServiceCategory': 'service_categories.service_categories',
    'ServiceTag': 'tags.service_tags',
    'ServiceLocation': 'service.service_locations',
    'VendorLocation': 'vendors.vendors_locations',
    'PackageLocation': 'packages.package_locations',
    'Address': 'address.address_all',
    'Cart': 'carts.all_carts',
    'CartPackage': 'carts.cart_packages',
    'CartPackageService': 'carts.cart_package_services',
    'Wishlist': 'carts.wishlist',
    'WishlistPackage': 'carts.wishlist_packages',
    'WishlistPackageService': 'carts.wishlist_package_services',
    'ManualOrder': 'orders.manual_orders',
    'Review': 'reviews.all_reviews',
    'Report': 'reports.all_reports',
    'ImageCategory': 'image_generation.image_categories',
    'Image': 'image_generation.all_images',
    'GeneratedImage': 'image_generation.generated_images',
    'Bidding': 'bidding.all_biddings',
    'BiddingOrder': 'orders.bidding_orders',
    'Query': 'queries.queries_all',
    'QueryVendor': 'queries.query_vendors',
    'QueryOrder': 'orders.query_orders',
    'Chat': 'whatsapp.whatsapp_all',
    'Phone': 'call_logs.all_call_logs',
    'Portfolio': 'whatsapp.portfolios',
    'PremiumPackage': 'premium.premium_packages',
    'PremiumVendor': 'premium.premium_vendors',
    'Order': 'orders.all_orders',
    'OrderPackage': 'orders.package_orders',
    'OrderService': 'orders.service_orders',
    'Payment': 'payments.all_payments',
}

# Determine default mappings based on directory existence
all_apps = []
for dp, dn, fn in os.walk(APPS_DIR):
    if 'models.py' in fn:
        rel_path = os.path.relpath(dp, APPS_DIR).replace('\\', '.')
        all_apps.append(rel_path)

def find_best_app(model_name):
    target = MODEL_MAPPING.get(model_name)
    if target and target in all_apps:
        return target
    
    # Try finding an exact match or fallback
    for app in all_apps:
        if model_name.lower() in app.split('.')[-1].replace('_',''):
            return app
        if app.endswith('_all') and app.split('.')[0] in model_name.lower() + 's':
            return app
    return 'core' # fallback

model_destinations = {}

# Parse core/models.py manually since AST makes keeping comments hard.
with open(CORE_MODELS_PATH, 'r', encoding='utf-8') as f:
    core_content = f.read()

# We will regex split the file into class blocks
classes = re.split(r'\n# ─+[\r\n]+#\s+[A-Z_]+[\r\n]+# ─+[\r\n]+', '\n' + core_content)

header = classes[0]
models_source = {}
for block in classes[1:]:
    match = re.search(r'^class (\w+)\(models\.Model\):', block, re.MULTILINE)
    if match:
        class_name = match.group(1)
        models_source[class_name] = block.strip()

# Now find destinations
for class_name in models_source.keys():
    dest = find_best_app(class_name)
    model_destinations[class_name] = dest

# Prepare modified source (string foreign keys)
for class_name, source in models_source.items():
    # Replace ForeignKey(Model, ...) with ForeignKey('app_label.Model', ...)
    # to avoid circular imports.
    def replace_fk(m):
        m_name = m.group(1)
        if m_name in model_destinations and model_destinations[m_name] != 'core':
            app_label = model_destinations[m_name].split('.')[-1]
            return f"models.ForeignKey('{app_label}.{m_name}'"
        return m.group(0)
    
    source = re.sub(r'models\.ForeignKey\(\s*\'?([A-Za-z0-9_]+)\'?', replace_fk, source)
    
    def replace_oto(m):
        m_name = m.group(1)
        if m_name in model_destinations and model_destinations[m_name] != 'core':
            app_label = model_destinations[m_name].split('.')[-1]
            return f"models.OneToOneField('{app_label}.{m_name}'"
        return m.group(0)
        
    source = re.sub(r'models\.OneToOneField\(\s*\'?([A-Za-z0-9_]+)\'?', replace_oto, source)

    models_source[class_name] = source

# Group by destination
dest_blocks = {}
for class_name, dest in model_destinations.items():
    if dest == 'core': continue
    if dest not in dest_blocks:
        dest_blocks[dest] = []
    dest_blocks[dest].append(models_source[class_name])

# Write files
for dest, blocks in dest_blocks.items():
    dest_path = os.path.join(APPS_DIR, *dest.split('.'))
    os.makedirs(dest_path, exist_ok=True)
    models_path = os.path.join(dest_path, 'models.py')
    with open(models_path, 'w', encoding='utf-8') as f:
        f.write("from django.db import models\n")
        f.write("from django.utils import timezone\n\n")
        f.write("\n\n".join(blocks) + "\n")
        
    # Ensure apps.py has correct name
    apps_py = os.path.join(dest_path, 'apps.py')
    app_label_class = "".join([word.capitalize() for word in dest.split('.')[-1].split('_')]) + "Config"
    app_name = f"apps.{dest}"
    with open(apps_py, 'w', encoding='utf-8') as f:
        f.write(f"from django.apps import AppConfig\n\nclass {app_label_class}(AppConfig):\n    default_auto_field = 'django.db.models.BigAutoField'\n    name = '{app_name}'\n    label = '{dest.split('.')[-1]}'\n")

# Update settings.py
settings_path = os.path.join(BASE_DIR, 'config', 'settings.py')
with open(settings_path, 'r', encoding='utf-8') as f:
    settings_content = f.read()

apps_to_add = [f"'apps.{dest}'" for dest in dest_blocks.keys()]
apps_str = ",\n    ".join(apps_to_add)

if "'apps." not in settings_content:
    replacement = f"INSTALLED_APPS = [\n    {apps_str},\n"
    settings_content = re.sub(r'INSTALLED_APPS\s*=\s*\[\n', replacement, settings_content)
    with open(settings_path, 'w', encoding='utf-8') as f:
        f.write(settings_content)

print(f"Distributed models successfully to {len(dest_blocks)} apps.")
