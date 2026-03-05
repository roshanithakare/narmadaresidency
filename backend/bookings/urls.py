from django.urls import path
from . import views

urlpatterns = [
      path('', views.index, name='home'),  # 👈 ADD THIS
    path('gallery/', views.gallery, name='gallery'),
    path('submit-bookings/', views.submit_bookings, name='submit_bookings'),
]