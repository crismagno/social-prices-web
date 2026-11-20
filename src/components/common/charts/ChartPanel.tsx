import { ReactNode } from "react";

interface Props {
  title: ReactNode;
  value?: ReactNode;
  caption?: ReactNode;
  extra?: ReactNode;
  className?: string;
  children?: ReactNode;
}

export const ChartPanel: React.FC<Props> = ({
  title,
  value,
  caption,
  extra,
  className = "",
  children,
}) => (
  <div
    className={`h-full rounded-xl border p-4
      border-gray-200 dark:border-gray-700 ${className}`}
  >
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="text-sm truncate text-gray-500 dark:text-gray-400">
          {title}
        </div>

        {value !== undefined && (
          <div
            className="mt-1 text-2xl font-semibold leading-tight
              text-slate-800 dark:text-white"
          >
            {value}
          </div>
        )}

        {caption && (
          <div className="mt-0.5 text-xs text-gray-400">{caption}</div>
        )}
      </div>

      {extra && <div className="shrink-0">{extra}</div>}
    </div>

    <div className="mt-4">{children}</div>
  </div>
);
