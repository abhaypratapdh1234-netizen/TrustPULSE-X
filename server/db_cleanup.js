const mongoose = require('mongoose');
const Company = require('./models/Company');
const Review = require('./models/Review');
const Analytics = require('./models/Analytics');

async function cleanup() {
  await mongoose.connect('mongodb://localhost:27017/trustpulse');
  console.log('Connected to DB');

  // Show current state
  const before = await Company.aggregate([{ $group: { _id: '$industry', count: { $sum: 1 } } }]);
  console.log('\n📊 BEFORE cleanup:');
  before.forEach(b => console.log(`  ${b._id}: ${b.count} companies`));

  // Get company IDs to delete their reviews/analytics too
  const companyIds = (await Company.find({}, '_id')).map(c => c._id);

  // Clear everything — let the warm-up reseed with correct industry names
  const delCompanies = await Company.deleteMany({});
  const delReviews = await Review.deleteMany({});
  const delAnalytics = await Analytics.deleteMany({});

  console.log(`\n🗑️  Deleted ${delCompanies.deletedCount} companies`);
  console.log(`🗑️  Deleted ${delReviews.deletedCount} reviews`);
  console.log(`🗑️  Deleted ${delAnalytics.deletedCount} analytics records`);
  console.log('\n✅ DB cleaned. The warm-up will reseed all 8 industries on next API call.');
  
  process.exit(0);
}

cleanup().catch(err => {
  console.error('❌ Cleanup failed:', err);
  process.exit(1);
});
