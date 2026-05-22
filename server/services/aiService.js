/**
 * AI Service — TrustPULSE
 * Provides sentiment analysis, trust scoring, fake review detection,
 * AI summaries, and chatbot responses. Uses mock AI when OpenAI key is absent.
 */

const logger = require('../utils/logger');

// ─── Sentiment Analysis ──────────────────────────────────────────────────────
const POSITIVE_WORDS = new Set([
  'excellent','amazing','great','good','wonderful','fantastic','outstanding','best',
  'love','awesome','superb','happy','satisfied','recommend','positive','perfect',
  'brilliant','incredible','exceptional','helpful','professional','efficient','innovative',
  'growth','learning','culture','flexible','transparent','supportive','collaborative',
]);
const NEGATIVE_WORDS = new Set([
  'terrible','awful','horrible','bad','poor','worst','hate','disappointed','disappointing',
  'toxic','negative','useless','waste','unprofessional','unfair','pathetic','frustrating',
  'micromanagement','politics','favoritism','underpaid','stressful','overworked','burnout',
  'chaotic','disorganized','poor management','no growth','backstabbing','insecure',
]);

function analyzeSentiment(text, rating = null) {
  if (!text) return { sentiment: 'neutral', score: 0, emotion: 'neutral', keywords: [] };
  
  const words = text.toLowerCase().split(/\W+/);
  let positiveCount = 0;
  let negativeCount = 0;
  const keywords = [];

  words.forEach((word) => {
    if (POSITIVE_WORDS.has(word)) { positiveCount++; keywords.push(word); }
    if (NEGATIVE_WORDS.has(word)) { negativeCount++; keywords.push(word); }
  });

  const total = positiveCount + negativeCount;
  let score = 0;
  let sentiment = 'neutral';
  let emotion = 'neutral';

  if (total > 0) {
    score = (positiveCount - negativeCount) / Math.max(total, 1);
    score = Math.max(-1, Math.min(1, score));
  }

  // Adjust score if rating is provided to align visual cues with user intent
  if (rating !== null) {
    const numericRating = Number(rating);
    if (numericRating <= 2) {
      score = Math.min(-0.3, score - 0.5); // Force negative/neutral category
    } else if (numericRating >= 4) {
      score = Math.max(0.3, score + 0.5); // Force positive category
    }
    score = Math.max(-1, Math.min(1, score)); // Ensure strictly clamped between -1 and 1
  }

  if (score > 0.2) { sentiment = 'positive'; emotion = score > 0.6 ? 'happy' : 'neutral'; }
  else if (score < -0.2) { sentiment = 'negative'; emotion = score < -0.6 ? 'angry' : 'sad'; }

  return { sentiment, score: parseFloat(score.toFixed(3)), emotion, keywords: [...new Set(keywords)] };
}

// ─── Trust Score ─────────────────────────────────────────────────────────────
function calculateTrustScore({ rating, reviewCount, sentimentScore, fakePercent, trendScore }) {
  const ratingNorm = ((rating || 0) / 5) * 35;
  const reviewNorm = Math.min(reviewCount / 500, 1) * 20;
  const sentimentNorm = ((sentimentScore || 0) + 1) / 2 * 25;
  const fakeDeduction = (fakePercent || 0) * 0.15;
  const trendBonus = Math.min((trendScore || 0) / 100, 1) * 10;

  const raw = ratingNorm + reviewNorm + sentimentNorm - fakeDeduction + trendBonus;
  return Math.min(100, Math.max(0, parseFloat(raw.toFixed(1))));
}

