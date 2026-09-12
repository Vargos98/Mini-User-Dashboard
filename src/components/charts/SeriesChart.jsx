import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import { ChartTooltip } from './ChartTooltip';
import { seriesMotion } from './theme';

const margin = { top: 4, right: 8, left: -12, bottom: 0 };

export const SeriesChart = ({ data, series, type = 'bar', yTickFormatter }) => {
  const { theme } = useTheme();
  const axis = theme === 'light' ? '#71717a' : '#a1a1aa';
  const grid = theme === 'light' ? '#e4e4e7' : '#1f1f27';
  const extras = [
    <CartesianGrid key="grid" stroke={grid} vertical={false} />,
    <XAxis key="x" dataKey="label" stroke={axis} fontSize={12} tickLine={false} axisLine={false} />,
    <YAxis
      key="y"
      stroke={axis}
      fontSize={12}
      tickLine={false}
      axisLine={false}
      allowDecimals={false}
      tickFormatter={yTickFormatter}
      width={52}
    />,
    <Tooltip
      key="tip"
      cursor={{ fill: theme === 'light' ? 'rgba(24,24,27,0.04)' : 'rgba(255,255,255,0.04)' }}
      wrapperStyle={{ zIndex: 40, outline: 'none' }}
      content={<ChartTooltip formatter={yTickFormatter ? (value, name) => [yTickFormatter(value), name] : undefined} />}
    />,
    <Legend key="legend" />,
  ];

  if (type === 'line') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={margin}>
          {extras}
          {series.map((item) => (
            <Line
              key={item.key}
              type="monotone"
              dataKey={item.key}
              name={item.name || item.key}
              stroke={item.fill}
              strokeWidth={2}
              dot={false}
              {...seriesMotion()}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'area') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={margin}>
          {extras}
          {series.map((item) => (
            <Area
              key={item.key}
              type="monotone"
              dataKey={item.key}
              name={item.name || item.key}
              stackId="stack"
              stroke={item.fill}
              fill={item.fill}
              fillOpacity={0.35}
              {...seriesMotion()}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={margin}>
        {extras}
        {series.map((item, index) => (
          <Bar
            key={item.key}
            dataKey={item.key}
            name={item.name || item.key}
            stackId="stack"
            fill={item.fill}
            maxBarSize={32}
            {...seriesMotion()}
            radius={index === series.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};
