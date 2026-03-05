from django.db import models

class Booking(models.Model):   # ✅ Capital B
    room_type = models.CharField(max_length=100)
    price = models.CharField(max_length=50)
    check_in = models.DateField()
    check_out = models.DateField()
    guests = models.IntegerField()
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=15)
    payment_method = models.CharField(max_length=50)  # 'hotel' or 'advance'
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.room_type}"


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

    def __str__(self):
        return f"{self.category} - {self.caption}"
    