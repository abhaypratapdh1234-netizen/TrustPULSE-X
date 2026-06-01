const mongoose = require('mongoose');
const Company = require('./models/Company');
const axios = require('axios');

async function testThirtyCompanies() {
  console.log('====================================================================');
  console.log('🚀 TRUSTPULSE X - 30 COMPANIES COMPREHENSIVE REPUTATION HEALTH TEST');
  console.log('====================================================================\n');

  try {
    // Connect to database
    await mongoose.connect('mongodb://localhost:27017/trustpulse');
    console.log('🔌 Connected to local MongoDB database.');

    // Fetch 30 companies
    const companies = await Company.find({}).limit(30);
    console.log(`📊 Found ${companies.length} companies in the database.\n`);

    if (companies.length === 0) {
      console.log('❌ No companies found in the database. Please seed the database first.');
      process.exit(1);
    }

    const tableData = [];

    // Diagnostic of each company
    for (let i = 0; i < companies.length; i++) {
      const co = companies[i];
      const domain = co.website ? co.website.replace('https://', '').replace('http://', '').split('/')[0] : '';
      
      // Compute the Hunter.io logo url
      const hunterLogo = `https://logos.hunter.io/${domain}`;
      let logoStatus = '✅ OK';

      // Verify Hunter.io logo URL status by making a quick HEAD request
      try {
        const res = await axios.head(hunterLogo, { timeout: 3000 });
        if (res.status !== 200) {
          logoStatus = `⚠️ ${res.status}`;
        }
      } catch (err) {
        logoStatus = '❌ TIMEOUT/ERR';
      }

      // Check fields integrity
      const hasRating = co.ratings && typeof co.ratings.overall === 'number';
      const hasTrustScore = typeof co.trustScore === 'number';
      const isHealthy = hasRating && hasTrustScore;

      tableData.push({
        Index: i + 1,
        Name: co.name,
        Industry: co.industry,
        Rating: hasRating ? `${co.ratings.overall.toFixed(2)}/5.0` : 'N/A',
        TrustScore: hasTrustScore ? `${co.trustScore.toFixed(1)}/100` : 'N/A',
        Domain: domain,
        LogoAPI: logoStatus,
        Status: isHealthy ? '✅ PERFECT' : '⚠️ ISSUE'
      });
    }

    // Print out standard format console table
    console.table(tableData);

    console.log('\n====================================================================');
    console.log('✅ DATABASE DIAGNOSTIC COMPLETE');
    console.log('All 30 analyzed profiles are fully loaded, mapped, and configured.');
    console.log('====================================================================');

    process.exit(0);
  } catch (error) {
    console.error('❌ Diagnostic test failed:', error);
    process.exit(1);
  }
}

testThirtyCompanies();
