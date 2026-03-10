from django.db import models

class Gallery(models.Model):
    CATEGORY_CHOICES = [
        ('rooms', 'Rooms'),
        ('banquet', 'Banquet'),
        ('interior', 'Interior'),
        ('exterior', 'Exterior'),
        ('bathroom', 'Bathroom'),
    ]
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    image = models.ImageField(upload_to='gallery/')
    caption = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Photo"
        verbose_name_plural = "Photos"

    def __str__(self):
        return f"{self.category} - {self.caption}"
