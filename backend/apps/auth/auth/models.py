from django.db import models
from django.utils import timezone

class Admin(models.Model):
    admin_id = models.AutoField(primary_key=True)
    password = models.CharField(max_length=255)
