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

function openbookingsModal(roomName, price = 'Contact for price') {
    bookingsData.room = roomName;
    bookingsData.price = price;

    document.getElementById('modalRoomName').textContent = roomName;
    document.getElementById('modalPrice').textContent = price;
    document.getElementById('summaryRoomName').textContent = roomName;
    document.getElementById('summaryPrice').textContent = price;

    const modal = document.getElementById('bookingsModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
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

    if (!checkin || !checkout || !guests || !name || !phone) {
        alert('Please fill all required fields');
        return;
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

const totalPrice = basePrice * guests;

document.getElementById('summaryPrice').textContent = "₹" + totalPrice;

// Fill summary
document.getElementById('summaryCheckin').textContent = new Date(checkin).toLocaleDateString();
document.getElementById('summaryCheckout').textContent = new Date(checkout).toLocaleDateString();
document.getElementById('summaryGuests').textContent = guests;
document.getElementById('summaryName').textContent = name;
document.getElementById('summaryPhone').textContent = phone;

    document.getElementById('step1').classList.remove('active');
    document.getElementById('step2').classList.add('active');
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

    // Send data to Django
    fetch('/submit-bookings/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // CSRF Token is required for Django POST requests
            'X-CSRFToken': getCookie('csrftoken') 
        },
        body: JSON.stringify(bookingsData)
    })
    .then(response => {
        if (response.redirected) {
            // Django redirects to WhatsApp URL
            window.location.href = response.url;
        } else {
            // If not redirected (error), show step 3
            document.getElementById('step2').classList.remove('active');
            document.getElementById('step3').classList.add('active');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('There was an error processing your bookings. Please try again.');
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