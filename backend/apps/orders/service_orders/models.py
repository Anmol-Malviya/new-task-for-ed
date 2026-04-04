from django.db import models
from django.utils import timezone

class OrderService(models.Model):
    order_service_id = models.AutoField(primary_key=True)
    order = models.ForeignKey('all_orders.Order', on_delete=models.CASCADE, related_name='order_services')
    order_package = models.ForeignKey('package_orders.OrderPackage', on_delete=models.CASCADE)
    package = models.ForeignKey('package_carts.Package', on_delete=models.CASCADE)
    is_in_package = models.CharField(max_length=100)
    base_price = models.FloatField()
    service = models.ForeignKey('service_all.Service', on_delete=models.CASCADE)
    service_name = models.CharField(max_length=255)
    total_price = models.FloatField()
