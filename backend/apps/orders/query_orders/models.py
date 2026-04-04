from django.db import models
from django.utils import timezone

class QueryOrder(models.Model):
    query_order_id = models.AutoField(primary_key=True)
    query = models.ForeignKey('queries_all.Query', on_delete=models.CASCADE)
    query_vendor = models.ForeignKey('vendors_all.QueryVendor', on_delete=models.CASCADE)
    status = models.CharField(max_length=50, default="pending")
    final_price = models.FloatField()
    service = models.ForeignKey('service_all.Service', on_delete=models.CASCADE)
    service_details = models.TextField(null=True, blank=True)
    location = models.ForeignKey('all_locations.Location', on_delete=models.SET_NULL, null=True, blank=True)
    image_url = models.URLField(max_length=500, null=True, blank=True)
