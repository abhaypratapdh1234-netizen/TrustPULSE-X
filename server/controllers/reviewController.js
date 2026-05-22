const Review = require('../models/Review');
const Company = require('../models/Company');
const { analyzeSentiment, detectFakeReview, detectToxicity } = require('../services/aiService');
const { recomputeCompanyStats } = require('../services/analyticsService');

// @desc    Get reviews for a company
// @route   GET /api/reviews/:companySlug
exports.getReviews = async (req, res, next) => {
  try {
    const { companySlug } = req.params;
    const { sentiment, sort = 'newest', page = 1, limit = 10, minRating, maxRating } = req.query;

    const company = await Company.findOne({ slug: companySlug });
    if (!company) return res.status(404).json({ success: false, message: 'Company not found.' });

    const filter = { company: company._id, isVisible: true };
    if (sentiment) filter.sentiment = sentiment;
    if (minRating) filter['rating.overall'] = { $gte: parseFloat(minRating) };
    if (maxRating) filter['rating.overall'] = { ...filter['rating.overall'], $lte: parseFloat(maxRating) };

    const sortMap = {
      newest: { reviewDate: -1 },
      oldest: { reviewDate: 1 },
      helpful: { helpfulVotes: -1 },
      highest: { 'rating.overall': -1 },
      lowest: { 'rating.overall': 1 },
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [reviews, total] = await Promise.all([
      Review.find(filter).sort(sortMap[sort] || sortMap.newest).skip(skip).limit(parseInt(limit)),
      Review.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: reviews,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

exports.createReview = async (req, res, next) => {
  try {
    const {
      companySlug,
      companyName,
      rating,
      title,
      pros,
      cons,
      text,
      position,
      employmentStatus,
      platform,
      source,
      workLifeBalance,
      salaryBenefits,
      salary,
      careerGrowth,
      management,
      culture
    } = req.body;

    // Resolve company robustly
    let company = null;
    if (companySlug) {
      company = await Company.findOne({ slug: companySlug });
    }
    if (!company && companyName) {
      company = await Company.findOne({ name: companyName });
      if (!company) {
        const slugified = companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        company = await Company.findOne({ slug: slugified });
      }
      if (!company) {
        company = await Company.findOne({ name: { $regex: new RegExp('^' + companyName + '$', 'i') } });
      }
    }

    if (!company) return res.status(404).json({ success: false, message: 'Company not found.' });

    // Build nested rating object robustly
    let ratingObj = {};
    if (typeof rating === 'object' && rating !== null) {
      ratingObj = {
        overall: rating.overall || 4,
        workLifeBalance: rating.workLifeBalance || rating.workLife || 4,
        salary: rating.salary || rating.salaryBenefits || 4,
        careerGrowth: rating.careerGrowth || 4,
        management: rating.management || 4,
        culture: rating.culture || 4,
      };
    } else {
      const overallVal = Number(rating) || 4;
      ratingObj = {
        overall: overallVal,
        workLifeBalance: Number(workLifeBalance) || 4,
        salary: Number(salary || salaryBenefits) || 4,
        careerGrowth: Number(careerGrowth) || 4,
        management: Number(management) || 4,
        culture: Number(culture) || 4,
      };
    }

    // Dynamic source mapping
    let resolvedSource = 'trustpulse';
    const inputSource = (platform || source || 'trustpulse').toString().toLowerCase();
    if (inputSource === 'glassdoor') resolvedSource = 'glassdoor';
    else if (inputSource === 'indeed') resolvedSource = 'indeed';
    else if (inputSource === 'google') resolvedSource = 'google';
    else if (inputSource === 'ambitionbox') resolvedSource = 'ambitionbox';
    else if (inputSource === 'trustpilot' || inputSource === 'trustpulse') resolvedSource = 'trustpulse';
    else if (inputSource === 'other') resolvedSource = 'other';

    // AI Analysis
    const fullText = `${title || ''} ${pros || ''} ${cons || ''} ${text || ''}`;
    const sentimentResult = analyzeSentiment(fullText, ratingObj.overall);
    const fakeResult = detectFakeReview({ rating: ratingObj, title, pros, cons, text });
    const toxicityResult = detectToxicity(fullText);

    const review = await Review.create({
      company: company._id,
      author: req.user?._id || null,
      authorName: req.user?.name || 'Anonymous',
      rating: ratingObj,
      title,
      pros,
      cons,
      text,
      position,
      employmentStatus,
      sentiment: sentimentResult.sentiment,
      sentimentScore: sentimentResult.score,
      emotion: sentimentResult.emotion,
      keywords: sentimentResult.keywords,
      isFake: fakeResult.isFake,
      isSpam: false,
      isToxic: toxicityResult.isToxic,
      toxicityScore: toxicityResult.toxicityScore,
      aiClassification: fakeResult.isFake ? 'suspicious' : toxicityResult.isToxic ? 'toxic' : 'genuine',
      source: resolvedSource,
    });

    // Recompute company stats asynchronously
    recomputeCompanyStats(company._id).catch(console.error);

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark review as helpful
// @route   POST /api/reviews/:id/helpful
exports.markHelpful = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { $inc: { helpfulVotes: 1 } },
      { new: true }
    );
    if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });
    res.json({ success: true, helpfulVotes: review.helpfulVotes });
  } catch (error) {
    next(error);
  }
};

// @desc    Report a review
// @route   POST /api/reviews/:id/report
exports.reportReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { $inc: { reportCount: 1 } },
      { new: true }
    );
    if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });

    if (review.reportCount >= 5) {
      review.isVisible = false;
      await review.save();
    }

    res.json({ success: true, message: 'Review reported.' });
  } catch (error) {
    next(error);
  }
};
