// ===============================
// HAMBURGER MENU
// ===============================
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");

if (hamburger && navMenu) {
    hamburger.addEventListener("click", function () {
        hamburger.classList.toggle("active");
        navMenu.classList.toggle("active");
    });

    document.querySelectorAll(".nav-menu a").forEach(link => {
        link.addEventListener("click", function () {
            hamburger.classList.remove("active");
            navMenu.classList.remove("active");
        });
    });
}

// ===============================
// STICKY HEADER
// ===============================
window.addEventListener("scroll", function () {
    const header = document.querySelector("header");
    header.classList.toggle("scrolled", window.scrollY > 0);
});

// ===============================
// HERO SLIDER
// ===============================
const slides = document.querySelectorAll(".slide");
let current = 0;

if (slides.length > 0) {
    function nextSlide() {
        slides[current].classList.remove("active");
        current = (current + 1) % slides.length;
        slides[current].classList.add("active");
    }

    setInterval(nextSlide, 4000);
}

// ===============================
// ROOM FILTER
// ===============================
const filterButtons = document.querySelectorAll(".room-tabs button");
const roomCards = document.querySelectorAll(".room-card");

if (filterButtons.length > 0 && roomCards.length > 0) {
    filterButtons.forEach(button => {
        button.addEventListener("click", function () {
            filterButtons.forEach(btn => btn.classList.remove("active"));
            this.classList.add("active");

            const filter = this.getAttribute("data-filter");

            roomCards.forEach(card => {
                const category = card.getAttribute("data-category");
                card.style.display = (filter === "all" || category === filter) ? "block" : "none";
            });
        });
    });
}

// ===============================
// POLICY TOGGLE
// ===============================
function togglePolicy() {
    const text = document.getElementById('policyText');
    const btn = document.querySelector('.view-details-btn');
    if (!text.classList.contains('expanded')) {
        text.style.webkitLineClamp = 'unset';
        text.style.display = 'block';
        text.classList.add('expanded');
        btn.textContent = 'Show Less';
    } else {
        text.style.webkitLineClamp = '2';
        text.style.display = '-webkit-box';
        text.classList.remove('expanded');
        btn.textContent = 'View Details';
    }
}

// ===============================
// bookings MODAL STEPS
// ===============================
let bookingsData = {};

function updateBookingOptions() {
    const bookingType = document.getElementById('bookingType').value;
    const roomTypeGroup = document.getElementById('roomTypeGroup');
    const banquetTypeGroup = document.getElementById('banquetTypeGroup');
    const roomTypeSelect = document.getElementById('roomType');
    const banquetTypeSelect = document.getElementById('banquetType');
    const checkoutGroup = document.getElementById('checkoutGroup');
    const dateLabel = document.getElementById('dateLabel');
    const priceLabel = document.getElementById('priceLabel');
    const priceUnit = document.getElementById('priceUnit');
    const guestNote = document.getElementById('guestNote');
    
    // Hide both groups first
    roomTypeGroup.style.display = 'none';
    banquetTypeGroup.style.display = 'none';
    checkoutGroup.style.display = 'block';
    
    // Remove required attribute temporarily
    roomTypeSelect.removeAttribute('required');
    banquetTypeSelect.removeAttribute('required');
    
    // Reset to defaults
    dateLabel.textContent = 'Check-in Date';
    priceLabel.textContent = 'Price:';
    priceUnit.textContent = '';
    guestNote.style.display = 'none';
    
    // Show relevant group based on booking type
    if (bookingType === 'room') {
        roomTypeGroup.style.display = 'block';
        roomTypeSelect.setAttribute('required', 'required');
        updateModalTitle('Room Booking');
        priceUnit.textContent = '/night';
        guestNote.style.display = 'none';
        bookingsData.isBanquet = false;
    } else if (bookingType === 'banquet') {
        banquetTypeGroup.style.display = 'block';
        banquetTypeSelect.setAttribute('required', 'required');
        updateModalTitle('Banquet Booking');
        checkoutGroup.style.display = 'none';
        dateLabel.textContent = 'Event Date';
        priceLabel.textContent = 'Base Price:';
        priceUnit.textContent = '/person';
        guestNote.style.display = 'block';
        bookingsData.isBanquet = true;
    } else {
        updateModalTitle('Booking');
        guestNote.style.display = 'none';
    }
    
    // Update price display
    updateModalPrice();
}

