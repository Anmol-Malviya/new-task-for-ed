from django.db import models
from django.utils import timezone

class Review(models.Model):
    review_id = models.AutoField(primary_key=True)
    user = models.ForeignKey('users_all.User', on_delete=models.CASCADE, related_name='reviews')
    order = models.ForeignKey('all_orders.Order', on_delete=models.CASCADE, related_name='reviews')
    review_text = models.TextField(null=True, blank=True)
    has_image = models.BooleanField(default=False)
    has_video = models.BooleanField(default=False)
    service = models.ForeignKey('service_all.Service', on_delete=models.CASCADE)
    rating = models.FloatField()
    package = models.ForeignKey('package_carts.Package', on_delete=models.SET_NULL, null=True, blank=True)
    package_type = models.ForeignKey('package_type_carts.PackageType', on_delete=models.SET_NULL, null=True, blank=True)
