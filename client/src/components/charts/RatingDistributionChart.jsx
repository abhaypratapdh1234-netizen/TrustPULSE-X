import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const COLORS = {
  5: '#10b981',
  4: '#3b82f6',
  3: '#f59e0b',
  2: '#f97316',
  1: '#ef4444',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="glass-card-static border px-4 py-3"
        style={{ borderColor: 'var(--glass-border)' }}>
        <p className="text-sm font-bold text-white">{label} Stars</p>
        <p className="text-xs text-slate-400">{payload[0].value} reviews</p>
      </div>
    );
  }
  return null;
};

export default function RatingDistributionChart({ distribution }) {
  if (!distribution) return null;

  const data = [5, 4, 3, 2, 1].map(star => ({
    star: `${star}★`,
    count: distribution[star] || 0,
    color: COLORS[star],
  }));

  const total = data.reduce((s, d) => s + d.count, 0) || 1;

  return (
    <div className="space-y-2">
      {[5, 4, 3, 2, 1].map(star => {
        const count = distribution[star] || 0;
        const pct = ((count / total) * 100).toFixed(0);
        return (
          <div key={star} className="flex items-center gap-3">
            <span className="text-xs text-slate-400 w-10 text-right font-medium">{star}★</span>
            <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${pct}%`,
                  background: COLORS[star],
                }}
              />
            </div>
            <span className="text-xs text-slate-500 w-8">{pct}%</span>
          </div>
        );
      })}
    </div>
  );
}
