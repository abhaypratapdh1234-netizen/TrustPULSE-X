const axios = require('axios');

const keys = [
  'cv4m0t1r01qgl8g0u48gcv4m0t1r01qgl8g0u490',
  'cv4m0t1r01qgl8g0u48g',
  'cv4m0t1r01qgl8g0u490'
];

async function testKey(key) {
  const symbol = 'AAPL';
  const url = `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${key}`;
  try {
    const res = await axios.get(url, { timeout: 3000 });
    console.log(`Key ${key} SUCCESS:`, res.data);
    return true;
  } catch (err) {
    console.log(`Key ${key} FAILED:`, err.message);
    return false;
  }
}

async function run() {
  for (const key of keys) {
    await testKey(key);
  }
}

run();
