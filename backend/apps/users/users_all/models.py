from django.db import models
from django.utils import timezone

class User(models.Model):
    user_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    number = models.CharField(max_length=20, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    email = models.EmailField(unique=True)
    blacklist_status = models.CharField(max_length=50, default="active")
    password = models.CharField(max_length=255)

    def __str__(self):
        return self.name
