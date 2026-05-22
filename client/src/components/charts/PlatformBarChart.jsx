import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';

const PLATFORM_COLORS = {
  Google: '#ea4335',
  Glassdoor: '#0caa41',
  Indeed: '#2164f3',
  Trustpilot: '#00b67a',
  G2: '#ff492c',
  Yelp: '#d32323',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="glass-card-static border px-4 py-3"
        style={{ borderColor: 'var(--glass-border)' }}>
        <p className="text-sm font-bold text-white mb-1">{label}</p>
        <p className="text-xs text-slate-400">
          Rating: <span className="text-blue-400 font-bold">{payload[0].value?.toFixed(1)}/5.0</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function PlatformBarChart({ data }) {
  if (!data) return null;

  const chartData = Object.entries(data)
    .filter(([, v]) => v > 0)
    .map(([platform, rating]) => ({
      platform,
      rating: Math.round(rating * 10) / 10,
      fill: PLATFORM_COLORS[platform] || '#3b82f6',
    }));

  return (
    <div className="w-full h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis
            dataKey="platform"
            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 5]}
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="rating" radius={[6, 6, 0, 0]} maxBarSize={48}>
            {chartData.map((entry) => (
              <Cell key={entry.platform} fill={entry.fill} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
