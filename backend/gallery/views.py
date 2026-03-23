from django.shortcuts import render
from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status
from .models import Gallery
from .serializers import GallerySerializer

class GalleryImageList(generics.ListAPIView):
    queryset = Gallery.objects.all()
    serializer_class = GallerySerializer
    
    def get(self, request, *args, **kwargs):
        try:
            images = self.get_queryset()
            serializer = self.get_serializer(images, many=True)
            return Response({
                'success': True,
                'data': serializer.data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
