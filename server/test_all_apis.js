const axios = require('axios');
require('dotenv').config();

async function checkWikipedia() {
  const wikiUrl = 'https://en.wikipedia.org/w/api.php?action=query&format=json&list=categorymembers&cmtitle=Category:Technology_companies_of_the_United_States&cmlimit=5';
  const headers = { 'User-Agent': 'TrustPulseSentimentAnalytics/1.0 (contact@trustpulse.com)' };
  try {
    const res = await axios.get(wikiUrl, { headers, timeout: 5000 });
    const success = res.data && res.data.query && res.data.query.categorymembers;
    console.log(`[WIKIPEDIA API] -> ${success ? '✅ WORKING' : '❌ FAILED'} (Status: ${res.status})`);
    return success;
  } catch (err) {
    console.log(`[WIKIPEDIA API] -> ❌ FAILED (${err.message})`);
    return false;
  }
}

async function checkClearbitSuggest() {
  const url = 'https://autocomplete.clearbit.com/v1/companies/suggest?query=Google';
  try {
    const res = await axios.get(url, { timeout: 5000 });
    const success = Array.isArray(res.data) && res.data.length > 0;
    console.log(`[CLEARBIT AUTOCOMPLETE] -> ${success ? '✅ WORKING' : '❌ FAILED'} (Status: ${res.status})`);
    return success;
  } catch (err) {
    console.log(`[CLEARBIT AUTOCOMPLETE] -> ❌ FAILED (${err.message})`);
    return false;
  }
}

async function checkClearbitLogo() {
  const url = 'https://logo.clearbit.com/google.com';
  try {
    const res = await axios.head(url, { timeout: 5000 });
    const success = res.status === 200;
    console.log(`[CLEARBIT LOGO API] -> ${success ? '✅ WORKING' : '❌ FAILED'} (Status: ${res.status})`);
    return success;
  } catch (err) {
    console.log(`[CLEARBIT LOGO API] -> ❌ FAILED (${err.message})`);
    return false;
  }
}

async function checkFinnhub() {
  const key = process.env.FINNHUB_API_KEY || 'cv4m0t1r01qgl8g0u48gcv4m0t1r01qgl8g0u490';
  const url = `https://finnhub.io/api/v1/stock/profile2?symbol=AAPL&token=${key}`;
  try {
    const res = await axios.get(url, { timeout: 5000 });
    console.log(`[FINNHUB API] -> ✅ WORKING (Status: ${res.status})`);
    return true;
  } catch (err) {
    console.log(`[FINNHUB API] -> ❌ FAILED (Status: ${err.response?.status || 'N/A'}, Error: ${err.message})`);
    return false;
  }
}

async function checkOpenAI() {
  const key = process.env.OPENAI_API_KEY;
  if (!key || key.includes('your_openai_key')) {
    console.log('[OPENAI API] -> ⚠️ SKIPPED (No API key found in server/.env)');
    return false;
  }
  try {
    const res = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 5
      },
      {
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      }
    );
    console.log(`[OPENAI API] -> ✅ WORKING (Status: ${res.status})`);
    return true;
  } catch (err) {
    console.log(`[OPENAI API] -> ❌ FAILED (Status: ${err.response?.status || 'N/A'}, Error: ${err.message})`);
    return false;
  }
}

async function runAll() {
  console.log('=== STARTING EXTERNAL API DIAGNOSTIC ===');
  await checkWikipedia();
  await checkClearbitSuggest();
  await checkClearbitLogo();
  await checkFinnhub();
  await checkOpenAI();
  console.log('========================================');
}

runAll();
