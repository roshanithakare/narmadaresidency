"""
Production-ready Django views for Narmada Residency
Optimized for performance and maintainability
"""

import json
import logging
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.db import transaction
from .models import RoomBooking, BanquetBooking

logger = logging.getLogger(__name__)


@csrf_exempt
@require_http_methods(["POST"])
def submit_bookings(request):
    """
    Handle booking submissions for both room and banquet bookings
    Optimized with proper error handling and validation
    """
    try:
        data = json.loads(request.body)
        logger.info(f"Booking submission received: {data.get('booking_type', 'unknown')}")

        # Validate required fields
        required_fields = ['booking_type', 'room', 'price', 'checkin', 'checkout', 
                          'guests', 'name', 'phone', 'payment']
        
        for field in required_fields:
            if field not in data or not data[field]:
                return JsonResponse({
                    'status': 'error', 
                    'message': f'Missing required field: {field}'
                }, status=400)

        booking_type = data['booking_type']
        
        with transaction.atomic():
            if booking_type == 'banquet':
                result = create_banquet_booking(data)
            else:
                result = create_room_booking(data)
        
        logger.info(f"Booking successfully created: {result['id']}")
        return JsonResponse({
            'status': 'success',
            'message': 'Booking confirmed! We will contact you shortly.',
            'booking_id': result['id']
        })

    except json.JSONDecodeError:
        logger.error("Invalid JSON data received")
        return JsonResponse({
            'status': 'error', 
            'message': 'Invalid data format'
        }, status=400)
    
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        return JsonResponse({
            'status': 'error', 
            'message': f'Invalid data: {str(e)}'
        }, status=400)
    
    except Exception as e:
        logger.error(f"Server error during booking: {str(e)}")
        return JsonResponse({
            'status': 'error', 
            'message': 'Server error occurred. Please try again.'
        }, status=500)


def create_banquet_booking(data):
    """Create a banquet booking with proper validation"""
    try:
        # Validate and convert price
        price_str = data['price'].replace('₹', '').replace(',', '')
        price_per_person = float(price_str)
        guests = int(data['guests'])
        total_price = price_per_person * guests
        
        # Validate price and guests
        if price_per_person <= 0 or guests <= 0:
            raise ValueError("Price and guests must be positive numbers")

        # Map banquet type
        banquet_type_mapping = {
            'Classic Events Banquet': 'general',
            'Elegant Gathering Banquet': 'general',
            'Banquet Event': 'general'
        }
        banquet_type = banquet_type_mapping.get(data['room'], 'general')

        # Create booking
        booking = BanquetBooking.objects.create(
            banquet_type=banquet_type,
            price_per_person=price_per_person,
            total_price=total_price,
            event_date=data['checkin'],
            guests=guests,
            name=data['name'].strip(),
            email=data.get('email', '').strip(),
            phone=data['phone'].strip(),
            payment_method=data['payment']
        )
        
        return {'id': booking.id}
    
    except (ValueError, TypeError) as e:
        raise ValueError(f'Invalid price or guests data: {str(e)}')


def create_room_booking(data):
    """Create a room booking with proper validation"""
    try:
        # Validate and convert price
        price_str = data['price'].replace('₹', '').replace(',', '')
        price = float(price_str)
        guests = int(data['guests'])
        
        # Validate price and guests
        if price <= 0 or guests <= 0:
            raise ValueError("Price and guests must be positive numbers")

        # Map room type
        room_type_mapping = {
            'Classic Room': 'classic',
            'Deluxe Room': 'deluxe',
            'Suite Room': 'suite'
        }
        room_type = room_type_mapping.get(data['room'], 'other')

        # Create booking
        booking = RoomBooking.objects.create(
            room_type=room_type,
            price=data['price'],
            check_in=data['checkin'],
            check_out=data['checkout'],
            guests=guests,
            name=data['name'].strip(),
            email=data.get('email', '').strip(),
            phone=data['phone'].strip(),
            payment_method=data['payment']
        )
        
        return {'id': booking.id}
    
    except (ValueError, TypeError) as e:
        raise ValueError(f'Invalid price or guests data: {str(e)}')


def index(request):
    """Main homepage view"""
    return render(request, 'index.html')


def gallery(request):
    """Gallery page view"""
    from gallery.models import Gallery
    images = Gallery.objects.all()
    return render(request, 'gallery.html', {'images': images})
