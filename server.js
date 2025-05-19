const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// In-memory data store
const timeSlots = [
  { id: 1, time: '10:00 AM', isBooked: false, bookedBy: null },
  { id: 2, time: '11:00 AM', isBooked: false, bookedBy: null },
  { id: 3, time: '12:00 PM', isBooked: false, bookedBy: null },
  { id: 4, time: '01:00 PM', isBooked: false, bookedBy: null },
  { id: 5, time: '02:00 PM', isBooked: false, bookedBy: null },
  { id: 6, time: '03:00 PM', isBooked: false, bookedBy: null },
  { id: 7, time: '04:00 PM', isBooked: false, bookedBy: null },
];

// GET /slots - Returns all time slots with booking status
app.get('/api/slots', (req, res) => {
  res.json({ success: true, data: timeSlots });
});

// POST /book - Books a slot
app.post('/api/book', (req, res) => {
  const { id, name } = req.body;
  
  if (!id || !name) {
    return res.status(400).json({ 
      success: false, 
      message: 'Both slot ID and name are required' 
    });
  }

  const slotIndex = timeSlots.findIndex(slot => slot.id === id);
  
  if (slotIndex === -1) {
    return res.status(404).json({ 
      success: false, 
      message: 'Slot not found' 
    });
  }
  
  if (timeSlots[slotIndex].isBooked) {
    return res.status(400).json({ 
      success: false, 
      message: 'This slot is already booked' 
    });
  }
  
  // Book the slot
  timeSlots[slotIndex].isBooked = true;
  timeSlots[slotIndex].bookedBy = name;
  
  res.json({ 
    success: true, 
    message: 'Slot booked successfully', 
    data: timeSlots[slotIndex] 
  });
});

// POST /cancel - Cancels a booking
app.post('/api/cancel', (req, res) => {
  const { id } = req.body;
  
  if (!id) {
    return res.status(400).json({ 
      success: false, 
      message: 'Slot ID is required' 
    });
  }
  
  const slotIndex = timeSlots.findIndex(slot => slot.id === id);
  
  if (slotIndex === -1) {
    return res.status(404).json({ 
      success: false, 
      message: 'Slot not found' 
    });
  }
  
  if (!timeSlots[slotIndex].isBooked) {
    return res.status(400).json({ 
      success: false, 
      message: 'This slot is not booked' 
    });
  }
  
  // Cancel the booking
  timeSlots[slotIndex].isBooked = false;
  timeSlots[slotIndex].bookedBy = null;
  
  res.json({ 
    success: true, 
    message: 'Booking cancelled successfully', 
    data: timeSlots[slotIndex] 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Schedulo Lite server running on port ${PORT}`);
});