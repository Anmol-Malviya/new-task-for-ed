from django.apps import AppConfig

class ManualOrdersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.orders.manual_orders'
    label = 'manual_orders'