function updateModalTitle(title) {
    const modalTitle = document.querySelector('#step1 h2');
    if (modalTitle) {
        modalTitle.innerHTML = `Book <span id="modalRoomName">${title}</span>`;
    }
}

function openbookingsModal(roomName, price = 'Contact for price', isBanquet = false) {
    bookingsData.room = roomName;
    bookingsData.price = price;
    bookingsData.isBanquet = isBanquet;

    document.getElementById('modalRoomName').textContent = roomName;
    document.getElementById('modalPrice').textContent = price;
    document.getElementById('summaryPrice').textContent = price;

    const modal = document.getElementById('bookingsModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Set date label and show/hide checkout based on booking type
    const dateLabel = document.getElementById('dateLabel');
    const checkoutGroup = document.getElementById('checkoutGroup');
    const checkoutLabel = document.getElementById('checkoutLabel');
    
    if (isBanquet) {
        dateLabel.textContent = 'Event Date';
        checkoutLabel.textContent = 'Event End Date';
        checkoutGroup.style.display = 'block';
        // Add required attribute for banquet booking too
        document.getElementById('checkoutDate').setAttribute('required', 'required');
    } else {
        dateLabel.textContent = 'Check-in Date';
        checkoutLabel.textContent = 'Check-out Date';
        checkoutGroup.style.display = 'block';
        // Add required attribute for room booking
        document.getElementById('checkoutDate').setAttribute('required', 'required');
    }
    
    // Add real-time price update listener for guests input
    const guestsInput = document.getElementById('guests');
    if (guestsInput) {
        guestsInput.removeEventListener('input', updateModalPrice);
        guestsInput.addEventListener('input', updateModalPrice);
        // Update price immediately for banquet
        if (isBanquet) {
            updateModalPrice();
        }
    }
    
    // Set minimum date for booking (today)
    const today = new Date().toISOString().split('T')[0];
    const checkinDate = document.getElementById('checkinDate');
    const checkoutDate = document.getElementById('checkoutDate');
    if (checkinDate) {
        checkinDate.min = today;
    }
    if (checkoutDate) {
        checkoutDate.min = today;
    }
}

function updateModalPrice() {
    const guests = document.getElementById('guests').value || 1;
    let basePrice = 0;
    
    if (bookingsData.price && bookingsData.price.includes('₹')) {
        basePrice = parseInt(bookingsData.price.replace(/[₹,]/g, ''));
    }
    
    let totalPrice;
    let displayPrice;
    
    if (bookingsData.isBanquet) {
        // For banquet, price is per person
        totalPrice = basePrice * parseInt(guests);
        displayPrice = "₹" + totalPrice.toLocaleString('en-IN') + " (" + guests + " guests × ₹" + basePrice.toLocaleString('en-IN') + ")";
        document.getElementById('modalPrice').textContent = displayPrice;
    } else {
        // For rooms, price is per night (not multiplied by guests)
        totalPrice = basePrice;
        displayPrice = "₹" + totalPrice.toLocaleString('en-IN');
        document.getElementById('modalPrice').textContent = displayPrice;
    }
    
    // Store total price for later use
    bookingsData.totalPrice = totalPrice;
}

function closeModal() {
    const modal = document.getElementById('bookingsModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';

    document.getElementById('step1').classList.add('active');
    document.getElementById('step2').classList.remove('active');
    document.getElementById('step3').classList.remove('active');
    document.getElementById('bookingsForm').reset();
}

function goToStep2() {
    const checkin = document.getElementById('checkinDate').value;
    const checkout = document.getElementById('checkoutDate').value;
    const guests = document.getElementById('guests').value;
    const name = document.getElementById('fullName').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;

    // Validate required fields
    if (!checkin || !checkout || !guests || !name || !phone) {
        alert('Please fill all required fields');
        return;
    }
    
    // Validate dates
    const checkinDate = new Date(checkin);
    const checkoutDate = checkout ? new Date(checkout) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (checkinDate < today) {
        alert('Check-in date cannot be in past');
        return;
    }
    
    if (checkoutDate && checkoutDate <= checkinDate) {
        alert('Check-out date must be after check-in date');
        return;
    }
    
    // Validate phone number
    const phoneRegex = /^[+]?[\d\s\-\(\)]+$/;
    if (!phoneRegex.test(phone)) {
        alert('Please enter a valid phone number');
        return;
    }
    
    // Validate email if provided
    if (email && email.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address');
            return;
        }
    }

    bookingsData.checkin = checkin;
    bookingsData.checkout = checkout;
    bookingsData.guests = guests;
    bookingsData.name = name;
    bookingsData.phone = phone;
    bookingsData.email = email;

    // Calculate total price based on guests
    let basePrice = 0;
    if (bookingsData.price && bookingsData.price.includes('₹')) {
        basePrice = parseInt(bookingsData.price.replace(/[₹,]/g, ''));
    }

    let totalPrice;
    if (bookingsData.isBanquet) {
        // For banquet, price is per person
        totalPrice = basePrice * parseInt(guests);
    } else {
        // For rooms, price is per night (not multiplied by guests)
        totalPrice = basePrice;
    }

    // Update both modal price and summary price
    const bookingTypeText = bookingsData.isBanquet ? 'Banquet Booking' : 'Room Booking';
    
    if (bookingsData.isBanquet) {
        document.getElementById('summaryPrice').textContent = "₹" + totalPrice.toLocaleString('en-IN') + " (Total for " + guests + " guests)";
    } else {
        document.getElementById('summaryPrice').textContent = "₹" + totalPrice.toLocaleString('en-IN') + "/night";
    }

    document.getElementById('summaryBookingType').textContent = bookingTypeText;
    document.getElementById('summaryCheckin').textContent = new Date(checkin).toLocaleDateString();
    document.getElementById('summaryCheckout').textContent = new Date(checkout).toLocaleDateString();
    document.getElementById('summaryGuests').textContent = guests;
    document.getElementById('summaryName').textContent = name;
    document.getElementById('summaryPhone').textContent = phone;
    document.getElementById('summaryEmail').textContent = email || 'Not provided';

    document.getElementById('step1').classList.remove('active');
    document.getElementById('step2').classList.add('active');
}

function getBanquetTypeDisplay(banquetType) {
    if (!banquetType) return '-';
    
    const typeMap = {
        'birthday': 'Birthday Celebration',
        'wedding': 'Wedding Ceremony',
        'engagement': 'Engagement Party',
        'anniversary': 'Anniversary Celebration',
        'ceremony': 'Naming Ceremony',
        'baby-shower': 'Baby Shower',
        'general': 'General Banquet Event',
        'other': 'Other Banquet'
    };
    
    return typeMap[banquetType] || banquetType;
}

function goToStep1() {
    document.getElementById('step1').classList.add('active');
    document.getElementById('step2').classList.remove('active');
}
// ===============================
// SUBMIT bookings (AJAX TO DJANGO)
// ===============================
function submitbookings() {
    bookingsData.payment = document.querySelector('input[name="payment"]:checked').value;

    // Show loading state
    const submitBtn = document.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Processing...';
    submitBtn.disabled = true;

    // Calculate total price based on booking type
    let basePrice = 0;
    if (bookingsData.price && bookingsData.price.includes('₹')) {
        basePrice = parseInt(bookingsData.price.replace(/[₹,]/g, ''));
    }

    let totalPrice;
    let priceToSend;
    
    if (bookingsData.isBanquet) {
        // For banquet, calculate total price based on guests
        totalPrice = basePrice * parseInt(bookingsData.guests);
        priceToSend = bookingsData.price; // Send per-person price
    } else {
        // For rooms, price is per night
        totalPrice = basePrice;
        priceToSend = bookingsData.price;
    }

    // Prepare data for AJAX request
    const bookingData = {
        booking_type: bookingsData.isBanquet ? 'banquet' : 'room',
        room: bookingsData.room,
        price: priceToSend,
        checkin: bookingsData.checkin,
        checkout: bookingsData.checkout || '',
        guests: bookingsData.guests,
        name: bookingsData.name,
        phone: bookingsData.phone,
        email: bookingsData.email,
        payment: bookingsData.payment
    };

    // Send data to Django via AJAX
    fetch('/submit-bookings/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify(bookingData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            // Show success message
            document.getElementById('step2').classList.remove('active');
            document.getElementById('step3').classList.add('active');
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    })
    .finally(() => {
        // Reset button state
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    });
}

