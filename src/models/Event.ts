import mongoose from 'mongoose'

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['upcoming', 'active', 'completed'],
    default: 'upcoming',
  },
  guests: [{
    guestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Guest',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'declined'],
      default: 'pending',
    },
    checkedIn: {
      type: Boolean,
      default: false,
    },
    checkInTime: Date,
  }],
  raffleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Raffle',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

// Update status based on date
eventSchema.pre('save', function(next) {
  const now = new Date()
  const eventDate = new Date(this.date)

  if (eventDate > now) {
    this.status = 'upcoming'
  } else if (eventDate.toDateString() === now.toDateString()) {
    this.status = 'active'
  } else {
    this.status = 'completed'
  }

  this.updatedAt = now
  next()
})

// Virtual for checked-in count
eventSchema.virtual('checkedInCount').get(function() {
  return this.guests.filter(guest => guest.checkedIn).length
})

// Virtual for total guest count
eventSchema.virtual('totalGuestCount').get(function() {
  return this.guests.length
})

// Virtual for confirmed guest count
eventSchema.virtual('confirmedGuestCount').get(function() {
  return this.guests.filter(guest => guest.status === 'confirmed').length
})

export default mongoose.models.Event || mongoose.model('Event', eventSchema)