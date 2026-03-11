from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.admin.views.decorators import staff_member_required
from .models import RoomBooking, BanquetBooking
import json
import csv
from datetime import datetime

@csrf_exempt
@require_http_methods(["GET"])
def api_room_bookings(request):
    """API endpoint to fetch room bookings"""
    try:
        bookings = RoomBooking.objects.all().values(
            'id', 'room_type', 'check_in', 'check_out', 'guests', 
            'name', 'email', 'phone', 'payment_method', 'created_at'
        )
        return JsonResponse(list(bookings), safe=False)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def api_banquet_bookings(request):
    """API endpoint to fetch banquet bookings"""
    try:
        bookings = BanquetBooking.objects.all().values(
            'id', 'banquet_type', 'event_date', 'guests', 
            'name', 'email', 'phone', 'payment_method', 'created_at'
        )
        return JsonResponse(list(bookings), safe=False)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500), get_object_or_404
from django.http import JsonResponse, HttpResponseRedirect
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.admin.views.decorators import staff_member_required
from django.utils import timezone
from datetime import datetime, timedelta
from calendar import monthrange, month_name
from .models import RoomBooking, BanquetBooking
from gallery.models import Gallery
import json
import logging

logger = logging.getLogger(__name__)


def get_calendar_context():
    """Helper function to get calendar data"""
    today = timezone.now().date()
    year = today.year
    month = today.month
    days_in_month = monthrange(year, month)[1]
    starting_weekday = monthrange(year, month)[0]
    
    # Get bookings for this month
    room_bookings = RoomBooking.objects.filter(
        check_in__lte=datetime(year, month, days_in_month),
        check_out__gte=datetime(year, month, 1)
    )
    
    banquet_bookings = BanquetBooking.objects.filter(
        event_date__year=year,
        event_date__month=month
    )
    
    # Create calendar data
    calendar_data = []
    for day in range(1, days_in_month + 1):
        current_date = datetime(year, month, day).date()
        
        # Check if this date is booked
        room_booked = room_bookings.filter(
            check_in__lte=current_date,
            check_out__gte=current_date
        ).exists()
        
        banquet_booked = banquet_bookings.filter(event_date=current_date).exists()
        
        # Count bookings for this day
        room_count = room_bookings.filter(
            check_in__lte=current_date,
            check_out__gte=current_date
        ).count()
        
        banquet_count = banquet_bookings.filter(event_date=current_date).count()
        
        calendar_data.append({
            'day': day,
            'date': current_date,
            'room_booked': room_booked,
            'banquet_booked': banquet_booked,
            'room_count': room_count,
            'banquet_count': banquet_count,
            'is_today': current_date == today,
            'is_past': current_date < today,
        })
    
    return {
        'calendar_data': calendar_data,
        'current_month': month,
        'current_year': year,
        'month_name': month_name[month],
        'starting_weekday': starting_weekday,
        'today': today,
    }


@csrf_exempt
@require_http_methods(["POST"])
def submit_bookings(request):
    try:
        data = json.loads(request.body)
        
        booking_type = data.get('booking_type', 'room')  # 'room' or 'banquet'
        
        if booking_type == 'banquet':
            # Calculate total price for banquet
            try:
                price_str = data['price'].replace('₹', '').replace(',', '')
                price_per_person = float(price_str)
                guests = int(data['guests'])
                total_price = price_per_person * guests
            except (ValueError, TypeError) as e:
                return JsonResponse({'status': 'error', 'message': f'Invalid price or guests data: {str(e)}'}, status=400)
            
            # Use the banquet type from form, fallback to mapped value
            banquet_type = data.get('banquet_type', '')
            if not banquet_type:
                # Map banquet type names to model choices
                banquet_type_mapping = {
                    'Classic Events Banquet': 'general',
                    'Elegant Gathering Banquet': 'general',
                    'Banquet Event': 'general'
                }
                banquet_type = banquet_type_mapping.get(data['room'], 'general')
            
            # Save to BanquetBooking table
            banquet_booking = BanquetBooking(
                banquet_type=banquet_type,
                price_per_person=price_per_person,
                total_price=total_price,
                event_date=data['checkin'],
                guests=guests,
                name=data['name'],
                email=data.get('email', ''),
                phone=data['phone'],
                payment_method=data['payment']
            )
            banquet_booking.save()
            
        else:
            # Use room type from form if available, otherwise use room name
            room_type = data.get('room_type', '')
            if not room_type:
                # Map room names to model choices
                room_type_mapping = {
                    'Classic Room': 'classic',
                    'Deluxe Room': 'deluxe',
                    'Suite Room': 'suite'
                }
                room_type = room_type_mapping.get(data['room'], 'other')
            
            # Save to RoomBooking table
            room_booking = RoomBooking(
                room_type=room_type,
                price=data['price'],
                check_in=data['checkin'],
                check_out=data['checkout'],
                guests=data['guests'],
                name=data['name'],
                email=data.get('email', ''),
                phone=data['phone'],
                payment_method=data['payment']
            )
            room_booking.save()
        
        # Return success response instead of redirecting to WhatsApp
        return JsonResponse({
            'status': 'success',
            'message': 'Booking confirmed! We will contact you shortly.'
        })
    
    except json.JSONDecodeError:
        return JsonResponse({'status': 'error', 'message': 'Invalid data format'}, status=400)
    except KeyError as e:
        return JsonResponse({'status': 'error', 'message': f'Missing required field: {str(e)}'}, status=400)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': f'Server error: {str(e)}'}, status=500)


