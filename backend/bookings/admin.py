from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin as DefaultUserAdmin
from django.http import HttpResponse
import csv
from datetime import datetime
from django import forms
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
    
    # Hide action checkboxes
    list_display_links = ['name']
    actions = None
    
    def export_all_as_excel(self, request, queryset):
        """
        Export all room bookings as CSV file
        """
        # Get all bookings, not just selected
        bookings = RoomBooking.objects.all().order_by('-created_at')
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="room_bookings_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv"'
        
        writer = csv.writer(response)
        
        # Header row
        writer.writerow([
            'Booking ID', 'Room Type', 'Price', 'Check-in Date', 'Check-out Date',
            'Number of Guests', 'Customer Name', 'Email', 'Phone', 'Payment Method',
            'Booking Date', 'Total Nights'
        ])
        
        # Data rows
        for booking in bookings:
            total_nights = (booking.check_out - booking.check_in).days
            writer.writerow([
                booking.id,
                booking.get_room_type_display(),
                booking.price,
                booking.check_in.strftime('%Y-%m-%d'),
                booking.check_out.strftime('%Y-%m-%d'),
                booking.guests,
                booking.name,
                booking.email,
                booking.phone,
                booking.payment_method,
                booking.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                total_nights
            ])
        
        return response
    
    export_all_as_excel.short_description = "Export All to Excel"
    
    # Add custom form fields with dropdowns
    def formfield_for_dbfield(self, db_field, request, **kwargs):
        if db_field.name == 'room_type':
            kwargs['choices'] = ROOM_TYPE_CHOICES
            kwargs['widget'] = forms.Select(choices=ROOM_TYPE_CHOICES)
        return super().formfield_for_dbfield(db_field, request, **kwargs)
    
    # Remove delete permission
    def has_delete_permission(self, request, obj=None):
        return False
    
    # Override changelist_view to add custom export button
    def changelist_view(self, request, extra_context=None):
        extra_context = extra_context or {}
        extra_context['export_all_url'] = '/admin/bookings/roombooking/export-all/'
        return super().changelist_view(request, extra_context)
    
    # Add custom view for export all
    def get_urls(self):
        from django.urls import path
        urls = super().get_urls()
        custom_urls = [
            path('export-all/', self.admin_site.admin_view(self.export_all_bookings), name='bookings_roombooking_export_all'),
        ]
        return custom_urls + urls
    
    def export_all_bookings(self, request):
        """
        Export all room bookings as Excel file (direct URL access)
        """
        return self.export_all_as_excel(request, RoomBooking.objects.all())


@admin.register(BanquetBooking)
class BanquetBookingAdmin(admin.ModelAdmin):
    list_display = ['name', 'banquet_type', 'event_date', 'guests', 'display_price_per_person', 'display_total_price', 'phone', 'payment_method', 'created_at']
    list_filter = ['event_date', 'payment_method', 'banquet_type']
    search_fields = ['name', 'phone', 'banquet_type']
    ordering = ['-created_at']
    readonly_fields = ['created_at']
    
    # Hide action checkboxes
    list_display_links = ['name']
    actions = None
    
    def export_all_as_excel(self, request, queryset):
        """
        Export all banquet bookings as CSV file
        """
        # Get all bookings, not just selected
        bookings = BanquetBooking.objects.all().order_by('-created_at')
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="banquet_bookings_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv"'
        
        writer = csv.writer(response)
        
        # Header row
        writer.writerow([
            'Booking ID', 'Banquet Type', 'Price Per Person', 'Total Price',
            'Event Date', 'Number of Guests', 'Customer Name', 'Email', 'Phone',
            'Payment Method', 'Booking Date'
        ])
        
        # Data rows
        for booking in bookings:
            writer.writerow([
                booking.id,
                booking.get_banquet_type_display(),
                booking.price_per_person,
                booking.total_price,
                booking.event_date.strftime('%Y-%m-%d'),
                booking.guests,
                booking.name,
                booking.email,
                booking.phone,
                booking.payment_method,
                booking.created_at.strftime('%Y-%m-%d %H:%M:%S')
            ])
        
        return response
    
    export_all_as_excel.short_description = "Export All to Excel"
    
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
            kwargs['widget'] = forms.Select(choices=BANQUET_TYPE_CHOICES)
        return super().formfield_for_dbfield(db_field, request, **kwargs)
    
    # Remove delete permission
    def has_delete_permission(self, request, obj=None):
        return False
    
    # Override changelist_view to add custom export button
    def changelist_view(self, request, extra_context=None):
        extra_context = extra_context or {}
        extra_context['export_all_url'] = '/admin/bookings/banquetbooking/export-all/'
        return super().changelist_view(request, extra_context)
    
    # Add custom view for export all
    def get_urls(self):
        from django.urls import path
        urls = super().get_urls()
        custom_urls = [
            path('export-all/', self.admin_site.admin_view(self.export_all_bookings), name='bookings_banquetbooking_export_all'),
        ]
        return custom_urls + urls
    
    def export_all_bookings(self, request):
        """
        Export all banquet bookings as Excel file (direct URL access)
        """
        return self.export_all_as_excel(request, BanquetBooking.objects.all())
    

