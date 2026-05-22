const axios = require('axios');

async function testWikipedia() {
  try {
    const category = 'Category:Financial_technology_companies';
    const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&list=categorymembers&cmtitle=${encodeURIComponent(category)}&cmlimit=10`;
    console.log('Fetching from Wikipedia:', wikiUrl);
    const headers = {
      'User-Agent': 'TrustPulseSentimentAnalytics/1.0 (contact@trustpulse.com)'
    };
    const wikiRes = await axios.get(wikiUrl, { headers });
    const members = wikiRes.data?.query?.categorymembers || [];
    console.log('Wikipedia Members found:', members.length);
    for (const member of members.slice(0, 3)) {
      console.log(' - Member Title:', member.title);
      // Clean name
      let cleanName = member.title.replace(/\s*\(.*?\)\s*/g, '').trim();
      console.log('   Cleaned Name:', cleanName);
      
      // Test Clearbit
      const clearbitUrl = `https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(cleanName)}`;
      console.log('   Fetching Clearbit:', clearbitUrl);
      try {
        const clearbitRes = await axios.get(clearbitUrl, { headers, timeout: 5000 });
        const suggest = clearbitRes.data;
        if (suggest && suggest.length > 0) {
          console.log('   Clearbit response:', suggest[0]);
        } else {
          console.log('   No Clearbit suggestions');
        }
      } catch (err) {
        console.error('   Clearbit error:', err.message);
      }
    }
  } catch (error) {
    console.error('Wikipedia error:', error.message);
  }
}

testWikipedia();
