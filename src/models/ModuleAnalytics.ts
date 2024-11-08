import mongoose from 'mongoose'

const moduleAnalyticsSchema = new mongoose.Schema({
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
})

moduleAnalyticsSchema.index({ moduleId: 1, timestamp: -1 })
moduleAnalyticsSchema.index({ userId: 1, timestamp: -1 })

export default mongoose.models.ModuleAnalytics || mongoose.model('ModuleAnalytics', moduleAnalyticsSchema)