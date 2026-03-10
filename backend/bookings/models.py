from django.db import models
from django.contrib.auth.models import User

# Room type choices
ROOM_TYPE_CHOICES = [
    ('classic', 'Classic Room'),
    ('deluxe', 'Deluxe Room'),
    ('suite', 'Suite Room'),
    ('other', 'Other Room'),
]

# Banquet type choices
BANQUET_TYPE_CHOICES = [
    ('birthday', 'Birthday Celebration'),
    ('wedding', 'Wedding Ceremony'),
    ('engagement', 'Engagement Party'),
    ('anniversary', 'Anniversary Celebration'),
    ('ceremony', 'Naming Ceremony'),
    ('general', 'General Banquet Event'),
    ('other', 'Other Banquet'),
]

class RoomBooking(models.Model):   # 
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    room_type = models.CharField(max_length=20, choices=ROOM_TYPE_CHOICES, default='classic')
    price = models.CharField(max_length=50)
    check_in = models.DateField()
    check_out = models.DateField()
    guests = models.IntegerField()
    name = models.CharField(max_length=100)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=15)
    payment_method = models.CharField(max_length=50)  # 'hotel' or 'advance'
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.get_room_type_display()} (Room)"


class BanquetBooking(models.Model):
    banquet_type = models.CharField(max_length=20, choices=BANQUET_TYPE_CHOICES, default='general')
    price_per_person = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    event_date = models.DateField()
    guests = models.IntegerField()
    name = models.CharField(max_length=100)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=15)
    payment_method = models.CharField(max_length=50)  # 'hotel' or 'advance'
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.get_banquet_type_display()} (Banquet)"