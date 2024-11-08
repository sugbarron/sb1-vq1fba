import mongoose from 'mongoose'

const moduleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  displayName: {
    type: String,
    required: true,
  },
  description: String,
  icon: String,
  path: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  permissions: [{
    action: String,
    description: String,
  }],
  adminRoles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.models.Module || mongoose.model('Module', moduleSchema)