import { useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartTooltip } from './ChartTooltip';
import { seriesMotion } from './theme';

export const MixChart = ({ data, type = 'donut', centerLabel, centerHint }) => {
  const inner = type === 'pie' ? 0 : 68;
  const slices = data.filter((item) => item.value > 0);
  const [tipPos, setTipPos] = useState({ x: 0, y: 0 });

  if (slices.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-fg-subtle">
        No case results in this slice
      </div>
    );
  }

  return (
    <div
      className="relative h-full"
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setTipPos({
          x: event.clientX - rect.left + 16,
          y: event.clientY - rect.top - 8,
        });
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={slices}
            dataKey="value"
            nameKey="name"
            innerRadius={inner}
            outerRadius={100}
            paddingAngle={slices.length > 1 ? 2 : 0}
            stroke="none"
            {...seriesMotion()}
          >
            {slices.map((item) => (
              <Cell key={item.name} fill={item.fill} />
            ))}
          </Pie>
          <Tooltip
            cursor={false}
            allowEscapeViewBox={{ x: true, y: true }}
            position={tipPos}
            wrapperStyle={{ zIndex: 40, outline: 'none', pointerEvents: 'none' }}
            content={<ChartTooltip />}
          />
        </PieChart>
      </ResponsiveContainer>
      {type === 'donut' ? (
        <div className="pointer-events-none absolute inset-0 z-0 flex flex-col items-center justify-center">
          <p className="text-2xl font-semibold text-fg">{centerLabel}</p>
          <p className="text-xs uppercase tracking-[0.14em] text-fg-subtle">{centerHint}</p>
        </div>
      ) : null}
      <ul className="pointer-events-none absolute bottom-0 left-0 z-0 flex flex-wrap gap-3 text-xs text-fg-muted">
        {data.map((item) => (
          <li key={item.name} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: item.fill }} />
            {item.name} {item.value}
          </li>
        ))}
      </ul>
    </div>
  );
};
