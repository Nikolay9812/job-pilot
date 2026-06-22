const bars = [
  { label: "50-60%", value: 5 },
  { label: "60-70%", value: 15 },
  { label: "70-80%", value: 45 },
  { label: "80-90%", value: 85 },
  { label: "90-100%", value: 35 },
];

const chartHeight = 250;
const chartTop = 24;
const chartLeft = 54;
const chartWidth = 330;
const barWidth = 34;
const slotWidth = chartWidth / bars.length;

export function MatchScoreChart() {
  return (
    <section className="rounded-xl border border-border bg-surface p-6 shadow-card">
      <h2 className="text-xl font-semibold leading-7 text-text-primary">Match Score Distribution</h2>
      <svg
        viewBox="0 0 440 340"
        role="img"
        aria-label="Mock match score distribution by percentage range"
        className="mt-8 h-[340px] w-full"
      >
        {[100, 75, 50, 25, 0].map((tick) => {
          const y = chartTop + chartHeight - (tick / 100) * chartHeight;

          return (
            <g key={tick}>
              <line
                x1={chartLeft}
                x2={chartLeft + chartWidth}
                y1={y}
                y2={y}
                stroke="var(--color-border)"
                strokeDasharray="4 4"
              />
              <text
                x={chartLeft - 10}
                y={y + 5}
                textAnchor="end"
                className="fill-chart-axis text-xs font-normal"
              >
                {tick}
              </text>
            </g>
          );
        })}

        {bars.map((bar, index) => {
          const barHeight = (bar.value / 100) * chartHeight;
          const x = chartLeft + index * slotWidth + (slotWidth - barWidth) / 2;
          const y = chartTop + chartHeight - barHeight;

          return (
            <g key={bar.label}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx="4"
                fill="var(--color-success)"
              />
              <text
                x={x + barWidth / 2}
                y={chartTop + chartHeight + 34}
                textAnchor="middle"
                className="fill-chart-axis text-xs font-medium"
              >
                {bar.label}
              </text>
            </g>
          );
        })}
      </svg>
    </section>
  );
}
