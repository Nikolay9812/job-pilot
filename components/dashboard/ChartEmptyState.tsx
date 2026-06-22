"use client";

type ChartEmptyStateProps = {
  message: string;
};

export function ChartEmptyState({ message }: ChartEmptyStateProps) {
  return (
    <div className="mt-8 flex min-h-[280px] items-center justify-center rounded-lg border border-border bg-surface-secondary px-6 py-12 text-center">
      <p className="max-w-sm text-sm font-medium leading-5 text-text-secondary">{message}</p>
    </div>
  );
}
