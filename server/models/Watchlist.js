const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    companies: [
      {
        company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
        addedAt: { type: Date, default: Date.now },
        note: { type: String, default: '' },
        alertsEnabled: { type: Boolean, default: true },
        lastTrustScore: { type: Number, default: 0 },
        lastRating: { type: Number, default: 0 },
      },
    ],
    name: { type: String, default: 'My Watchlist' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Watchlist', watchlistSchema);
