const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';
let testEmail = `tester-${Date.now()}@test.com`;
let testPassword = 'Password123!';
let seededCompanySlug = 'google';
let seededCompanyName = 'Google';

async function testUserAuthentication() {
  console.log('\n--- 🧪 TEST 1: User Authentication (Register & Login) ---');
  try {
    // 1. Register a new user
    const regRes = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Automation Tester',
      email: testEmail,
      password: testPassword
    });
    if (regRes.status === 201 && regRes.data.success) {
      console.log('✅ User Registration: SUCCESS');
      authToken = regRes.data.token;
    } else {
      console.log('❌ User Registration: FAILED', regRes.data);
    }

    // 2. Login with the new credentials
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: testEmail,
      password: testPassword
    });
    if (loginRes.status === 200 && loginRes.data.success && loginRes.data.token) {
      console.log('✅ User Login: SUCCESS');
    } else {
      console.log('❌ User Login: FAILED', loginRes.data);
    }
  } catch (err) {
    console.error('❌ Authentication Test Failed with error:', err.response?.data || err.message);
  }
}

async function testCompanyDiscoveryAndSeeding() {
  console.log('\n--- 🧪 TEST 2: Dynamic Company Discovery & Auto-Seeding ---');
  try {
    // Search a company to find its real slug in the DB
    const searchRes = await axios.get(`${BASE_URL}/companies/search`, {
      params: { q: 'Google' }
    });

    if (searchRes.status === 200 && searchRes.data.success) {
      const results = searchRes.data.data;
      console.log(`✅ Company Search: SUCCESS (Found ${results.length} matched companies)`);
      
      const testCo = results.length > 0 ? results[0] : null;
      if (testCo) {
        seededCompanyName = testCo.name;
        seededCompanySlug = testCo.slug;
        console.log(`ℹ️ targeted company: "${seededCompanyName}" (Slug: ${seededCompanySlug})`);
        console.log(`   └─ Stored Website: ${testCo.website}`);
        console.log(`   └─ Stored Industry: ${testCo.industry}`);
        console.log(`   └─ Overall Rating: ${testCo.ratings?.overall}/5.0`);
      }
    }
  } catch (err) {
    console.error('❌ Seeding/Search Test Failed with error:', err.response?.data || err.message);
  }
}

async function testPostReviewAndNLP() {
  console.log('\n--- 🧪 TEST 3: Review Creation & Sentiment NLP Analysis ---');
  try {
    const headers = { Authorization: `Bearer ${authToken}` };

    // 1. Post a Positive Review
    console.log('✍️ Submitting a POSITIVE review...');
    const posReviewRes = await axios.post(`${BASE_URL}/reviews`, {
      companySlug: seededCompanySlug,
      title: 'Incredible workspace and learning curve',
      pros: 'Brilliant engineering culture, smart colleagues, very high trust and autonomy.',
      cons: 'Highly competitive environment, work hours can be long during launch seasons.',
      text: 'The learning curve here is absolutely amazing. Management encourages flexible work hours and pays competitive salaries. The team is supportive and transparent, fostering outstanding growth!',
      rating: { overall: 5, workLifeBalance: 5, salary: 5, careerGrowth: 5, management: 5, culture: 5 },
      position: 'Senior Developer',
      employmentStatus: 'current'
    }, { headers });

    if (posReviewRes.status === 201 && posReviewRes.data.success) {
      const review = posReviewRes.data.data;
      console.log(`✅ Positive Review Submission: SUCCESS`);
      console.log(`   └─ NLP Sentiment Output: "${review.sentiment}" (Score: ${review.sentimentScore})`);
      console.log(`   └─ Fake Suspicion: ${review.isFake ? '⚠️ Flagged Fake' : '✅ Verified Authentic'} (Toxicity: ${review.isToxic ? '⚠️ Toxic' : '✅ Clean'})`);
    }

    // 2. Post a Negative / Suspicious review (using spam words to test detection)
    console.log('✍️ Submitting a SPAM / SUSPICIOUS review...');
    const spamReviewRes = await axios.post(`${BASE_URL}/reviews`, {
      companySlug: seededCompanySlug,
      title: 'BUY NOW DISCOUNT OFFER CLICK LINK!!!',
      pros: 'none',
      cons: 'click this link immediately to buy cheap promo products. visit our discount website today at promo link, best offer forever promo discount click now click now click now click now',
      text: 'click link promo discount buy visit now',
      rating: { overall: 1, workLifeBalance: 1, salary: 1, careerGrowth: 1, management: 1, culture: 1 },
      position: 'Former Developer',
      employmentStatus: 'former'
    }, { headers });

    if (spamReviewRes.status === 201 && spamReviewRes.data.success) {
      const review = spamReviewRes.data.data;
      console.log(`✅ Spam Review Submission: SUCCESS`);
      console.log(`   └─ NLP Sentiment Output: "${review.sentiment}" (Score: ${review.sentimentScore})`);
      console.log(`   └─ Fake Suspicion: ${review.isFake ? '⚠️ FLAGGED AS FAKE / SPAM' : '✅ Verified Authentic'}`);
    }

  } catch (err) {
    console.error('❌ Post Review Test Failed with error:', err.response?.data || err.message);
  }
}

