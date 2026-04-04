from django.db import models
from django.utils import timezone

class Package(models.Model):
    package_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name
