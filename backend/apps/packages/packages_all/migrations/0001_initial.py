# Generated migration for packages_all – consolidated initial schema
# Replaces the broken 0001 + 0002 split.

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('all_carts', '0001_initial'),
        ('package_carts', '0001_initial'),
        ('package_categories', '0001_initial'),
        ('package_type_carts', '0001_initial'),
        # service_all dependency handled in 0002 to avoid circular imports
    ]

    operations = [
        # ── PremiumPackage (no FKs → create first) ──────────────────────────
        migrations.CreateModel(
            name='PremiumPackage',
            fields=[
                ('premium_id',    models.AutoField(primary_key=True, serialize=False)),
                ('package_name',  models.CharField(max_length=255)),
                ('details',       models.TextField(blank=True, null=True)),
                ('price',         models.FloatField()),
                ('timeline',      models.IntegerField()),
            ],
            options={
                'verbose_name': 'Premium Package',
                'verbose_name_plural': 'Premium Packages',
            },
        ),

        # ── ServicePackage (service FK added in 0002) ────────────────────────
        migrations.CreateModel(
            name='ServicePackage',
            fields=[
                ('service_packages_id', models.AutoField(primary_key=True, serialize=False)),
                ('base_price',          models.FloatField(default=0)),
                ('package_category',    models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='service_packages',
                    to='package_categories.packagecategory',
                )),
                ('package', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='service_packages',
                    to='package_carts.package',
                )),
                ('package_type', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='service_packages',
                    to='package_type_carts.packagetype',
                )),
            ],
            options={
                'verbose_name': 'Service Package',
                'verbose_name_plural': 'Service Packages',
            },
        ),

        # ── CartPackage ──────────────────────────────────────────────────────
        migrations.CreateModel(
            name='CartPackage',
            fields=[
                ('cart_package_id', models.AutoField(primary_key=True, serialize=False)),
                ('base_price',      models.FloatField(default=0)),
                ('total_price',     models.FloatField(default=0)),
                ('cart', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='cart_packages',
                    to='all_carts.cart',
                )),
                ('package', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='cart_packages',
                    to='package_carts.package',
                )),
                ('package_type', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='cart_packages',
                    to='package_type_carts.packagetype',
                )),
            ],
            options={
                'verbose_name': 'Cart Package',
                'verbose_name_plural': 'Cart Packages',
            },
        ),

        # ── CartPackageService (service FK added in 0002) ────────────────────
        migrations.CreateModel(
            name='CartPackageService',
            fields=[
                ('cart_package_service_id', models.AutoField(primary_key=True, serialize=False)),
                ('base_price',             models.FloatField(default=0)),
                ('cart_package', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='services',
                    to='packages_all.cartpackage',
                )),
                ('package_category', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='cart_package_services',
                    to='package_categories.packagecategory',
                )),
            ],
            options={
                'verbose_name': 'Cart Package Service',
                'verbose_name_plural': 'Cart Package Services',
            },
        ),

        # ── WishlistPackage ──────────────────────────────────────────────────
        migrations.CreateModel(
            name='WishlistPackage',
            fields=[
                ('wishlist_package_id', models.AutoField(primary_key=True, serialize=False)),
                ('base_price',         models.FloatField(default=0)),
                ('total_price',        models.FloatField(default=0)),
                ('wishlist', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='wishlist_packages',
                    to='all_carts.wishlist',
                )),
                ('package', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='wishlist_packages',
                    to='package_carts.package',
                )),
                ('package_type', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='wishlist_packages',
                    to='package_type_carts.packagetype',
                )),
            ],
            options={
                'verbose_name': 'Wishlist Package',
                'verbose_name_plural': 'Wishlist Packages',
            },
        ),

        # ── WishlistPackageService (service FK added in 0002) ────────────────
        migrations.CreateModel(
            name='WishlistPackageService',
            fields=[
                ('wishlist_package_service_id', models.AutoField(primary_key=True, serialize=False)),
                ('base_price',                 models.FloatField(default=0)),
                ('wishlist_package', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='services',
                    to='packages_all.wishlistpackage',
                )),
                ('package_category', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='wishlist_package_services',
                    to='package_categories.packagecategory',
                )),
            ],
            options={
                'verbose_name': 'Wishlist Package Service',
                'verbose_name_plural': 'Wishlist Package Services',
            },
        ),
    ]
