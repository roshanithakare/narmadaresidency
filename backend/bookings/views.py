from django.shortcuts import render, redirect
from .models import Booking
from .models import Gallery
import json


def index(request):
    return render(request, 'index.html')


def gallery(request):
    images = Gallery.objects.all()
    return render(request, 'gallery.html', {'images': images})

def submit_bookings(request):   # ✅ matches urls.py
    if request.method == 'POST':
        data = json.loads(request.body)

        # Save to Database
        Booking.objects.create(
            room_type=data['room'],
            price=data['price'],
            check_in=data['checkin'],
            check_out=data['checkout'],
            guests=data['guests'],
            name=data['name'],
            email=data.get('email', ''),
            phone=data['phone'],
            payment_method=data['payment']
        )

        # WhatsApp Message
        admin_phone = "919481063333"

        message = (
            f"*NEW BOOKING REQUEST*\n\n"
            f"🏨 Room: {data['room']}\n"
            f"💰 Price: {data['price']}\n"
            f"📅 Check-in: {data['checkin']}\n"
            f"📅 Check-out: {data['checkout']}\n"
            f"👥 Guests: {data['guests']}\n"
            f"👤 Name: {data['name']}\n"
            f"📞 Phone: {data['phone']}\n"
            f"💳 Payment: {data['payment']}"
        )

        encoded_message = message.replace("\n", "%0A").replace(" ", "+")
        whatsapp_url = f"https://wa.me/{admin_phone}?text={encoded_message}"

        return redirect(whatsapp_url)

    return redirect('index')