from django.db import models
from django.utils import timezone

class Address(models.Model):
    address_id = models.AutoField(primary_key=True)
    user = models.ForeignKey('users_all.User', on_delete=models.CASCADE, related_name='addresses')
    address = models.TextField()
    city = models.CharField(max_length=100, null=True, blank=True)
    country = models.CharField(max_length=100, null=True, blank=True)
    location = models.ForeignKey('all_locations.Location', on_delete=models.SET_NULL, null=True, blank=True)