// Helper to get CSRF token
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// ===============================
// AOS ANIMATIONS
// ===============================
AOS.init({
    duration: 1000,
    once: true,
    offset: 100,
});

// ===============================
// SMOOTH SCROLL
// ===============================
document.querySelectorAll('a[href*="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');

        if (href.includes('#')) {
            const id = href.substring(href.indexOf('#'));
            const target = document.querySelector(id);

            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: "smooth"
                });
            }
        }
    });
});

// ===============================
// POP ANIMATION ON HOVER
// ===============================
document.querySelectorAll('.room-card, .banquet-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.animation = 'pop 0.5s ease';
    });
});

// ===============================
// PROFESSIONAL SLIDING CALENDAR
// ===============================
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();
let selectedDate = null;
let calendarEvents = {}; // Store events for each date

const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function initCalendar() {
    updateCalendar();
    populateYearSelector();
    addSampleEvents(); // Add some sample events
}

function updateCalendar() {
    const monthYearElement = document.getElementById('currentMonthYear');
    const calendarDaysElement = document.getElementById('calendarDays');
    const calendarContainer = document.querySelector('.calendar-container');
    
    if (!monthYearElement || !calendarDaysElement) return;
    
    // Add loading state
    if (calendarContainer) {
        calendarContainer.classList.add('loading');
    }
    
    // Update month/year display with proper formatting
    monthYearElement.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    
    // Clear previous days with animation
    calendarDaysElement.style.opacity = '0';
    
    setTimeout(() => {
        calendarDaysElement.innerHTML = '';
        
        // Get first day of month and number of days
        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = getDaysInMonth(currentMonth, currentYear);
        const daysInPrevMonth = getDaysInMonth(currentMonth - 1, currentYear);
        
        // Add previous month's trailing days
        for (let i = firstDay - 1; i >= 0; i--) {
            const day = daysInPrevMonth - i;
            const dayElement = createDayElement(day, 'other-month', currentMonth - 1, currentYear);
            calendarDaysElement.appendChild(dayElement);
        }
        
        // Add current month's days
        for (let day = 1; day <= daysInMonth; day++) {
            const isToday = isCurrentDay(day, currentMonth, currentYear);
            const hasEvent = hasEventOnDate(day, currentMonth, currentYear);
            let className = '';
            
            if (isToday) className = 'today';
            if (hasEvent) className += (className ? ' ' : '') + 'has-event';
            
            const dayElement = createDayElement(day, className, currentMonth, currentYear);
            
            // Add click event for day selection
            dayElement.addEventListener('click', function() {
                selectDate(day, currentMonth, currentYear);
            });
            
            // Add hover tooltip for events
            if (hasEvent) {
                addEventTooltip(dayElement, day, currentMonth, currentYear);
            }
            
            calendarDaysElement.appendChild(dayElement);
        }
        
        // Add next month's leading days to complete the grid
        const totalCells = calendarDaysElement.children.length;
        const remainingCells = 42 - totalCells; // 6 rows × 7 days = 42 cells
        
        for (let day = 1; day <= remainingCells; day++) {
            const dayElement = createDayElement(day, 'other-month', currentMonth + 1, currentYear);
            calendarDaysElement.appendChild(dayElement);
        }
        
        // Fade in calendar
        calendarDaysElement.style.opacity = '1';
        
        // Remove loading state
        if (calendarContainer) {
            calendarContainer.classList.remove('loading');
        }
    }, 300);
}

