from django.contrib import admin
from django.utils.html import format_html
from .models import Gallery

@admin.register(Gallery)
class GalleryAdmin(admin.ModelAdmin):
    list_display = ['category', 'caption', 'image_preview', 'created_at', 'delete_action']
    list_filter = ['category', 'created_at']
    search_fields = ['caption']
    ordering = ['-created_at']
    
    # Custom form field layout
    fieldsets = (
        ('Photo Information', {
            'fields': ('category', 'image', 'caption'),
        }),
    )
    
    # Add delete action
    actions = ['delete_selected_photos']
    
    # Enable delete permission
    def has_delete_permission(self, request, obj=None):
        return True
    
    def delete_selected_photos(self, request, queryset):
        """
        Custom action to delete selected photos
        """
        count = queryset.count()
        for obj in queryset:
            # Delete the image file from storage
            if obj.image:
                obj.image.delete(save=False)
            obj.delete()
        
        self.message_user(request, f'Successfully deleted {count} photo(s).')
    
    delete_selected_photos.short_description = "Delete selected photos"
    
    def delete_action(self, obj):
        """
        Add delete button to each row
        """
        delete_url = f'/admin/gallery/gallery/{obj.id}/delete/'
        return format_html('<a href="{}" class="button" style="background-color: #ba2121; color: white; padding: 5px 10px; text-decoration: none; border-radius: 3px;">Delete</a>', delete_url)
    delete_action.short_description = 'Actions'
    delete_action.allow_tags = True
    
    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="100" height="100" style="object-fit: cover; border-radius: 5px;" />', obj.image.url)
        return "No image"
    image_preview.allow_tags = True
    image_preview.short_description = 'Preview'