def index(request):
    return render(request, 'index.html')


def gallery(request):
    images = Gallery.objects.all()
    return render(request, 'gallery.html', {'images': images})


@staff_member_required
def export_room_bookings_csv(request):
    """Export room bookings to CSV"""
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename=f"room_bookings_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv"'
    
    writer = csv.writer(response)
    
    # Header row
    writer.writerow([
        'Booking ID', 'Room Type', 'Price', 'Check-in Date', 'Check-out Date',
        'Number of Guests', 'Customer Name', 'Email', 'Phone', 'Payment Method',
        'Booking Date', 'Total Nights'
    ])
    
    # Data rows
    bookings = RoomBooking.objects.all().order_by('-created_at')
    for booking in bookings:
        # Calculate total nights
        total_nights = (booking.check_out - booking.check_in).days
        
        writer.writerow([
            booking.id,
            booking.get_room_type_display(),
            booking.price,
            booking.check_in.strftime('%Y-%m-%d'),
            booking.check_out.strftime('%Y-%m-%d'),
            booking.guests,
            booking.name,
            booking.email,
            booking.phone,
            booking.payment_method,
            booking.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            total_nights
        ])
    
    return response


@staff_member_required
def export_banquet_bookings_csv(request):
    """Export banquet bookings to CSV"""
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename=f"banquet_bookings_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv"'
    
    writer = csv.writer(response)
    
    # Header row
    writer.writerow([
        'Booking ID', 'Banquet Type', 'Price Per Person', 'Total Price',
        'Event Date', 'Number of Guests', 'Customer Name', 'Email', 'Phone',
        'Payment Method', 'Booking Date'
    ])
    
    # Data rows
    bookings = BanquetBooking.objects.all().order_by('-created_at')
    for booking in bookings:
        writer.writerow([
            booking.id,
            booking.get_banquet_type_display(),
            f"₹{booking.price_per_person}",
            f"₹{booking.total_price}",
            booking.event_date.strftime('%Y-%m-%d'),
            booking.guests,
            booking.name,
            booking.email,
            booking.phone,
            booking.payment_method,
            booking.created_at.strftime('%Y-%m-%d %H:%M:%S')
        ])
    
    return response


@staff_member_required
def export_all_bookings_csv(request):
    """Export all bookings (room + banquet) to CSV"""
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename=f"all_bookings_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv"'
    
    writer = csv.writer(response)
    
    # Header row
    writer.writerow([
        'Booking ID', 'Booking Type', 'Room/Banquet Type', 'Price',
        'Event/Check-in Date', 'Check-out Date', 'Number of Guests',
        'Customer Name', 'Email', 'Phone', 'Payment Method', 'Booking Date',
        'Total Nights', 'Total Price'
    ])
    
    # Room bookings
    room_bookings = RoomBooking.objects.all().order_by('-created_at')
    for booking in room_bookings:
        total_nights = (booking.check_out - booking.check_in).days
        writer.writerow([
            booking.id,
            'Room Booking',
            booking.get_room_type_display(),
            booking.price,
            booking.check_in.strftime('%Y-%m-%d'),
            booking.check_out.strftime('%Y-%m-%d'),
            booking.guests,
            booking.name,
            booking.email,
            booking.phone,
            booking.payment_method,
            booking.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            total_nights,
            booking.price  # For rooms, price is typically per night
        ])
    
    # Banquet bookings
    banquet_bookings = BanquetBooking.objects.all().order_by('-created_at')
    for booking in banquet_bookings:
        writer.writerow([
            booking.id,
            'Banquet Booking',
            booking.get_banquet_type_display(),
            f"₹{booking.price_per_person}/person",
            booking.event_date.strftime('%Y-%m-%d'),
            '',  # No checkout for banquet
            booking.guests,
            booking.name,
            booking.email,
            booking.phone,
            booking.payment_method,
            booking.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            '',  # No nights for banquet
            f"₹{booking.total_price}"
        ])
    
    return response


@staff_member_required
def admin_exports(request):
    """Admin page for exporting bookings"""
    from django.utils import timezone
    
    # Get statistics
    room_count = RoomBooking.objects.count()
    banquet_count = BanquetBooking.objects.count()
    total_count = room_count + banquet_count
    
    # Get today's bookings
    today = timezone.now().date()
    today_room_count = RoomBooking.objects.filter(created_at__date=today).count()
    today_banquet_count = BanquetBooking.objects.filter(created_at__date=today).count()
    today_count = today_room_count + today_banquet_count
    
    context = {
        'room_count': room_count,
        'banquet_count': banquet_count,
        'total_count': total_count,
        'today_count': today_count,
    }
    
    return render(request, 'admin_exports.html', context)