function getDaysInMonth(month, year) {
    // Handle leap year for February
    if (month === 1) { // February
        return ((year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)) ? 29 : 28;
    }
    
    // Handle month overflow/underflow
    const adjustedMonth = (month + 12) % 12;
    const adjustedYear = month < 0 ? year - 1 : (month > 11 ? year + 1 : year);
    
    return monthDays[adjustedMonth];
}

function createDayElement(day, className, month, year) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    dayElement.textContent = day;
    
    if (className) {
        dayElement.classList.add(className);
    }
    
    // Store date data
    dayElement.dataset.day = day;
    dayElement.dataset.month = month;
    dayElement.dataset.year = year;
    
    // Add proper date format for accessibility
    const actualMonth = (month + 12) % 12;
    const actualYear = month < 0 ? year - 1 : (month > 11 ? year + 1 : year);
    dayElement.setAttribute('aria-label', `${monthNames[actualMonth]} ${day}, ${actualYear}`);
    
    // Add animation with staggered delay
    const delay = Math.random() * 200; // Random delay for natural effect
    setTimeout(() => {
        dayElement.style.opacity = '1';
        dayElement.style.transform = 'translateY(0) scale(1)';
    }, delay);
    
    return dayElement;
}

function isCurrentDay(day, month, year) {
    const today = new Date();
    return day === today.getDate() && 
           month === today.getMonth() && 
           year === today.getFullYear();
}

