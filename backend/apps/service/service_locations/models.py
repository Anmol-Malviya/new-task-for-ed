from django.db import models
from django.utils import timezone

class ServiceLocation(models.Model):
    service_location_id = models.AutoField(primary_key=True)
    service = models.ForeignKey('service_all.Service', on_delete=models.CASCADE)
    location = models.ForeignKey('all_locations.Location', on_delete=models.CASCADE)
    base_price = models.FloatField()
    sale_price = models.FloatField()
