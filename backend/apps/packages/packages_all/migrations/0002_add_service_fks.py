# Migration 0002: Adds service_all FK fields (deferred to break circular import)
# Sets initial = False – this is NOT an initial migration.

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = False

    dependencies = [
        ('packages_all', '0001_initial'),
        ('service_all',  '0001_initial'),
    ]

    operations = [
        # ── ServicePackage.service ───────────────────────────────────────────
        migrations.AddField(
            model_name='servicepackage',
            name='service',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name='service_packages',
                to='service_all.service',
            ),
        ),

        # ── CartPackageService.service ───────────────────────────────────────
        migrations.AddField(
            model_name='cartpackageservice',
            name='service',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name='cart_package_services',
                to='service_all.service',
            ),
        ),

        # ── WishlistPackageService.service ───────────────────────────────────
        migrations.AddField(
            model_name='wishlistpackageservice',
            name='service',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name='wishlist_package_services',
                to='service_all.service',
            ),
        ),
    ]
