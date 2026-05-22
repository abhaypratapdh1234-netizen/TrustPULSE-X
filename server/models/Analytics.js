const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    date: { type: Date, required: true, index: true },
    period: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'daily',
    },

    // Rating snapshot
    avgRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    newReviews: { type: Number, default: 0 },

    // Sentiment breakdown
    positiveCount: { type: Number, default: 0 },
    negativeCount: { type: Number, default: 0 },
    neutralCount: { type: Number, default: 0 },
    sentimentScore: { type: Number, default: 0 },

    // Trust & Trend
    trustScore: { type: Number, default: 0 },
    trendScore: { type: Number, default: 0 },
    fakeReviewCount: { type: Number, default: 0 },
    toxicReviewCount: { type: Number, default: 0 },

    // Engagement
    helpfulVotes: { type: Number, default: 0 },

    // Heatmap data (hour -> count)
    hourlyDistribution: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  { timestamps: true }
);

analyticsSchema.index({ company: 1, date: -1 });
analyticsSchema.index({ company: 1, period: 1, date: -1 });

module.exports = mongoose.model('Analytics', analyticsSchema);
