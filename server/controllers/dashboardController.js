const Company = require('../models/Company');
const Review = require('../models/Review');
const Analytics = require('../models/Analytics');
const { getPlatformStats } = require('../services/analyticsService');

// @desc    Get dashboard overview stats
// @route   GET /api/dashboard/stats
exports.getDashboardStats = async (req, res, next) => {
  try {
    const stats = await getPlatformStats();

    const [trending, topCompany, recentReviews, sentimentBreakdown] = await Promise.all([
      Company.find({ isTrending: true }).limit(5).select('name slug logo trendScore trendDirection weeklyGrowth'),
      Company.findOne({ isActive: true }).sort({ trustScore: -1 }).select('name slug logo trustScore ratings'),
      Review.find({ isVisible: true }).sort({ createdAt: -1 }).limit(5)
        .populate('company', 'name slug logo'),
      Review.aggregate([
        { $match: { isVisible: true } },
        { $group: { _id: '$sentiment', count: { $sum: 1 } } },
      ]),
    ]);

    const sentimentMap = { positive: 0, negative: 0, neutral: 0 };
    sentimentBreakdown.forEach((s) => { sentimentMap[s._id] = s.count; });
    const totalSentiment = Object.values(sentimentMap).reduce((a, b) => a + b, 0);

    res.json({
      success: true,
      data: {
        ...stats,
        trending,
        topCompany,
        recentReviews,
        sentimentBreakdown: {
          positive: sentimentMap.positive,
          negative: sentimentMap.negative,
          neutral: sentimentMap.neutral,
          positivePercent: totalSentiment ? parseFloat(((sentimentMap.positive / totalSentiment) * 100).toFixed(1)) : 0,
          negativePercent: totalSentiment ? parseFloat(((sentimentMap.negative / totalSentiment) * 100).toFixed(1)) : 0,
          neutralPercent: totalSentiment ? parseFloat(((sentimentMap.neutral / totalSentiment) * 100).toFixed(1)) : 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get chart data for dashboard
// @route   GET /api/dashboard/charts/:companySlug
exports.getChartData = async (req, res, next) => {
  try {
    const company = await Company.findOne({ slug: req.params.companySlug });
    if (!company) return res.status(404).json({ success: false, message: 'Company not found.' });

    const days = parseInt(req.query.days) || 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [analytics, sentimentOverTime, ratingDistribution] = await Promise.all([
      Analytics.find({ company: company._id, date: { $gte: since }, period: 'daily' }).sort({ date: 1 }),
      Review.aggregate([
        { $match: { company: company._id, isVisible: true, reviewDate: { $gte: since } } },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$reviewDate' } },
              sentiment: '$sentiment',
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.date': 1 } },
      ]),
      Review.aggregate([
        { $match: { company: company._id, isVisible: true } },
        { $group: { _id: { $floor: '$rating.overall' }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    // Build heatmap data (hour of day vs day of week)
    const heatmapData = await Review.aggregate([
      { $match: { company: company._id, isVisible: true } },
      {
        $group: {
          _id: {
            hour: { $hour: '$reviewDate' },
            dayOfWeek: { $dayOfWeek: '$reviewDate' },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        timeline: analytics,
        sentimentOverTime,
        ratingDistribution: ratingDistribution.map((r) => ({ stars: r._id, count: r.count })),
        heatmap: heatmapData,
        company: {
          name: company.name,
          slug: company.slug,
          ratings: company.ratings,
          trustScore: company.trustScore,
          positiveSentimentPercent: company.positiveSentimentPercent,
          negativeSentimentPercent: company.negativeSentimentPercent,
          reviewCount: company.reviewCount,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get industry analytics
// @route   GET /api/dashboard/industry
exports.getIndustryAnalytics = async (req, res, next) => {
  try {
    const industryStats = await Company.aggregate([
      { $match: { isActive: true, reviewCount: { $gte: 1 } } },
      {
        $group: {
          _id: '$industry',
          count: { $sum: 1 },
          avgRating: { $avg: '$ratings.overall' },
          avgTrustScore: { $avg: '$trustScore' },
          totalReviews: { $sum: '$reviewCount' },
        },
      },
      { $sort: { totalReviews: -1 } },
    ]);

    res.json({ success: true, data: industryStats });
  } catch (error) {
    next(error);
  }
};
