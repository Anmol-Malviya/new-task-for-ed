from django.db import models
class PackageCategory(models.Model):
    package_category_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    def __str__(self): return self.name
