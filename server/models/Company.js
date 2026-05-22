const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    logo: { type: String, default: '' },
    website: { type: String, default: '' },
    description: { type: String, default: '' },
    industry: {
      type: String,
      enum: [
        'IT', 'Finance', 'Healthcare', 'Startup', 'Product', 'Service', 
        'Remote', 'Manufacturing', 'Retail', 'Education', 'Other',
        'Technology', 'E-Commerce', 'Automotive', 'IT Services', 'Fintech', 'Social Media'
      ],
      default: 'IT',
      index: true,
    },
    size: {
      type: String,
      enum: ['1-50', '51-200', '201-500', '501-1000', '1000+'],
      default: '201-500',
    },
    location: {
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      country: { type: String, default: 'India' },
    },
    founded: { type: Number },
    tags: [{ type: String }],

    // Aggregated ratings
    ratings: {
      overall: { type: Number, default: 0, min: 0, max: 5 },
      workLifeBalance: { type: Number, default: 0, min: 0, max: 5 },
      salary: { type: Number, default: 0, min: 0, max: 5 },
      careerGrowth: { type: Number, default: 0, min: 0, max: 5 },
      management: { type: Number, default: 0, min: 0, max: 5 },
      culture: { type: Number, default: 0, min: 0, max: 5 },
    },
    reviewCount: { type: Number, default: 0, index: true },

    // AI Scores
    trustScore: { type: Number, default: 0, min: 0, max: 100 },
    sentimentScore: { type: Number, default: 0, min: -1, max: 1 },
    positiveSentimentPercent: { type: Number, default: 0 },
    negativeSentimentPercent: { type: Number, default: 0 },
    neutralSentimentPercent: { type: Number, default: 0 },
    fakeReviewPercent: { type: Number, default: 0 },

    // Trend
    trendScore: { type: Number, default: 0, index: true },
    trendDirection: { type: String, enum: ['up', 'down', 'stable'], default: 'stable' },
    weeklyGrowth: { type: Number, default: 0 },
    monthlyGrowth: { type: Number, default: 0 },

    // Common topics
    pros: [{ type: String }],
    cons: [{ type: String }],
    keywords: [{ type: String }],
    aiSummary: { type: String, default: '' },

    isTrending: { type: Boolean, default: false, index: true },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Text index for search
companySchema.index({ name: 'text', description: 'text', tags: 'text' });
companySchema.index({ 'ratings.overall': -1 });
companySchema.index({ trustScore: -1 });

// Slug generation
companySchema.pre('validate', function (next) {
  if (this.name && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

module.exports = mongoose.model('Company', companySchema);
