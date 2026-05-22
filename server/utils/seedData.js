require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Company = require('../models/Company');
const Review = require('../models/Review');
const Analytics = require('../models/Analytics');
const User = require('../models/User');
const { analyzeSentiment, detectFakeReview, calculateTrustScore } = require('../services/aiService');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/trustpulse';

const companies = [
  {
    name: 'Google', slug: 'google', industry: 'IT', size: '1000+', founded: 1998,
    logo: 'https://logo.clearbit.com/google.com', website: 'https://google.com',
    description: 'Global technology leader in search, cloud computing, and AI.',
    location: { city: 'Mountain View', state: 'CA', country: 'USA' },
    tags: ['AI', 'Cloud', 'Search', 'Tech Giant'],
    pros: ['Excellent benefits', 'World-class learning', 'Strong culture', 'Great pay', 'Work from anywhere'],
    cons: ['Highly competitive', 'Slow promotions', 'Large bureaucracy', 'High stress'],
  },
  {
    name: 'Microsoft', slug: 'microsoft', industry: 'IT', size: '1000+', founded: 1975,
    logo: 'https://logo.clearbit.com/microsoft.com', website: 'https://microsoft.com',
    description: 'Leading software and cloud services company.',
    location: { city: 'Redmond', state: 'WA', country: 'USA' },
    tags: ['Cloud', 'Software', 'AI', 'Enterprise'],
    pros: ['Amazing work-life balance', 'Generous pay', 'Great manager quality', 'Remote work'],
    cons: ['Internal politics', 'Slow decision making', 'Bureaucracy'],
  },
  {
    name: 'Amazon', slug: 'amazon', industry: 'IT', size: '1000+', founded: 1994,
    logo: 'https://logo.clearbit.com/amazon.com', website: 'https://amazon.com',
    description: 'Global e-commerce and cloud services giant.',
    location: { city: 'Seattle', state: 'WA', country: 'USA' },
    tags: ['Cloud', 'E-Commerce', 'AWS', 'Logistics'],
    pros: ['Career growth', 'High comp', 'Learning culture', 'Scale of impact'],
    cons: ['Work-life balance issues', 'High attrition', 'Intense culture', 'Bar raiser pressure'],
  },
  {
    name: 'Infosys', slug: 'infosys', industry: 'IT', size: '1000+', founded: 1981,
    logo: 'https://logo.clearbit.com/infosys.com', website: 'https://infosys.com',
    description: 'Leading Indian IT services and consulting company.',
    location: { city: 'Bengaluru', state: 'Karnataka', country: 'India' },
    tags: ['IT Services', 'Consulting', 'Outsourcing'],
    pros: ['Job security', 'Good training', 'Work-life balance', 'Brand value'],
    cons: ['Low salary hikes', 'Slow growth', 'Technology gaps', 'Politics'],
  },
  {
    name: 'TCS', slug: 'tcs', industry: 'IT', size: '1000+', founded: 1968,
    logo: 'https://logo.clearbit.com/tcs.com', website: 'https://tcs.com',
    description: 'Tata Consultancy Services — India\'s largest IT company.',
    location: { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
    tags: ['IT Services', 'Consulting', 'Digital'],
    pros: ['Stability', 'Learning programs', 'Brand recognition', 'Global exposure'],
    cons: ['Salary below market', 'Slow promotions', 'Outdated tech stack', 'Bench periods'],
  },
  {
    name: 'Razorpay', slug: 'razorpay', industry: 'Startup', size: '501-1000', founded: 2014,
    logo: 'https://logo.clearbit.com/razorpay.com', website: 'https://razorpay.com',
    description: 'India\'s leading fintech startup for payment solutions.',
    location: { city: 'Bengaluru', state: 'Karnataka', country: 'India' },
    tags: ['Fintech', 'Payments', 'Startup', 'SaaS'],
    pros: ['Fast growth', 'Great culture', 'Good comp', 'Ownership', 'Innovative'],
    cons: ['High pressure', 'Long hours', 'Rapidly changing priorities'],
  },
  {
    name: 'Wipro', slug: 'wipro', industry: 'IT', size: '1000+', founded: 1945,
    logo: 'https://logo.clearbit.com/wipro.com', website: 'https://wipro.com',
    description: 'Global IT consulting and services company.',
    location: { city: 'Bengaluru', state: 'Karnataka', country: 'India' },
    tags: ['IT Services', 'Consulting', 'BPO'],
    pros: ['Work-life balance', 'Flexible hours', 'Learning'],
    cons: ['Low pay', 'Slow growth', 'Variable project quality', 'Bench policy'],
  },
  {
    name: 'Zomato', slug: 'zomato', industry: 'Startup', size: '1000+', founded: 2008,
    logo: 'https://logo.clearbit.com/zomato.com', website: 'https://zomato.com',
    description: 'India\'s largest food delivery and restaurant discovery platform.',
    location: { city: 'Gurugram', state: 'Haryana', country: 'India' },
    tags: ['FoodTech', 'Startup', 'E-Commerce'],
    pros: ['Dynamic environment', 'Good perks', 'Passionate team'],
    cons: ['Work-life balance issues', 'High attrition', 'Process chaos'],
  },
  {
    name: 'Adobe', slug: 'adobe', industry: 'Product', size: '1000+', founded: 1982,
    logo: 'https://logo.clearbit.com/adobe.com', website: 'https://adobe.com',
    description: 'Creative software and digital experience company.',
    location: { city: 'San Jose', state: 'CA', country: 'USA' },
    tags: ['SaaS', 'Creative', 'Cloud', 'Design'],
    pros: ['Excellent culture', 'Great benefits', 'Work-life balance', 'Innovation'],
    cons: ['Slow decision making', 'Bureaucracy at scale'],
  },
  {
    name: 'PhonePe', slug: 'phonepe', industry: 'Startup', size: '1000+', founded: 2015,
    logo: 'https://logo.clearbit.com/phonepe.com', website: 'https://phonepe.com',
    description: 'India\'s leading digital payments platform.',
    location: { city: 'Bengaluru', state: 'Karnataka', country: 'India' },
    tags: ['Fintech', 'Payments', 'Digital'],
    pros: ['Fast career growth', 'Good comp', 'Impactful work'],
    cons: ['High pressure', 'Work-life balance', 'Rapid changes'],
  },
];

const reviewTemplates = {
  positive: [
    { title: 'Great place to work', pros: 'Excellent culture, learning opportunities, supportive management', cons: 'Sometimes the pace can be fast', rating: 4.5 },
    { title: 'Amazing growth opportunity', pros: 'Incredible learning environment, great colleagues, innovative projects', cons: 'Work-life balance could be better', rating: 4 },
    { title: 'Highly recommend', pros: 'Fantastic benefits, collaborative team, good salary', cons: 'Slightly bureaucratic at times', rating: 4.5 },
    { title: 'Best job experience', pros: 'Excellent compensation, world-class projects, amazing team', cons: 'Competition is high', rating: 5 },
  ],
  negative: [
    { title: 'Not what I expected', pros: 'Job security is decent', cons: 'Toxic management, poor work-life balance, very stressful', rating: 1.5 },
    { title: 'Disappointing culture', pros: 'Brand value', cons: 'Micromanagement, politics everywhere, underpaid significantly', rating: 2 },
    { title: 'High stress, low reward', pros: 'Learning opportunities', cons: 'Overworked, terrible management, no career growth', rating: 1 },
  ],
  neutral: [
    { title: 'Average experience', pros: 'Stable job, decent perks', cons: 'Not much growth, processes are slow', rating: 3 },
    { title: 'It has its pros and cons', pros: 'Good team culture in some departments', cons: 'Inconsistent management across teams', rating: 3 },
  ],
};

function generateReviews(companyId, count = 20) {
  const reviews = [];
  const types = ['positive', 'positive', 'positive', 'neutral', 'negative'];
  const positions = ['Software Engineer', 'Senior Developer', 'Product Manager', 'Data Analyst', 'DevOps Engineer', 'UX Designer', 'Team Lead'];
  const statuses = ['current', 'former'];

  for (let i = 0; i < count; i++) {
    const type = types[i % types.length];
    const template = reviewTemplates[type][Math.floor(Math.random() * reviewTemplates[type].length)];
    const fullText = `${template.pros} ${template.cons}`;
    const sentimentResult = analyzeSentiment(fullText);
    const fakeResult = detectFakeReview({ rating: { overall: template.rating }, pros: template.pros, cons: template.cons });

    const reviewDate = new Date();
    reviewDate.setDate(reviewDate.getDate() - Math.floor(Math.random() * 365));

    const sources = ['google', 'glassdoor', 'indeed', 'trustpulse'];
    reviews.push({
      company: companyId,
      authorName: ['Anonymous', 'Current Employee', 'Former Employee'][Math.floor(Math.random() * 3)],
      rating: {
        overall: template.rating,
        workLifeBalance: Math.max(1, Math.min(5, template.rating + (Math.random() - 0.5))),
        salary: Math.max(1, Math.min(5, template.rating + (Math.random() - 0.5))),
        careerGrowth: Math.max(1, Math.min(5, template.rating + (Math.random() - 0.5))),
        management: Math.max(1, Math.min(5, template.rating + (Math.random() - 0.5))),
        culture: Math.max(1, Math.min(5, template.rating + (Math.random() - 0.5))),
      },
      title: template.title,
      pros: template.pros,
      cons: template.cons,
      position: positions[Math.floor(Math.random() * positions.length)],
      employmentStatus: statuses[Math.floor(Math.random() * statuses.length)],
      sentiment: sentimentResult.sentiment,
      sentimentScore: sentimentResult.score,
      emotion: sentimentResult.emotion,
      keywords: sentimentResult.keywords,
      isFake: fakeResult.isFake,
      isSpam: false,
      isToxic: false,
      toxicityScore: 0,
      aiClassification: fakeResult.isFake ? 'suspicious' : 'genuine',
      source: sources[i % sources.length],
      helpfulVotes: Math.floor(Math.random() * 50),
      reviewDate,
      isVisible: true,
    });
  }
  return reviews;
}

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      Company.deleteMany({}),
      Review.deleteMany({}),
      Analytics.deleteMany({}),
      User.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    // Seed companies
    const createdCompanies = await Company.insertMany(companies.map(c => ({
      ...c,
      ratings: { overall: 0, workLifeBalance: 0, salary: 0, careerGrowth: 0, management: 0, culture: 0 },
    })));
    console.log(`✅ Seeded ${createdCompanies.length} companies`);

    // Seed reviews for each company
    for (const company of createdCompanies) {
      const reviewCount = 15 + Math.floor(Math.random() * 20);
      const reviewData = generateReviews(company._id, reviewCount);
      const reviews = await Review.insertMany(reviewData);

      // Compute aggregated stats
      const fields = ['overall', 'workLifeBalance', 'salary', 'careerGrowth', 'management', 'culture'];
      const sums = {}; const counts = {};
      fields.forEach(f => { sums[f] = 0; counts[f] = 0; });
      let pos = 0, neg = 0, neu = 0, fakeCount = 0;

      reviews.forEach(r => {
        fields.forEach(f => { if (r.rating[f]) { sums[f] += r.rating[f]; counts[f]++; } });
        if (r.sentiment === 'positive') pos++;
        else if (r.sentiment === 'negative') neg++;
        else neu++;
        if (r.isFake) fakeCount++;
      });

      const avgRatings = {};
      fields.forEach(f => { avgRatings[f] = counts[f] ? parseFloat((sums[f] / counts[f]).toFixed(2)) : 3.5; });

      const total = reviews.length;
      const sentimentScore = (pos - neg) / total;
      const fakePercent = (fakeCount / total) * 100;
      const trustScore = calculateTrustScore({ rating: avgRatings.overall, reviewCount: total, sentimentScore, fakePercent, trendScore: 50 + Math.random() * 50 });
      const trendScore = 30 + Math.random() * 70;

      await Company.findByIdAndUpdate(company._id, {
        'ratings.overall': avgRatings.overall,
        'ratings.workLifeBalance': avgRatings.workLifeBalance,
        'ratings.salary': avgRatings.salary,
        'ratings.careerGrowth': avgRatings.careerGrowth,
        'ratings.management': avgRatings.management,
        'ratings.culture': avgRatings.culture,
        reviewCount: total,
        sentimentScore: parseFloat(sentimentScore.toFixed(3)),
        positiveSentimentPercent: parseFloat(((pos / total) * 100).toFixed(1)),
        negativeSentimentPercent: parseFloat(((neg / total) * 100).toFixed(1)),
        neutralSentimentPercent: parseFloat(((neu / total) * 100).toFixed(1)),
        fakeReviewPercent: parseFloat(fakePercent.toFixed(1)),
        trustScore,
        trendScore: parseFloat(trendScore.toFixed(1)),
        trendDirection: trendScore > 65 ? 'up' : trendScore > 40 ? 'stable' : 'down',
        weeklyGrowth: parseFloat((Math.random() * 10 - 3).toFixed(1)),
        isTrending: trendScore > 60,
      });

      // Seed analytics (last 30 days)
      const analyticsData = [];
      for (let d = 29; d >= 0; d--) {
        const date = new Date(); date.setDate(date.getDate() - d); date.setHours(0, 0, 0, 0);
        analyticsData.push({
          company: company._id, date, period: 'daily',
          avgRating: parseFloat((avgRatings.overall + (Math.random() - 0.5) * 0.5).toFixed(2)),
          reviewCount: total,
          newReviews: Math.floor(Math.random() * 3),
          positiveCount: pos, negativeCount: neg, neutralCount: neu,
          sentimentScore: parseFloat(sentimentScore.toFixed(3)),
          trustScore: parseFloat(trustScore.toFixed(1)),
          trendScore: parseFloat(trendScore.toFixed(1)),
        });
      }
      await Analytics.insertMany(analyticsData);

      console.log(`  📊 ${company.name}: ${total} reviews, rating ${avgRatings.overall?.toFixed(1)}, trust ${trustScore?.toFixed(0)}`);
    }

    // Create demo user
    const demoUser = await User.create({
      name: 'Demo User',
      email: 'demo@trustpulse.ai',
      password: 'Demo@123456',
      emailVerified: true,
      role: 'user',
    });
    console.log(`\n✅ Demo user created: demo@trustpulse.ai / Demo@123456`);
    console.log('\n🎉 Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