function hasEventOnDate(day, month, year) {
    const dateKey = `${year}-${month}-${day}`;
    return calendarEvents[dateKey] && calendarEvents[dateKey].length > 0;
}

function addEventTooltip(element, day, month, year) {
    const dateKey = `${year}-${month}-${day}`;
    const events = calendarEvents[dateKey];
    
    if (events && events.length > 0) {
        element.title = events.map(event => event.title).join(', ');
    }
}

function selectDate(day, month, year) {
    // Remove previous selection
    document.querySelectorAll('.calendar-day.selected').forEach(el => {
        el.classList.remove('selected');
    });
    
    // Add selection to clicked date
    const dayElements = document.querySelectorAll('.calendar-day');
    dayElements.forEach(el => {
        if (parseInt(el.dataset.day) === day && 
            parseInt(el.dataset.month) === month && 
            parseInt(el.dataset.year) === year) {
            el.classList.add('selected');
        }
    });
    
    // Store selected date
    selectedDate = new Date(year, month, day);
    
    // Show date selection feedback
    const dateString = selectedDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    console.log('Selected date:', dateString);
    
    // Optional: Trigger booking modal with selected date
    // openbookingsModalWithDate(selectedDate);
}

function changeMonth(direction) {
    currentMonth += direction;
    
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    } else if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    
    updateCalendar();
    updateYearSelector();
    
    // Add slide animation
    const calendarDays = document.getElementById('calendarDays');
    if (calendarDays) {
        calendarDays.style.transform = direction > 0 ? 'translateX(50px)' : 'translateX(-50px)';
        calendarDays.style.opacity = '0.5';
        
        setTimeout(() => {
            calendarDays.style.transform = 'translateX(0)';
            calendarDays.style.opacity = '1';
        }, 150);
    }
}

function populateYearSelector() {
    const yearSelect = document.getElementById('yearSelect');
    if (!yearSelect) return;
    
    yearSelect.innerHTML = '';
    
    // Populate with years from current year - 10 to current year + 15
    const startYear = currentYear - 10;
    const endYear = currentYear + 15;
    
    for (let year = startYear; year <= endYear; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        if (year === currentYear) {
            option.selected = true;
        }
        yearSelect.appendChild(option);
    }
}

