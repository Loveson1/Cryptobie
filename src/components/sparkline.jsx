import { LineChart, Line, ResponsiveContainer, YAxis, CartesianGrid } from 'recharts';

export default function Sparkline({ data, isPositive }) {
  if (!data || data.length === 0) {
    return <span>N/A</span>;
  }

  // Convert array of prices to objects for recharts
  const chartData = data.map((price) => ({
    value: price,
  }));

  // Get min and max for better scaling
  const prices = chartData.map(d => d.value);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const padding = (maxPrice - minPrice) * 0.1; // Add 10% padding

  return (
    <ResponsiveContainer width="140%" height={60}>
      <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
        <CartesianGrid height={0} />
        <YAxis 
          domain={[minPrice - padding, maxPrice + padding]} 
          width={0}
          hide
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={isPositive ? '#10b981' : '#ef4444'}
          dot={false}
          strokeWidth={1}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
