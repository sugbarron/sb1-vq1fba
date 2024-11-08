import mongoose from 'mongoose'

const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  department: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    required: true,
  },
  joinDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  raffleEligible: {
    type: Boolean,
    default: true,
    description: 'Indicates if the employee is eligible to participate in raffles',
  },
  raffleExclusionReason: {
    type: String,
    description: 'Reason why the employee is not eligible for raffles',
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

export default mongoose.models.Employee || mongoose.model('Employee', employeeSchema)