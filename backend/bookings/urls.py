from django.urls import path
from . import views

urlpatterns = [
      path('', views.index, name='home'),  # 
    path('gallery/', views.gallery, name='gallery'),
    path('admin/exports/', views.admin_exports, name='admin_exports'),
    path('submit-bookings/', views.submit_bookings, name='submit_bookings'),
    path('api/room-bookings/', views.api_room_bookings, name='api_room_bookings'),
    path('api/banquet-bookings/', views.api_banquet_bookings, name='api_banquet_bookings'),
    path('export/room-bookings/', views.export_room_bookings_csv, name='export_room_bookings_csv'),
    path('export/banquet-bookings/', views.export_banquet_bookings_csv, name='export_banquet_bookings_csv'),
    path('export/all-bookings/', views.export_all_bookings_csv, name='export_all_bookings_csv'),
]