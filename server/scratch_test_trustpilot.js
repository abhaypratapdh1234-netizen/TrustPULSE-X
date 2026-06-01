const axios = require('axios');

async function testScrapeTrustpilot(domain = 'google.com') {
  console.log(`🔍 Testing AllOrigins proxy Trustpilot Scraper for domain: ${domain}...`);
  // AllOrigins free proxy
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://www.trustpilot.com/review/${domain}`)}`;
  
  try {
    const response = await axios.get(proxyUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
      },
      timeout: 15000
    });

    const html = response.data;
    const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
    
    if (!match || !match[1]) {
      console.log('❌ Could not find __NEXT_DATA__ script tag in HTML response.');
      return;
    }

    const parsedData = JSON.parse(match[1].trim());
    const reviewsData = parsedData.props?.pageProps?.reviews || [];

    console.log(`✅ Success! Found ${reviewsData.length} reviews inside __NEXT_DATA__.`);
    
    if (reviewsData.length > 0) {
      console.log('\n--- 📝 FIRST 3 REAL REVIEWS FROM THE WEB ---');
      reviewsData.slice(0, 3).forEach((r, i) => {
        console.log(`\n[Review #${i+1}]`);
        console.log(`👤 Author: ${r.consumer?.displayName || 'Anonymous'} (${r.consumer?.countryCode || 'N/A'})`);
        console.log(`⭐ Rating: ${r.rating} stars`);
        console.log(`✍️ Title: ${r.title}`);
        console.log(`💬 Text: ${r.text ? r.text.substring(0, 150) + '...' : '(No text body)'}`);
        console.log(`📅 Date: ${r.dates?.publishedDate}`);
      });
    }
  } catch (error) {
    console.error('❌ Scraper test failed with error:', error.message);
  }
}

testScrapeTrustpilot();
