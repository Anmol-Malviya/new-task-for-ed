from django.db import models
from django.utils import timezone

class Report(models.Model):
    report_id = models.AutoField(primary_key=True)
    user = models.ForeignKey('users_all.User', on_delete=models.CASCADE)
    vendor = models.ForeignKey('vendors_all.Vendor', on_delete=models.SET_NULL, null=True, blank=True)
    reported_id = models.IntegerField()
    reason_text = models.TextField(null=True, blank=True)
    has_image = models.BooleanField(default=False)
