from django.db import models
from django.utils import timezone

class Query(models.Model):
    query_id = models.AutoField(primary_key=True)
    service = models.ForeignKey('service_all.Service', on_delete=models.CASCADE)
    user = models.ForeignKey('users_all.User', on_delete=models.CASCADE)
    location = models.CharField(max_length=255, null=True, blank=True)
    service_date = models.DateTimeField(null=True, blank=True)
    is_urgent = models.BooleanField(null=True, blank=True)
    approx_budget = models.FloatField(null=True, blank=True)
    is_accepted = models.BooleanField(null=True, blank=True)
    time_stamp = models.DateTimeField(default=timezone.now)