// ─── Fake Review Detection ────────────────────────────────────────────────────
function detectFakeReview(review) {
  let suspicionScore = 0;
  const reasons = [];

  const text = `${review.title || ''} ${review.pros || ''} ${review.cons || ''} ${review.text || ''}`;
  const wordCount = text.split(/\s+/).length;

  if (wordCount < 10) { suspicionScore += 20; reasons.push('Very short review'); }
  if (/(.)\1{4,}/.test(text)) { suspicionScore += 25; reasons.push('Repeated characters'); }
  if (/[A-Z]{5,}/.test(text)) { suspicionScore += 10; reasons.push('Excessive caps'); }
  if (review.rating?.overall === 5 && !review.cons) { suspicionScore += 15; reasons.push('Perfect rating, no cons'); }
  if (review.rating?.overall === 1 && !review.pros) { suspicionScore += 15; reasons.push('1-star, no pros'); }
  if (/\b(buy|click|visit|website|promo|offer|discount)\b/i.test(text)) {
    suspicionScore += 40; reasons.push('Promotional language');
  }

  const isFake = suspicionScore >= 40;
  const score = Math.min(1, suspicionScore / 100);
  return { isFake, score: parseFloat(score.toFixed(2)), reasons };
}

// ─── Toxicity Detection ───────────────────────────────────────────────────────
const TOXIC_PATTERNS = [
  /\b(idiot|stupid|dumb|loser|scam|fraud|liar|cheat)\b/i,
  /\b(f[u\*]ck|sh[i\*]t|b[i\*]tch|a[s\*]{2})\b/i,
];

function detectToxicity(text) {
  let toxicityScore = 0;
  TOXIC_PATTERNS.forEach((pattern) => {
    if (pattern.test(text)) toxicityScore += 0.4;
  });
  toxicityScore = Math.min(1, toxicityScore);
  return { isToxic: toxicityScore > 0.5, toxicityScore: parseFloat(toxicityScore.toFixed(2)) };
}

// ─── AI Summary Generation ────────────────────────────────────────────────────
async function generateAISummary(company, reviews) {
  if (process.env.OPENAI_API_KEY) {
    try {
      return await generateOpenAISummary(company, reviews);
    } catch (err) {
      logger.warn(`OpenAI failed, falling back to mock: ${err.message}`);
    }
  }
  return generateMockSummary(company, reviews);
}

function generateMockSummary(company, reviews) {
  const rating = company.ratings?.overall || 0;
  const positivePercent = company.positiveSentimentPercent || 0;
  const negativePercent = company.negativeSentimentPercent || 0;
  const industry = company.industry || 'IT';

  const pros = company.pros?.slice(0, 3) || ['Good work culture', 'Learning opportunities', 'Competitive salary'];
  const cons = company.cons?.slice(0, 3) || ['Work-life balance needs improvement', 'Management communication gaps'];

  const ratingDesc = rating >= 4 ? 'highly regarded' : rating >= 3 ? 'moderately rated' : 'receiving mixed feedback';

  return `${company.name} is a ${ratingDesc} ${industry} company with an overall rating of ${rating.toFixed(1)}/5.0 based on ${company.reviewCount || 0} employee reviews.

**Sentiment Overview:** ${positivePercent.toFixed(0)}% of reviews are positive, ${negativePercent.toFixed(0)}% are negative, reflecting ${positivePercent > 60 ? 'a generally satisfied' : positivePercent > 40 ? 'a mixed' : 'a predominantly dissatisfied'} workforce.

**Key Strengths:** ${pros.join(', ')}.

**Common Concerns:** ${cons.join(', ')}.

**AI Trust Score: ${company.trustScore}/100** — ${company.trustScore > 75 ? 'This company demonstrates high credibility and authentic review patterns.' : company.trustScore > 50 ? 'Moderate trust level with room for improvement.' : 'Caution advised — review patterns show some inconsistencies.'}

*This summary is AI-generated based on aggregated review analysis.*`;
}