function updateYearSelector() {
    const yearSelect = document.getElementById('yearSelect');
    if (yearSelect) {
        yearSelect.value = currentYear;
    }
}

function addSampleEvents() {
    // Add some sample events for demonstration
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Add sample events for current month
    calendarEvents[`${currentYear}-${currentMonth}-15`] = [
        { title: 'Conference Room Booking', time: '10:00 AM' }
    ];
    
    calendarEvents[`${currentYear}-${currentMonth}-20`] = [
        { title: 'Birthday Party', time: '6:00 PM' },
        { title: 'Room Booking', time: 'Check-in' }
    ];
    
    calendarEvents[`${currentYear}-${currentMonth}-25`] = [
        { title: 'Corporate Event', time: '2:00 PM' }
    ];
}

function goToToday() {
    const today = new Date();
    currentMonth = today.getMonth();
    currentYear = today.getFullYear();
    updateCalendar();
    updateYearSelector();
    
    // Highlight today with animation
    setTimeout(() => {
        const todayElement = document.querySelector('.calendar-day.today');
        if (todayElement) {
            todayElement.style.animation = 'pulse 1s ease-in-out 3';
        }
    }, 500);
}

function goToPreviousYear() {
    currentYear--;
    updateCalendar();
    updateYearSelector();
}

function goToNextYear() {
    currentYear++;
    updateCalendar();
    updateYearSelector();
}

// Enhanced keyboard navigation
document.addEventListener('keydown', function(e) {
    // Only handle keyboard events when calendar is in view
    const calendarSection = document.getElementById('calendar-section');
    if (!calendarSection) return;
    
    const rect = calendarSection.getBoundingClientRect();
    const isInView = rect.top < window.innerHeight && rect.bottom > 0;
    
    if (!isInView) return;
    
    switch(e.key) {
        case 'ArrowLeft':
            e.preventDefault();
            changeMonth(-1);
            break;
        case 'ArrowRight':
            e.preventDefault();
            changeMonth(1);
            break;
        case 'ArrowUp':
            e.preventDefault();
            goToPreviousYear();
            break;
        case 'ArrowDown':
            e.preventDefault();
            goToNextYear();
            break;
        case 'Home':
            e.preventDefault();
            goToToday();
            break;
        case 't':
        case 'T':
            e.preventDefault();
            goToToday();
            break;
    }
});

// Add touch/swipe support for mobile
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', function(e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const calendarSection = document.getElementById('calendar-section');
    if (!calendarSection) return;
    
    const rect = calendarSection.getBoundingClientRect();
    const isInView = rect.top < window.innerHeight && rect.bottom > 0;
    
    if (!isInView) return;
    
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            changeMonth(1); // Swipe left - next month
        } else {
            changeMonth(-1); // Swipe right - previous month
        }
    }
}

// Initialize calendar when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initCalendar();
    
    // Add smooth scroll behavior for calendar navigation
    const calendarLink = document.querySelector('a[href="#calendar-section"]');
    if (calendarLink) {
        calendarLink.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.getElementById('calendar-section');
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }
});

// Add month/year display formatting
function formatMonthYear() {
    const options = { 
        year: 'numeric', 
        month: 'long' 
    };
    return new Date(currentYear, currentMonth).toLocaleDateString('en-US', options);
}

// Export functions for potential external use
window.calendarFunctions = {
    goToToday,
    changeMonth,
    selectDate,
    updateCalendar
};

// ===============================
// SCROLL TO TOP BUTTON
// ===============================
const scrollToTopBtn = document.getElementById('scrollToTop');

if (scrollToTopBtn) {
    // Show/hide button based on scroll position
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.classList.add('show');
        } else {
            scrollToTopBtn.classList.remove('show');
        }
    });

    // Smooth scroll to top when clicked
    scrollToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}
