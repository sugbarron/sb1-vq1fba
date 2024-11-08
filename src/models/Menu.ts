import mongoose from 'mongoose'

const menuSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  href: String,
  order: {
    type: Number,
    default: 0,
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Menu',
    default: null,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  roles: [{
    type: String,
    enum: ['admin', 'user', 'module_admin'],
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

menuSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

export default mongoose.models.Menu || mongoose.model('Menu', menuSchema)