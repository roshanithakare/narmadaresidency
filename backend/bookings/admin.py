from django.contrib import admin
from .models import Booking, Gallery


admin.site.register(Booking)
admin.site.register(Gallery)

class BookingAdmin(admin.ModelAdmin):
    list_display = ['name', 'room_type', 'check_in', 'phone', 'payment_method']
    list_filter = ['check_in', 'payment_method']


class GalleryAdmin(admin.ModelAdmin):
    list_display = ['category', 'caption', 'created_at']
    list_filter = ['category']
    

