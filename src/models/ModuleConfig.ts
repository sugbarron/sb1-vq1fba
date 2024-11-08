import mongoose from 'mongoose'

const moduleConfigSchema = new mongoose.Schema({
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    required: true,
  },
  settings: [{
    key: {
      type: String,
      required: true,
    },
    value: mongoose.Schema.Types.Mixed,
    type: {
      type: String,
      enum: ['string', 'number', 'boolean', 'array', 'object'],
      required: true,
    },
    label: String,
    description: String,
    options: [mongoose.Schema.Types.Mixed], // For select/radio inputs
    required: {
      type: Boolean,
      default: false,
    },
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

// Ensure unique moduleId and key combination
moduleConfigSchema.index({ moduleId: 1, 'settings.key': 1 }, { unique: true })

export default mongoose.models.ModuleConfig || mongoose.model('ModuleConfig', moduleConfigSchema)