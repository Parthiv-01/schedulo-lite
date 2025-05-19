// File: public/app.js

// Global variables
let timeSlots = [];
let selectedSlotId = null;
const API_URL = '/api'; // Base API URL

// DOM elements
const timeSlotsContainer = document.getElementById('timeSlotsContainer');
const bookingForm = document.getElementById('bookingForm');
const nameInput = document.getElementById('nameInput');
const selectedSlotElement = document.getElementById('selectedSlot');
const bookButton = document.getElementById('bookButton');
const statusMessage = document.getElementById('statusMessage');

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Fetch initial time slots data
    fetchTimeSlots();
    
    // Add event listener for booking form submission
    bookButton.addEventListener('click', bookSelectedSlot);
    
    // Add event listener for name input validation
    nameInput.addEventListener('input', validateBookingForm);
});

// Fetch time slots from the API
async function fetchTimeSlots() {
    try {
        const response = await fetch(`${API_URL}/slots`);
        const data = await response.json();
        
        if (data.success) {
            timeSlots = data.data;
            renderTimeSlots();
        } else {
            showStatusMessage('Failed to load time slots. Please refresh the page.', 'error');
        }
    } catch (error) {
        console.error('Error fetching time slots:', error);
        showStatusMessage('Failed to load time slots. Please refresh the page.', 'error');
    }
}

// Render time slots to the UI
function renderTimeSlots() {
    // Clear the container
    timeSlotsContainer.innerHTML = '';
    
    if (timeSlots.length === 0) {
        timeSlotsContainer.innerHTML = '<div class="no-slots">No time slots available</div>';
        return;
    }
    
    // Create and append time slot elements
    timeSlots.forEach(slot => {
        const slotElement = document.createElement('div');
        slotElement.className = 'time-slot';
        
        const statusClass = slot.isBooked ? 'status-booked' : 'status-available';
        const statusText = slot.isBooked ? 'Booked' : 'Available';
        
        slotElement.innerHTML = `
            <div class="time-slot-time">${slot.time}</div>
            <div class="time-slot-status ${statusClass}">${statusText}</div>
            ${slot.isBooked ? `<div class="booked-by">Booked by: ${slot.bookedBy}</div>` : ''}
            <div class="time-slot-actions">
                ${slot.isBooked ? 
                    `<button class="btn btn-danger" onclick="cancelBooking(${slot.id})">Cancel Booking</button>` : 
                    `<button class="btn btn-success" onclick="selectSlot(${slot.id}, '${slot.time}')">Book This Slot</button>`
                }
            </div>
        `;
        
        timeSlotsContainer.appendChild(slotElement);
    });
}

// Select a slot for booking
function selectSlot(id, time) {
    selectedSlotId = id;
    selectedSlotElement.textContent = time;
    
    // Show the booking form
    bookingForm.style.display = 'block';
    
    // Scroll to the booking form
    bookingForm.scrollIntoView({ behavior: 'smooth' });
    
    // Focus on the name input field
    nameInput.focus();
    
    // Validate the form
    validateBookingForm();
}

// Validate the booking form
function validateBookingForm() {
    const name = nameInput.value.trim();
    bookButton.disabled = name.length < 2; // Require at least 2 characters
}

// Hide the booking form
function hideBookingForm() {
    bookingForm.style.display = 'none';
    nameInput.value = '';
    selectedSlotId = null;
    selectedSlotElement.textContent = 'Please select a time slot';
}

// Book the selected slot
async function bookSelectedSlot() {
    if (!selectedSlotId) {
        showStatusMessage('Please select a time slot first', 'error');
        return;
    }
    
    const name = nameInput.value.trim();
    if (name.length < 2) {
        showStatusMessage('Please enter your name (at least 2 characters)', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/book`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: selectedSlotId, name })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showStatusMessage(`Success! ${name}, you've booked the slot at ${data.data.time}`, 'success');
            hideBookingForm();
            fetchTimeSlots(); // Refresh the time slots
        } else {
            showStatusMessage(data.message || 'Failed to book the slot', 'error');
        }
    } catch (error) {
        console.error('Error booking slot:', error);
        showStatusMessage('Failed to book the slot. Please try again.', 'error');
    }
}

// Cancel a booking
async function cancelBooking(id) {
    if (!confirm('Are you sure you want to cancel this booking?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/cancel`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showStatusMessage('Booking cancelled successfully', 'success');
            fetchTimeSlots(); // Refresh the time slots
        } else {
            showStatusMessage(data.message || 'Failed to cancel the booking', 'error');
        }
    } catch (error) {
        console.error('Error cancelling booking:', error);
        showStatusMessage('Failed to cancel the booking. Please try again.', 'error');
    }
}

// Show status message
function showStatusMessage(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = `status-message status-${type}`;
    
    // Auto-hide the message after 5 seconds
    setTimeout(() => {
        statusMessage.className = 'status-message';
    }, 5000);
}