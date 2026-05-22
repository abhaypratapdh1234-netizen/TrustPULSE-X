/**
 * Data Service — Generates realistic company review data
 * In a production system, this would integrate with Glassdoor API,
 * Google Places API, Trustpilot API etc.
 */

const COMPANIES_DB = {
  default: {
    industry: 'Technology',
    location: 'San Francisco, CA',
    size: '1,000–5,000 employees',
    founded: '2010',
    description: 'A leading technology company focused on innovation and digital transformation.',
  },
  google: { industry: 'Technology', location: 'Mountain View, CA', size: '100,000+ employees', founded: '1998', description: 'Multinational technology company specializing in internet services and products.' },
  microsoft: { industry: 'Technology', location: 'Redmond, WA', size: '100,000+ employees', founded: '1975', description: 'Multinational technology corporation producing computer software, electronics, and personal computers.' },
  amazon: { industry: 'E-Commerce / Cloud', location: 'Seattle, WA', size: '100,000+ employees', founded: '1994', description: 'Multinational technology company focusing on e-commerce, cloud computing, and AI.' },
  apple: { industry: 'Consumer Electronics', location: 'Cupertino, CA', size: '100,000+ employees', founded: '1976', description: 'Multinational technology company designing consumer electronics, software, and services.' },
  meta: { industry: 'Social Media / Technology', location: 'Menlo Park, CA', size: '50,000–100,000 employees', founded: '2004', description: 'Technology company focusing on social media, virtual reality, and online advertising.' },
  netflix: { industry: 'Entertainment / Technology', location: 'Los Gatos, CA', size: '10,000–50,000 employees', founded: '1997', description: 'Streaming entertainment company offering TV series, films, and documentaries.' },
  tesla: { industry: 'Automotive / Clean Energy', location: 'Austin, TX', size: '50,000–100,000 employees', founded: '2003', description: 'Electric vehicle and clean energy company.' },
  salesforce: { industry: 'CRM / Cloud Software', location: 'San Francisco, CA', size: '50,000–100,000 employees', founded: '1999', description: 'Cloud-based software company specializing in CRM solutions.' },
  infosys: { industry: 'IT Services', location: 'Bengaluru, India', size: '100,000+ employees', founded: '1981', description: 'Global IT services and consulting company.' },
  tcs: { industry: 'IT Services', location: 'Mumbai, India', size: '100,000+ employees', founded: '1968', description: 'IT services and consulting company, subsidiary of Tata Group.' },
  wipro: { industry: 'IT Services', location: 'Bengaluru, India', size: '100,000+ employees', founded: '1945', description: 'Information technology and consulting company.' },
};

const REVIEW_TEMPLATES = [
  { title: 'Great place to work', text: 'The work environment is amazing. Great team culture and collaborative spirit. Management is supportive and transparent. Highly recommend for anyone looking for growth opportunities.', base: 4.5 },
  { title: 'Excellent career growth', text: 'Excellent learning opportunities and career growth. The company invests in employee development. Work-life balance could be improved but overall a fantastic place.', base: 4.3 },
  { title: 'Good company with some issues', text: 'The company has great benefits and salary packages. However, the management style can be micromanaging at times. The team is friendly and professional though.', base: 3.5 },
  { title: 'Toxic work culture', text: 'Terrible management and toxic work culture. Long hours with no compensation. Poor work-life balance and high employee turnover. Would not recommend.', base: 1.5 },
  { title: 'Average experience', text: 'Neither great nor terrible. Decent salary and okay benefits. Nothing special to write home about. Work is standard and routine. Management is average.', base: 3.0 },
  { title: 'Best employer I have worked for', text: 'Outstanding company with amazing culture. The leadership team is transparent and genuinely cares about employee well being. Flexible work arrangements and excellent compensation packages.', base: 5.0 },
  { title: 'Disappointing experience', text: 'Was very excited to join but the reality was disappointing. Poor leadership and disorganized teams. Promises made during hiring were not kept. Looking for new opportunities.', base: 2.0 },
  { title: 'Solid employer with room for growth', text: 'Good overall experience. The company is growing fast which brings both opportunities and challenges. Benefits are competitive and the team is talented. Communication from leadership could improve.', base: 3.8 },
  { title: 'Innovation-driven workplace', text: 'Love working here! The company truly values innovation and creative thinking. Every team member feels empowered to contribute ideas. The collaborative culture makes work exciting and rewarding.', base: 4.7 },
  { title: 'Mixed feelings', text: 'The work itself is interesting and the technical challenges are great. However, the politics and bureaucracy can be frustrating. Salary is competitive but benefits could be better.', base: 3.2 },
  { title: 'Great tech stack and smart colleagues', text: 'Working with brilliant engineers on cutting-edge technology. Learning something new every day. The company encourages experimentation and does not punish failure. Remote work policy is excellent.', base: 4.4 },
  { title: 'Poor management ruined it', text: 'The company had so much potential but poor management decisions have led to high turnover. Talented people keep leaving. The culture has deteriorated significantly over the past year.', base: 2.2 },
  { title: 'Highly recommend this employer', text: 'One of the best decisions I made was joining this company. Incredible team, great mission, and real work-life balance. The CEO is approachable and the values are genuinely lived.', base: 4.8 },
  { title: 'Underpaid and overworked', text: 'Constantly expected to work overtime with no compensation. Management talks about culture but actions do not match. Salary is below market rate. Will be leaving soon.', base: 1.8 },
  { title: 'Fast-growing with challenges', text: 'Exciting time to be at this company as it scales rapidly. There are growing pains and processes are not always smooth, but the opportunity is real. Good compensation and equity.', base: 3.9 },
];

