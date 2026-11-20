import { ReactNode } from "react";

export interface IChartTooltipRow {
  label: string;
  value: ReactNode;
  color?: string;
}

interface Props {
  title?: ReactNode;
  rows: IChartTooltipRow[];
}

export const ChartTooltip: React.FC<Props> = ({ title, rows }) => (
  <div
    className="min-w-40 rounded-lg border px-3 py-2 text-xs shadow-lg
      bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-700"
  >
    {title && (
      <div className="mb-1 font-semibold text-slate-800 dark:text-white">
        {title}
      </div>
    )}

    {rows.map((row: IChartTooltipRow, index: number) => (
      <div
        key={`${index}-${row.label}`}
        className="flex items-center justify-between gap-4 py-0.5"
      >
        <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
          {row.color && (
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ backgroundColor: row.color }}
            />
          )}
          {row.label}
        </span>

        <span className="font-medium tabular-nums text-slate-800 dark:text-white">
          {row.value}
        </span>
      </div>
    ))}
  </div>
);
