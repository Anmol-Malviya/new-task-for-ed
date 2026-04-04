from django.db import models
from django.utils import timezone

class Cart(models.Model):
    cart_id = models.AutoField(primary_key=True)
    is_package = models.BooleanField(default=False)
    user = models.ForeignKey('users_all.User', on_delete=models.CASCADE, related_name='carts')
    service = models.ForeignKey('service_all.Service', on_delete=models.CASCADE)
    total_price = models.FloatField()
    location = models.ForeignKey('all_locations.Location', on_delete=models.SET_NULL, null=True, blank=True)
    is_saved = models.BooleanField(default=False)

class Wishlist(models.Model):
    wishlist_id = models.AutoField(primary_key=True)
    service = models.ForeignKey('service_all.Service', on_delete=models.CASCADE)
    is_package = models.BooleanField(default=False)
    user = models.ForeignKey('users_all.User', on_delete=models.CASCADE)
    location = models.ForeignKey('all_locations.Location', on_delete=models.SET_NULL, null=True, blank=True)
