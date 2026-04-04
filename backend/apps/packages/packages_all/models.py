from django.db import models
from django.utils import timezone


class ServicePackage(models.Model):
    """
    Joins a Service to a Package / PackageType / PackageCategory
    with an optional base price override (default 0 per spec).
    """
    service_packages_id = models.AutoField(primary_key=True)

    service       = models.ForeignKey(
        'service_all.Service',
        on_delete=models.CASCADE,
        related_name='service_packages',
    )
    package_category = models.ForeignKey(
        'package_categories.PackageCategory',
        on_delete=models.CASCADE,
        related_name='service_packages',
    )
    package = models.ForeignKey(
        'package_carts.Package',
        on_delete=models.CASCADE,
        related_name='service_packages',
    )
    package_type = models.ForeignKey(
        'package_type_carts.PackageType',
        on_delete=models.CASCADE,
        related_name='service_packages',
    )
    base_price = models.FloatField(default=0)

    class Meta:
        app_label = 'packages_all'
        verbose_name = 'Service Package'
        verbose_name_plural = 'Service Packages'

    def __str__(self):
        return (
            f"ServicePackage(id={self.service_packages_id}, "
            f"service={self.service_id}, package={self.package_id})"
        )


# ──────────────────────────────────────────────────────────────────────────────
# CART helpers
# ──────────────────────────────────────────────────────────────────────────────

class CartPackage(models.Model):
    """
    One row per package added to a cart.
    """
    cart_package_id = models.AutoField(primary_key=True)

    cart = models.ForeignKey(
        'all_carts.Cart',
        on_delete=models.CASCADE,
        related_name='cart_packages',
    )
    package = models.ForeignKey(
        'package_carts.Package',
        on_delete=models.CASCADE,
        related_name='cart_packages',
    )
    package_type = models.ForeignKey(
        'package_type_carts.PackageType',
        on_delete=models.CASCADE,
        related_name='cart_packages',
    )
    base_price  = models.FloatField(default=0)
    total_price = models.FloatField(default=0)

    class Meta:
        app_label = 'packages_all'
        verbose_name = 'Cart Package'
        verbose_name_plural = 'Cart Packages'

    def __str__(self):
        return (
            f"CartPackage(id={self.cart_package_id}, "
            f"cart={self.cart_id}, package={self.package_id})"
        )


class CartPackageService(models.Model):
    """
    Individual services that belong to a CartPackage.
    """
    cart_package_service_id = models.AutoField(primary_key=True)

    cart_package = models.ForeignKey(
        'packages_all.CartPackage',
        on_delete=models.CASCADE,
        related_name='services',
    )
    service = models.ForeignKey(
        'service_all.Service',
        on_delete=models.CASCADE,
        related_name='cart_package_services',
    )
    package_category = models.ForeignKey(
        'package_categories.PackageCategory',
        on_delete=models.CASCADE,
        related_name='cart_package_services',
    )
    base_price = models.FloatField(default=0)

    class Meta:
        app_label = 'packages_all'
        verbose_name = 'Cart Package Service'
        verbose_name_plural = 'Cart Package Services'

    def __str__(self):
        return (
            f"CartPackageService(id={self.cart_package_service_id}, "
            f"cart_package={self.cart_package_id}, service={self.service_id})"
        )


# ──────────────────────────────────────────────────────────────────────────────
# WISHLIST helpers
# ──────────────────────────────────────────────────────────────────────────────

class WishlistPackage(models.Model):
    """
    One row per package saved to a wishlist.
    """
    wishlist_package_id = models.AutoField(primary_key=True)

    wishlist = models.ForeignKey(
        'all_carts.Wishlist',
        on_delete=models.CASCADE,
        related_name='wishlist_packages',
    )
    package = models.ForeignKey(
        'package_carts.Package',
        on_delete=models.CASCADE,
        related_name='wishlist_packages',
    )
    package_type = models.ForeignKey(
        'package_type_carts.PackageType',
        on_delete=models.CASCADE,
        related_name='wishlist_packages',
    )
    base_price  = models.FloatField(default=0)
    total_price = models.FloatField(default=0)

    class Meta:
        app_label = 'packages_all'
        verbose_name = 'Wishlist Package'
        verbose_name_plural = 'Wishlist Packages'

    def __str__(self):
        return (
            f"WishlistPackage(id={self.wishlist_package_id}, "
            f"wishlist={self.wishlist_id}, package={self.package_id})"
        )


class WishlistPackageService(models.Model):
    """
    Individual services that belong to a WishlistPackage.
    """
    wishlist_package_service_id = models.AutoField(primary_key=True)

    wishlist_package = models.ForeignKey(
        'packages_all.WishlistPackage',
        on_delete=models.CASCADE,
        related_name='services',
    )
    service = models.ForeignKey(
        'service_all.Service',
        on_delete=models.CASCADE,
        related_name='wishlist_package_services',
    )
    package_category = models.ForeignKey(
        'package_categories.PackageCategory',
        on_delete=models.CASCADE,
        related_name='wishlist_package_services',
    )
    base_price = models.FloatField(default=0)

    class Meta:
        app_label = 'packages_all'
        verbose_name = 'Wishlist Package Service'
        verbose_name_plural = 'Wishlist Package Services'

    def __str__(self):
        return (
            f"WishlistPackageService(id={self.wishlist_package_service_id}, "
            f"wishlist_package={self.wishlist_package_id}, service={self.service_id})"
        )


# ──────────────────────────────────────────────────────────────────────────────
# PREMIUM PACKAGES  (spec: package name, details, price, timeline)
# ──────────────────────────────────────────────────────────────────────────────

class PremiumPackage(models.Model):
    """
    Defines a premium subscription tier for vendors.
    timeline = duration in days.
    """
    premium_id   = models.AutoField(primary_key=True)
    package_name = models.CharField(max_length=255)
    details      = models.TextField(null=True, blank=True)
    price        = models.FloatField()
    timeline     = models.IntegerField()          # duration in days

    class Meta:
        app_label = 'packages_all'
        verbose_name = 'Premium Package'
        verbose_name_plural = 'Premium Packages'

    def __str__(self):
        return f"{self.package_name} (₹{self.price} / {self.timeline}d)"
