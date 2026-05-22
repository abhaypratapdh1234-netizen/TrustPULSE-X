const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    authorName: { type: String, default: 'Anonymous' },

    // Core Review
    rating: {
      overall: { type: Number, required: true, min: 1, max: 5 },
      workLifeBalance: { type: Number, min: 1, max: 5 },
      salary: { type: Number, min: 1, max: 5 },
      careerGrowth: { type: Number, min: 1, max: 5 },
      management: { type: Number, min: 1, max: 5 },
      culture: { type: Number, min: 1, max: 5 },
    },
    title: { type: String, trim: true, maxlength: 200 },
    pros: { type: String, trim: true, maxlength: 2000 },
    cons: { type: String, trim: true, maxlength: 2000 },
    text: { type: String, trim: true, maxlength: 5000 },
    position: { type: String, default: '' },
    employmentStatus: {
      type: String,
      enum: ['current', 'former', 'unknown'],
      default: 'unknown',
    },
    source: {
      type: String,
      enum: ['glassdoor', 'ambitionbox', 'indeed', 'trustpulse', 'google', 'other'],
      default: 'trustpulse',
    },

    // AI Analysis
    sentiment: {
      type: String,
      enum: ['positive', 'negative', 'neutral'],
      default: 'neutral',
      index: true,
    },
    sentimentScore: { type: Number, default: 0, min: -1, max: 1 },
    emotion: {
      type: String,
      enum: ['happy', 'angry', 'sad', 'neutral', 'fearful', 'disgusted', 'surprised'],
      default: 'neutral',
    },
    isFake: { type: Boolean, default: false, index: true },
    isSpam: { type: Boolean, default: false },
    isToxic: { type: Boolean, default: false },
    toxicityScore: { type: Number, default: 0, min: 0, max: 1 },
    keywords: [{ type: String }],
    aiClassification: {
      type: String,
      enum: ['genuine', 'suspicious', 'fake', 'spam', 'toxic'],
      default: 'genuine',
    },

    // Engagement
    helpfulVotes: { type: Number, default: 0 },
    reportCount: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    isVisible: { type: Boolean, default: true },

    reviewDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

reviewSchema.index({ company: 1, sentiment: 1 });
reviewSchema.index({ company: 1, 'rating.overall': -1 });
reviewSchema.index({ reviewDate: -1 });

module.exports = mongoose.model('Review', reviewSchema);
