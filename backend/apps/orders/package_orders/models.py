from django.db import models
from django.utils import timezone

class OrderPackage(models.Model):
    order_package_id = models.AutoField(primary_key=True)
    order = models.ForeignKey('all_orders.Order', on_delete=models.CASCADE, related_name='order_packages')
    package = models.ForeignKey('package_carts.Package', on_delete=models.CASCADE)
    package_type = models.ForeignKey('package_type_carts.PackageType', on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    base_price = models.FloatField()
    total_price = models.FloatField()
