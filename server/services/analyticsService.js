const Company = require('../models/Company');
const Review = require('../models/Review');
const Analytics = require('../models/Analytics');
const { analyzeSentiment, calculateTrustScore, detectFakeReview, detectToxicity } = require('./aiService');

// Recompute aggregated company stats from reviews
async function recomputeCompanyStats(companyId) {
  const reviews = await Review.find({ company: companyId, isVisible: true });

  if (reviews.length === 0) return;

  const fields = ['overall', 'workLifeBalance', 'salary', 'careerGrowth', 'management', 'culture'];
  const sums = {};
  const counts = {};
  fields.forEach((f) => { sums[f] = 0; counts[f] = 0; });

  let positiveCount = 0, negativeCount = 0, neutralCount = 0, fakeCount = 0;
  const allKeywords = {};

  reviews.forEach((r) => {
    fields.forEach((f) => {
      if (r.rating[f]) { sums[f] += r.rating[f]; counts[f]++; }
    });
    if (r.sentiment === 'positive') positiveCount++;
    else if (r.sentiment === 'negative') negativeCount++;
    else neutralCount++;
    if (r.isFake) fakeCount++;
    r.keywords?.forEach((kw) => { allKeywords[kw] = (allKeywords[kw] || 0) + 1; });
  });

  const avgRatings = {};
  fields.forEach((f) => { avgRatings[f] = counts[f] ? parseFloat((sums[f] / counts[f]).toFixed(2)) : 0; });

  const total = reviews.length;
  const sentimentScore = (positiveCount - negativeCount) / total;
  const fakePercent = fakeCount / total;

  const trustScore = calculateTrustScore({
    rating: avgRatings.overall,
    reviewCount: total,
    sentimentScore,
    fakePercent: fakePercent * 100,
    trendScore: 50,
  });

  const topKeywords = Object.entries(allKeywords)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([kw]) => kw);

  await Company.findByIdAndUpdate(companyId, {
    'ratings.overall': avgRatings.overall,
    'ratings.workLifeBalance': avgRatings.workLifeBalance,
    'ratings.salary': avgRatings.salary,
    'ratings.careerGrowth': avgRatings.careerGrowth,
    'ratings.management': avgRatings.management,
    'ratings.culture': avgRatings.culture,
    reviewCount: total,
    sentimentScore: parseFloat(sentimentScore.toFixed(3)),
    positiveSentimentPercent: parseFloat(((positiveCount / total) * 100).toFixed(1)),
    negativeSentimentPercent: parseFloat(((negativeCount / total) * 100).toFixed(1)),
    neutralSentimentPercent: parseFloat(((neutralCount / total) * 100).toFixed(1)),
    fakeReviewPercent: parseFloat((fakePercent * 100).toFixed(1)),
    trustScore,
    keywords: topKeywords,
  });
}

// Get trend data for chart (last N days)
async function getCompanyTrendData(companyId, days = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const analytics = await Analytics.find({
    company: companyId,
    date: { $gte: since },
    period: 'daily',
  }).sort({ date: 1 });

  // Fill missing days with interpolated data
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    const found = analytics.find(
      (a) => a.date.toISOString().split('T')[0] === dateStr
    );

    result.push({
      date: dateStr,
      avgRating: found?.avgRating || null,
      reviewCount: found?.reviewCount || 0,
      sentimentScore: found?.sentimentScore || null,
      trustScore: found?.trustScore || null,
    });
  }

  // Forward fill nulls
  let lastRating = 0, lastSentiment = 0, lastTrust = 0;
  result.forEach((d) => {
    if (d.avgRating !== null) lastRating = d.avgRating;
    else d.avgRating = lastRating;
    if (d.sentimentScore !== null) lastSentiment = d.sentimentScore;
    else d.sentimentScore = lastSentiment;
    if (d.trustScore !== null) lastTrust = d.trustScore;
    else d.trustScore = lastTrust;
  });

  return result;
}

// Snapshot today's analytics for a company
async function snapshotAnalytics(companyId) {
  const company = await Company.findById(companyId);
  if (!company) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const reviews = await Review.find({
    company: companyId,
    createdAt: { $gte: today },
  });

  await Analytics.findOneAndUpdate(
    { company: companyId, date: today, period: 'daily' },
    {
      avgRating: company.ratings.overall,
      reviewCount: company.reviewCount,
      newReviews: reviews.length,
      positiveCount: reviews.filter((r) => r.sentiment === 'positive').length,
      negativeCount: reviews.filter((r) => r.sentiment === 'negative').length,
      neutralCount: reviews.filter((r) => r.sentiment === 'neutral').length,
      sentimentScore: company.sentimentScore,
      trustScore: company.trustScore,
      trendScore: company.trendScore,
      fakeReviewCount: reviews.filter((r) => r.isFake).length,
    },
    { upsert: true, new: true }
  );
}

// Get platform-wide stats
async function getPlatformStats() {
  const [totalCompanies, totalReviews, avgRatingResult, topIndustries] = await Promise.all([
    Company.countDocuments({ isActive: true }),
    Review.countDocuments({ isVisible: true }),
    Review.aggregate([{ $group: { _id: null, avg: { $avg: '$rating.overall' } } }]),
    Company.aggregate([
      { $group: { _id: '$industry', count: { $sum: 1 }, avgRating: { $avg: '$ratings.overall' } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]),
  ]);

  return {
    totalCompanies,
    totalReviews,
    avgRating: parseFloat((avgRatingResult[0]?.avg || 0).toFixed(2)),
    topIndustries,
  };
}

module.exports = { recomputeCompanyStats, getCompanyTrendData, snapshotAnalytics, getPlatformStats };
