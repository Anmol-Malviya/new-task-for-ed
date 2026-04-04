import os

models_code = {
    'apps/service_categories/service_categories_all/models.py': '''
class Category(models.Model):
    category_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    number = models.IntegerField(default=1)
    def __str__(self): return self.name
''',
    'apps/packages/packages_categories/models.py': '''from django.db import models
class PackageCategory(models.Model):
    package_category_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    def __str__(self): return self.name
''',
    'apps/carts/all_carts/models.py': '''
class Wishlist(models.Model):
    wishlist_id = models.AutoField(primary_key=True)
    service = models.ForeignKey('service_all.Service', on_delete=models.CASCADE)
    is_package = models.BooleanField(default=False)
    user = models.ForeignKey('users_all.User', on_delete=models.CASCADE)
    location = models.ForeignKey('all_locations.Location', on_delete=models.SET_NULL, null=True, blank=True)
''',
    'apps/image_generation/image_generation_all/models.py': '''
from django.utils import timezone
class ImageCategory(models.Model):
    image_category_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
class GeneratedImage(models.Model):
    generated_image_id = models.AutoField(primary_key=True)
    img_desc = models.TextField(null=True, blank=True)
    other_details = models.TextField(null=True, blank=True)
    user = models.ForeignKey('users_all.User', on_delete=models.CASCADE)
    expected_price = models.FloatField(null=True, blank=True)
    status = models.CharField(max_length=50, default='pending')
    location = models.ForeignKey('all_locations.Location', on_delete=models.SET_NULL, null=True, blank=True)
    time_stamp = models.DateTimeField(default=timezone.now)
'''
}

for path, code in models_code.items():
    mode = 'a'
    if path == 'apps/packages/packages_categories/models.py':
        mode = 'w'
    with open(path, mode, encoding='utf-8') as f:
        f.write(code)

with open('apps/packages/packages_categories/apps.py', 'w') as f:
    f.write('''from django.apps import AppConfig\nclass PackagesCategoriesConfig(AppConfig):\n    default_auto_field = 'django.db.models.BigAutoField'\n    name = 'apps.packages.packages_categories'\n    label = 'package_categories'\n''')

print("Writing config...")
with open('config/settings.py', 'r+') as f:
    s = f.read()
    if 'apps.packages.packages_categories' not in s:
        s = s.replace('INSTALLED_APPS = [', "INSTALLED_APPS = [\n    'apps.packages.packages_categories',")
        f.seek(0)
        f.write(s)
        f.truncate()
