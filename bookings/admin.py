from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin as DefaultUserAdmin
from .models import RoomBooking, BanquetBooking, ROOM_TYPE_CHOICES, BANQUET_TYPE_CHOICES


# Customize admin site
admin.site.site_header = 'Narmada Residency Administration'
admin.site.site_title = 'Narmada Residency Admin'
admin.site.index_title = 'Welcome to Narmada Residency Admin Portal'


# Unregister the default User admin and register our custom one
admin.site.unregister(User)

@admin.register(User)
class UserAdmin(DefaultUserAdmin):
    list_display = ['username', 'email', 'first_name', 'last_name', 'is_staff', 'date_joined']
    list_filter = ['is_staff', 'is_superuser', 'is_active', 'date_joined']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering = ['-date_joined']
    
    # Remove all actions
    actions = None
    
    # Remove delete permission
    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(RoomBooking)
class RoomBookingAdmin(admin.ModelAdmin):
    list_display = ['name', 'room_type', 'check_in', 'check_out', 'guests', 'phone', 'payment_method', 'created_at']
    list_filter = ['check_in', 'payment_method', 'room_type']
    search_fields = ['name', 'phone', 'room_type']
    ordering = ['-created_at']
    readonly_fields = ['created_at']
    
    # Add custom form fields with dropdowns
    def formfield_for_dbfield(self, db_field, request, **kwargs):
        if db_field.name == 'room_type':
            kwargs['choices'] = ROOM_TYPE_CHOICES
            kwargs['widget'] = admin.widgets.Select(choices=ROOM_TYPE_CHOICES)
        return super().formfield_for_dbfield(db_field, request, **kwargs)
    
    # Remove all actions
    actions = None
    
    # Remove delete permission
    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(BanquetBooking)
class BanquetBookingAdmin(admin.ModelAdmin):
    list_display = ['name', 'banquet_type', 'event_date', 'guests', 'display_price_per_person', 'display_total_price', 'phone', 'payment_method', 'created_at']
    list_filter = ['event_date', 'payment_method', 'banquet_type']
    search_fields = ['name', 'phone', 'banquet_type']
    ordering = ['-created_at']
    readonly_fields = ['created_at']
    
    def display_price_per_person(self, obj):
        try:
            return f"₹{obj.price_per_person:,.2f}"
        except (ValueError, TypeError):
            return "Invalid Price"
    display_price_per_person.short_description = 'Price Per Person'
    
    def display_total_price(self, obj):
        try:
            return f"₹{obj.total_price:,.2f}"
        except (ValueError, TypeError):
            return "Invalid Total"
    display_total_price.short_description = 'Total Price'
    
    # Add custom form fields with dropdowns
    def formfield_for_dbfield(self, db_field, request, **kwargs):
        if db_field.name == 'banquet_type':
            kwargs['choices'] = BANQUET_TYPE_CHOICES
            kwargs['widget'] = admin.widgets.Select(choices=BANQUET_TYPE_CHOICES)
        return super().formfield_for_dbfield(db_field, request, **kwargs)
    
    # Remove all actions
    actions = None
    
    # Remove delete permission
    def has_delete_permission(self, request, obj=None):
        return False
    

