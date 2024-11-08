import mongoose from 'mongoose'

const raffleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed'],
    default: 'pending',
  },
  prizes: [{
    name: String,
    description: String,
    tier: {
      type: String,
      enum: ['platinum', 'gold', 'silver', 'bronze'],
      default: 'bronze',
    },
    value: {
      type: Number,
      min: 0,
    },
    claimed: {
      type: Boolean,
      default: false,
    },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
    },
  }],
  participants: [{
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
    },
    attended: {
      type: Boolean,
      default: false,
    },
    wonPrize: {
      type: Boolean,
      default: false,
    },
  }],
  currentWinner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    default: null,
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

raffleSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

export default mongoose.models.Raffle || mongoose.model('Raffle', raffleSchema)