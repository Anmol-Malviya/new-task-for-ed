from django.core.management.base import BaseCommand
from apps.queries.queries_all.services import auto_route_expired_leads

class Command(BaseCommand):
    help = 'Checks for expired 20-minute lead allocations and routes them to the next assigned vendor.'

    def handle(self, *args, **options):
        self.stdout.write("Checking for expired leads...")
        auto_route_expired_leads()
        self.stdout.write(self.style.SUCCESS("Successfully processed lead queues."))
