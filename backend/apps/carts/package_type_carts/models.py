from django.db import models
from django.utils import timezone

class PackageType(models.Model):
    package_type_id = models.AutoField(primary_key=True)
    package = models.ForeignKey('package_carts.Package', on_delete=models.CASCADE, related_name='types')
    name = models.CharField(max_length=255)
    base_price = models.FloatField()

    def __str__(self):
        return self.name
