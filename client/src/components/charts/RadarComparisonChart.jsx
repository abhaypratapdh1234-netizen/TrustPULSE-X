import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip, Legend
} from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div className="glass-card-static border px-4 py-3"
        style={{ borderColor: 'var(--glass-border)' }}>
        <p className="text-xs font-bold text-white mb-1">{payload[0]?.payload?.metric}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-xs" style={{ color: p.color }}>
            {p.name}: {p.value?.toFixed(1)}/5
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function RadarComparisonChart({ companies }) {
  if (!companies?.length) return null;

  const metrics = [
    { key: 'workLifeBalance', label: 'Work-Life' },
    { key: 'salaryBenefits', label: 'Salary' },
    { key: 'careerGrowth', label: 'Growth' },
    { key: 'management', label: 'Management' },
    { key: 'culture', label: 'Culture' },
    { key: 'diversityInclusion', label: 'Diversity' },
  ];

  const data = metrics.map(({ key, label }) => {
    const entry = { metric: label };
    companies.forEach(c => {
      entry[c.name] = c[key] || c.overallRating || 3.5;
    });
    return entry;
  });

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
          <PolarGrid stroke="rgba(255,255,255,0.08)" />
          <PolarAngleAxis
            dataKey="metric"
            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 5]}
            tick={{ fill: '#475569', fontSize: 9 }}
            tickCount={4}
          />
          {companies.map((company, i) => (
            <Radar
              key={company.name}
              name={company.name}
              dataKey={company.name}
              stroke={COLORS[i % COLORS.length]}
              fill={COLORS[i % COLORS.length]}
              fillOpacity={0.15}
              strokeWidth={2}
            />
          ))}
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => (
              <span className="text-xs font-medium" style={{ color: '#94a3b8' }}>{value}</span>
            )}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
