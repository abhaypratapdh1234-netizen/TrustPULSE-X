import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const COLORS = {
  positive: '#10b981',
  negative: '#ef4444',
  neutral: '#94a3b8',
  mixed: '#f59e0b',
};

const RADIAN = Math.PI / 180;
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
      className="text-xs font-bold" fontSize={12}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    const { name, value } = payload[0];
    return (
      <div className="glass-card-static border px-4 py-3"
        style={{ borderColor: 'var(--glass-border)' }}>
        <p className="text-sm font-bold text-white capitalize">{name}</p>
        <p className="text-xs text-slate-400">{value} reviews</p>
      </div>
    );
  }
  return null;
};

export default function SentimentPieChart({ data }) {
  const chartData = [
    { name: 'positive', value: data?.positive || 0, color: COLORS.positive },
    { name: 'negative', value: data?.negative || 0, color: COLORS.negative },
    { name: 'neutral', value: data?.neutral || 0, color: COLORS.neutral },
    { name: 'mixed', value: data?.mixed || 0, color: COLORS.mixed },
  ].filter(d => d.value > 0);

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
            labelLine={false}
            label={renderCustomLabel}
          >
            {chartData.map((entry) => (
              <Cell
                key={entry.name}
                fill={entry.color}
                stroke="rgba(0,0,0,0.2)"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value) => (
              <span className="text-xs font-medium capitalize" style={{ color: '#94a3b8' }}>
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