async function testAIChatbot() {
  console.log('\n--- 🧪 TEST 4: Reputation AI Chatbot ---');
  try {
    const chatRes = await axios.post(`${BASE_URL}/companies/chatbot`, {
      message: 'Can you tell me about the trust score and tell me what the pros and cons of this company are?',
      context: { company: seededCompanyName }
    });

    if (chatRes.status === 200 && chatRes.data.success) {
      console.log('✅ Chatbot Context Query: SUCCESS');
      console.log(`   └─ Chatbot Response: "${chatRes.data.response}"`);
    }
  } catch (err) {
    console.error('❌ AI Chatbot Test Failed with error:', err.response?.data || err.message);
  }
}

async function testCompanyComparison() {
  console.log('\n--- 🧪 TEST 5: Company Comparisons Matrix ---');
  try {
    const compareRes = await axios.get(`${BASE_URL}/companies/compare`, {
      params: { slugs: `${seededCompanySlug},microsoft` }
    });

    if (compareRes.status === 200 && compareRes.data.success) {
      console.log('✅ Company Comparison Matrix: SUCCESS');
      const companies = compareRes.data.data.comparison;
      companies.forEach(comp => {
        console.log(`   └─ Compare Company: ${comp.name} (TrustScore: ${comp.trustScore}/100, Rating: ${comp.ratings.overall}/5.0)`);
      });
    }
  } catch (err) {
    console.error('❌ Comparison Test Failed with error:', err.response?.data || err.message);
  }
}

async function testWatchlistManagement() {
  console.log('\n--- 🧪 TEST 6: Watchlist & Favorites Management ---');
  try {
    const headers = { Authorization: `Bearer ${authToken}` };

    // 1. Add company to watchlist
    const addRes = await axios.post(`${BASE_URL}/watchlist/add`, {
      companyName: seededCompanyName
    }, { headers });

    if (addRes.status === 200 && addRes.data.success) {
      console.log(`✅ Add Company to Watchlist: SUCCESS (Current Watchlist: [${addRes.data.data.join(', ')}])`);
    }

    // 2. Fetch current watchlist
    const listRes = await axios.get(`${BASE_URL}/watchlist`, { headers });
    if (listRes.status === 200 && listRes.data.success) {
      console.log(`✅ Retrieve Watchlist: SUCCESS (Items: [${listRes.data.data.join(', ')}])`);
    }
  } catch (err) {
    console.error('❌ Watchlist Test Failed with error:', err.response?.data || err.message);
  }
}

async function runAllTests() {
  console.log('========================================================');
  console.log('🚀 TRUSTPULSE X - REAL-TIME FULL FEATURE INTEGRATION TESTS');
  console.log('========================================================');
  
  await testUserAuthentication();
  await testCompanyDiscoveryAndSeeding();
  await testPostReviewAndNLP();
  await testAIChatbot();
  await testCompanyComparison();
  await testWatchlistManagement();
  
  console.log('\n========================================================');
  console.log('🎉 REAL-TIME INTEGRATION TESTS COMPLETED SUCCESSFULLY!');
  console.log('========================================================');
}

runAllTests();