const PLATFORMS = ['Google', 'Glassdoor', 'Indeed', 'Trustpilot'];
const AUTHORS = [
  'Software Engineer','Senior Developer','Product Manager','Data Scientist','DevOps Engineer',
  'UX Designer','Marketing Manager','Sales Executive','HR Specialist','Business Analyst',
  'Team Lead','VP Engineering','QA Engineer','Full Stack Developer','Cloud Architect',
  'Anonymous','Current Employee','Former Employee','Verified Employee','Senior Manager',
];

function generateReviews(companyName, count = 40) {
  const reviews = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const template = REVIEW_TEMPLATES[i % REVIEW_TEMPLATES.length];
    const platform = PLATFORMS[i % PLATFORMS.length];
    const ratingVariance = (Math.sin(i * 0.7) * 0.8);
    const rating = Math.max(1, Math.min(5, Math.round((template.base + ratingVariance) * 2) / 2));

    const daysAgo = Math.floor(i * 7.3 + Math.abs(Math.sin(i) * 30));
    const reviewDate = new Date(now);
    reviewDate.setDate(reviewDate.getDate() - daysAgo);

    reviews.push({
      author: AUTHORS[i % AUTHORS.length],
      rating,
      title: template.title,
      text: template.text + (i % 3 === 0 ? ` This has been my experience at ${companyName} for the past ${Math.floor(i/4)+1} years.` : ''),
      platform,
      date: reviewDate.toISOString().split('T')[0],
      helpful: Math.floor(Math.abs(Math.sin(i * 1.3)) * 40),
      isVerified: i % 3 !== 0,
    });
  }

  return reviews;
}

function getCompanyInfo(companyName) {
  const key = companyName.toLowerCase().replace(/\s+/g, '');
  return COMPANIES_DB[key] || {
    ...COMPANIES_DB.default,
    description: `${companyName} is a leading company in its industry, known for innovation and excellence.`,
  };
}

function generateTrendingCompanies() {
  const companies = [
    { name: 'Google', rating: 4.4, reviews: 92847, trend: 'rising', industry: 'Technology', trustScore: 88 },
    { name: 'Microsoft', rating: 4.3, reviews: 78234, trend: 'rising', industry: 'Technology', trustScore: 85 },
    { name: 'Apple', rating: 4.2, reviews: 65123, trend: 'stable', industry: 'Consumer Electronics', trustScore: 82 },
    { name: 'Netflix', rating: 4.1, reviews: 34521, trend: 'declining', industry: 'Entertainment', trustScore: 79 },
    { name: 'Tesla', rating: 3.9, reviews: 28943, trend: 'rising', industry: 'Automotive', trustScore: 72 },
    { name: 'Amazon', rating: 3.7, reviews: 112456, trend: 'stable', industry: 'E-Commerce', trustScore: 70 },
    { name: 'Meta', rating: 3.8, reviews: 45678, trend: 'declining', industry: 'Social Media', trustScore: 68 },
    { name: 'Salesforce', rating: 4.3, reviews: 23456, trend: 'rising', industry: 'Cloud Software', trustScore: 84 },
    { name: 'Infosys', rating: 3.8, reviews: 56789, trend: 'stable', industry: 'IT Services', trustScore: 71 },
    { name: 'TCS', rating: 3.9, reviews: 89012, trend: 'rising', industry: 'IT Services', trustScore: 73 },
    { name: 'Wipro', rating: 3.6, reviews: 43210, trend: 'stable', industry: 'IT Services', trustScore: 66 },
    { name: 'Stripe', rating: 4.5, reviews: 12345, trend: 'rising', industry: 'Fintech', trustScore: 91 },
  ];
  return companies;
}

module.exports = { generateReviews, getCompanyInfo, generateTrendingCompanies };
