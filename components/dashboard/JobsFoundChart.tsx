const chartHeight = 250;
const chartTop = 24;
const chartLeft = 48;
const chartWidth = 840;
const chartBottom = chartTop + chartHeight;

const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function JobsFoundChart() {
  return (
    <section className="rounded-xl border border-border bg-surface p-6 shadow-card">
      <h2 className="text-xl font-semibold leading-7 text-text-primary">Jobs Found Over Time</h2>
      <svg
        viewBox="0 0 940 340"
        role="img"
        aria-label="Mock jobs found over time by weekday"
        className="mt-8 h-[340px] w-full"
      >
        <defs>
          <linearGradient id="jobs-found-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--color-accent-light)" stopOpacity="0.85" />
            <stop offset="100%" stopColor="var(--color-accent-light)" stopOpacity="0" />
          </linearGradient>
        </defs>

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

        <path
          d={`M ${chartLeft} 244 C 96 200, 134 158, 188 144 S 294 160, 334 172 S 426 150, 488 100 S 584 54, 624 72 S 714 168, 770 198 S 848 246, 888 250 L 888 ${chartBottom} L ${chartLeft} ${chartBottom} Z`}
          fill="url(#jobs-found-fill)"
        />
        <path
          d={`M ${chartLeft} 244 C 96 200, 134 158, 188 144 S 294 160, 334 172 S 426 150, 488 100 S 584 54, 624 72 S 714 168, 770 198 S 848 246, 888 250`}
          fill="none"
          stroke="var(--color-accent)"
          strokeLinecap="round"
          strokeWidth="3"
        />

        {labels.map((label, index) => {
          const x = chartLeft + (chartWidth / (labels.length - 1)) * index;

          return (
            <text
              key={label}
              x={x}
              y={chartBottom + 34}
              textAnchor="middle"
              className="fill-chart-axis text-xs font-medium"
            >
              {label}
            </text>
          );
        })}
      </svg>
    </section>
  );
}
