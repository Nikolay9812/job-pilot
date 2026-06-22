const bars = [
  { day: "Mon", value: 2 },
  { day: "Tue", value: 5 },
  { day: "Wed", value: 3 },
  { day: "Thu", value: 8 },
  { day: "Fri", value: 12 },
  { day: "Sat", value: 4 },
  { day: "Sun", value: 1 },
];

const chartHeight = 240;
const chartTop = 24;
const chartLeft = 54;
const chartWidth = 610;
const maxValue = 12;
const barWidth = 44;
const slotWidth = chartWidth / bars.length;

export function CompanyResearchChart() {
  return (
    <section className="rounded-xl border border-border bg-surface p-6 shadow-card">
      <h2 className="text-xl font-semibold leading-7 text-text-primary">
        Company Research Activity
      </h2>
      <svg
        viewBox="0 0 720 330"
        role="img"
        aria-label="Mock company research activity by weekday"
        className="mt-10 h-[330px] w-full"
      >
        {[12, 9, 6, 3, 0].map((tick) => {
          const y = chartTop + chartHeight - (tick / maxValue) * chartHeight;

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
          const barHeight = (bar.value / maxValue) * chartHeight;
          const x = chartLeft + index * slotWidth + (slotWidth - barWidth) / 2;
          const y = chartTop + chartHeight - barHeight;

          return (
            <g key={bar.day}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx="4"
                fill="var(--color-info)"
              />
              <text
                x={x + barWidth / 2}
                y={chartTop + chartHeight + 34}
                textAnchor="middle"
                className="fill-chart-axis text-xs font-medium"
              >
                {bar.day}
              </text>
            </g>
          );
        })}
      </svg>
    </section>
  );
}
