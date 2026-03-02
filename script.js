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
    if (text.style.webkitLineClamp === '2') {
        text.style.webkitLineClamp = 'unset';
        text.style.display = 'block';
        btn.textContent = 'Show Less';
    } else {
        text.style.webkitLineClamp = '2';
        text.style.display = '-webkit-box';
        btn.textContent = 'View Details';
    }
}

// ===============================
// SCROLL TO SECTION
// ===============================
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// ===============================
// BOOKING MODAL STEPS
// ===============================
let bookingData = {};

function openBookingModal(roomName, price = 'Contact for price') {
    bookingData.room = roomName;
    bookingData.price = price;

    document.getElementById('modalRoomName').textContent = roomName;
    document.getElementById('modalPrice').textContent = price;
    document.getElementById('summaryRoomName').textContent = roomName;
    document.getElementById('summaryPrice').textContent = price;

    const modal = document.getElementById('bookingModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('bookingModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';

    // Reset to step 1
    document.getElementById('step1').classList.add('active');
    document.getElementById('step2').classList.remove('active');
    document.getElementById('step3').classList.remove('active');
    document.getElementById('bookingForm').reset();
}

function goToStep2() {
    const checkin = document.getElementById('checkinDate').value;
    const checkout = document.getElementById('checkoutDate').value;
    const guests = document.getElementById('guests').value;
    const name = document.getElementById('fullName').value;
    const phone = document.getElementById('phone').value;

    if (!checkin || !checkout || !guests || !name || !phone) {
        alert('Please fill all required fields');
        return;
    }

    bookingData.checkin = checkin;
    bookingData.checkout = checkout;
    bookingData.guests = guests;
    bookingData.name = name;
    bookingData.phone = phone;

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

function submitBooking() {
    bookingData.payment = document.querySelector('input[name="payment"]:checked').value;

    document.getElementById('step2').classList.remove('active');
    document.getElementById('step3').classList.add('active');
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
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
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
