from django.db import models

# Create your models here.

class Category(models.Model):
    category_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    number = models.IntegerField(default=1)
    def __str__(self): return self.name
