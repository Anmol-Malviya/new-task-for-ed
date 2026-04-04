from django.db import models
from django.utils import timezone

class Image(models.Model):
    image_id = models.AutoField(primary_key=True)
    image_category = models.ForeignKey('image_generation_all.ImageCategory', on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    slot_no = models.IntegerField(null=True, blank=True)
    recorded_call = models.BooleanField(default=False)
    whatsapp_notification = models.BooleanField(default=False)
    image_generation = models.BooleanField(default=False)
    chat_bot = models.BooleanField(default=False)

from django.utils import timezone
class ImageCategory(models.Model):
    image_category_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
class GeneratedImage(models.Model):
    generated_image_id = models.AutoField(primary_key=True)
    img_desc = models.TextField(null=True, blank=True)
    other_details = models.TextField(null=True, blank=True)
    user = models.ForeignKey('users_all.User', on_delete=models.CASCADE)
    expected_price = models.FloatField(null=True, blank=True)
    status = models.CharField(max_length=50, default='pending')
    location = models.ForeignKey('all_locations.Location', on_delete=models.SET_NULL, null=True, blank=True)
    time_stamp = models.DateTimeField(default=timezone.now)
