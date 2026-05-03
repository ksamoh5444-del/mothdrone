/**
 * TelemetrySparkline.tsx
 * ─────────────────────────────────────────────────────────────────
 * Animated sparkline for live telemetry data visualization.
 */

interface TelemetrySparklineProps {
  data: number[];
  min?: number;
  max?: number;
  color?: string;
  height?: number;
}

export default function TelemetrySparkline({
  data,
  min = 0,
  max = 100,
  color = '#0d9488',
  height = 24,
}: TelemetrySparklineProps) {
  const width = data.length * 4;
  const padding = 2;
  const graphHeight = height - padding * 2;

  const points = data
    .map((value, idx) => {
      const x = padding + idx * 4;
      const normalized = (value - min) / (max - min);
      const y = padding + graphHeight - normalized * graphHeight;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg
      width={width}
      height={height}
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        animation: 'pulse-dot 2s infinite',
      }}
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
        opacity="0.8"
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="0.5"
        vectorEffect="non-scaling-stroke"
        opacity="0.3"
      />
    </svg>
  );
}
