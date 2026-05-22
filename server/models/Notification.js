const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['rating_drop', 'rating_rise', 'trend_spike', 'new_review', 'fake_detected', 'watchlist_alert', 'system'],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', default: null },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    isRead: { type: Boolean, default: false, index: true },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