async function generateOpenAISummary(company, reviews) {
  const axios = require('axios');
  const reviewSample = reviews.slice(0, 10).map((r) => `Rating: ${r.rating.overall}/5 — ${r.pros || ''} ${r.cons || ''}`).join('\n');

  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are an AI analyst specializing in company reputation analysis. Be concise, professional, and data-driven.' },
        { role: 'user', content: `Analyze ${company.name} (${company.industry}) with rating ${company.ratings.overall}/5 based on these reviews:\n${reviewSample}\n\nWrite a professional 200-word summary covering strengths, concerns, and recommendations.` },
      ],
      max_tokens: 400,
      temperature: 0.7,
    },
    { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' } }
  );

  return response.data.choices[0].message.content;
}

// ─── AI Chatbot ───────────────────────────────────────────────────────────────
async function getChatbotResponse(message, context) {
  if (process.env.OPENAI_API_KEY) {
    try {
      return await getOpenAIChatResponse(message, context);
    } catch (err) {
      logger.warn(`Chatbot OpenAI failed: ${err.message}`);
    }
  }
  return getMockChatResponse(message, context);
}

function getMockChatResponse(message, context) {
  const lowerMsg = message.toLowerCase();
  
  if (lowerMsg.includes('trust score') || lowerMsg.includes('trust')) {
    return "The TrustScore is an AI-calculated metric (0-100) based on review authenticity, rating consistency, sentiment analysis, and trend patterns. Scores above 75 indicate high credibility.";
  }
  if (lowerMsg.includes('sentiment')) {
    return "Sentiment analysis uses NLP to classify reviews as Positive, Negative, or Neutral. We also detect emotions like happiness, anger, or frustration to give you deeper insights.";
  }
  if (lowerMsg.includes('fake') || lowerMsg.includes('spam')) {
    return "Our AI detects fake reviews using pattern recognition, linguistic analysis, and behavioral signals. Reviews flagged as suspicious are marked and excluded from primary analytics.";
  }
  if (lowerMsg.includes('compare')) {
    return "Use the Compare feature to analyze two or more companies side-by-side. You'll see radar charts for multiple metrics, trend graphs, and an AI-generated comparison verdict.";
  }
  if (lowerMsg.includes('trend')) {
    return "Trending companies are identified by review volume spikes, rapid rating changes, and social engagement signals. The trend score updates daily based on activity patterns.";
  }
  if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
    return "Hello! I'm TrustPULSE AI Assistant 🤖. I can help you understand company ratings, sentiment analysis, trust scores, and more. What would you like to know?";
  }
  return `I can help you with company reputation analysis, trust scores, sentiment data, and review analytics. For detailed insights about ${context?.company || 'any company'}, check the analytics dashboard or ask me a specific question!`;
}

async function getOpenAIChatResponse(message, context) {
  const axios = require('axios');
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: `You are TrustPULSE AI Assistant, an expert in company reputation analysis, HR analytics, and workplace intelligence. Be helpful, concise, and professional. Context: ${JSON.stringify(context || {})}` },
        { role: 'user', content: message },
      ],
      max_tokens: 200,
      temperature: 0.8,
    },
    { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' } }
  );
  return response.data.choices[0].message.content;
}

// ─── Recommendation Engine ────────────────────────────────────────────────────
function getRecommendations(companies, userPreferences) {
  return companies
    .filter((c) => {
      if (userPreferences?.industry && c.industry !== userPreferences.industry) return false;
      if (userPreferences?.minRating && c.ratings.overall < userPreferences.minRating) return false;
      return c.trustScore > 50;
    })
    .sort((a, b) => {
      const scoreA = a.trustScore * 0.4 + a.ratings.overall * 10 * 0.3 + a.trendScore * 0.3;
      const scoreB = b.trustScore * 0.4 + b.ratings.overall * 10 * 0.3 + b.trendScore * 0.3;
      return scoreB - scoreA;
    })
    .slice(0, 10);
}

module.exports = {
  analyzeSentiment,
  calculateTrustScore,
  detectFakeReview,
  detectToxicity,
  generateAISummary,
  getChatbotResponse,
  getRecommendations,
};
