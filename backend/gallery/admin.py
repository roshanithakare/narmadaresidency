from django.contrib import admin
from .models import Gallery

@admin.register(Gallery)
class GalleryAdmin(admin.ModelAdmin):
    list_display = ['category', 'caption', 'image_preview', 'created_at']
    list_filter = ['category', 'created_at']
    search_fields = ['caption']
    ordering = ['-created_at']
    
    # Custom form field layout
    fieldsets = (
        ('Photo Information', {
            'fields': ('category', 'image', 'caption'),
        }),
    )
    
    # Remove all actions
    actions = None
    
    # Remove delete permission
    def has_delete_permission(self, request, obj=None):
        return False
    
    def image_preview(self, obj):
        if obj.image:
            return f'<img src="{obj.image.url}" width="100" height="100" style="object-fit: cover;" />'
        return "No image"
    image_preview.allow_tags = True
    image_preview.short_description = 'Preview'
