const mongoose = require('mongoose');
const Company = require('./models/Company');

async function run() {
  await mongoose.connect('mongodb://localhost:27017/trustpulse');
  console.log('Connected to DB');
  const counts = await Company.aggregate([
    { $group: { _id: '$industry', count: { $sum: 1 } } }
  ]);
  console.log('Counts:', counts);
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
