from django.urls import path
from . import views

urlpatterns = [
      path('', views.index, name='home'),  # 
    path('gallery/', views.gallery, name='gallery'),
    path('submit-bookings/', views.submit_bookings, name='submit_bookings'),
    path('api/room-bookings/', views.api_room_bookings, name='api_room_bookings'),
    path('api/banquet-bookings/', views.api_banquet_bookings, name='api_banquet_bookings'),
]