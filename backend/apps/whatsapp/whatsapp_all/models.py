from django.db import models
from django.utils import timezone

class Chat(models.Model):
    chat_id = models.AutoField(primary_key=True)
    query = models.ForeignKey('queries_all.Query', on_delete=models.CASCADE)
    text_messages = models.TextField(null=True, blank=True)
    time_stamp = models.DateTimeField()
    image_url = models.URLField(max_length=500, null=True, blank=True)
    sender = models.CharField(max_length=255, null=True, blank=True)
    status = models.CharField(max_length=50, null=True, blank=True)
    whatsapp_message_id = models.CharField(max_length=255, null=True, blank=True)
    is_call_log = models.BooleanField(null=True, blank=True)
    is_offer = models.BooleanField(null=True, blank=True)
    service = models.ForeignKey('service_all.Service', on_delete=models.CASCADE)
    price = models.FloatField()
    is_portfolio = models.BooleanField(null=True, blank=True)
