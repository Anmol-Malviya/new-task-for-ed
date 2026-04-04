from django.db import models
from django.utils import timezone

class Otp(models.Model):
    otp_id = models.AutoField(primary_key=True)
    time_stamp = models.DateTimeField(default=timezone.now)
    email = models.EmailField(null=True, blank=True)
    otp = models.CharField(max_length=50)
    number = models.CharField(max_length=20, null=True, blank=True)
    user = models.ForeignKey('users_all.User', on_delete=models.CASCADE, null=True, blank=True, related_name='otps')
