from django.urls import path
from . import views

urlpatterns = [
    path('images/', views.GalleryImageList.as_view(), name='gallery-image-list'),
]
