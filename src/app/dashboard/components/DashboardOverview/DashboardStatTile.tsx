"use client";

import { ReactNode } from "react";

import { Skeleton, Tooltip } from "antd";
import Link from "next/link";

import { ArrowRightOutlined, PlusOutlined } from "@ant-design/icons";

import { IFeatureUsage } from "../../../../shared/business/users/user-limits.interface";

export interface IDashboardStatTileCreate {
  href: string;
  tooltip: string;
  disabledTooltip?: string;
}

interface Props {
  label: string;
  count: number;
  isLoading: boolean;
  icon: ReactNode;
  iconClassName: string;
  barClassName: string;
  href: string;
  seeAllLabel: string;
  usage?: IFeatureUsage;
  usageLabel?: string;
  create?: IDashboardStatTileCreate;
  /** How many still wait, said beside the total; none hides it. */
  pending?: { count: number; label: string };
}

const getUsagePercent = (usage: IFeatureUsage): number => {
  if (!usage.limit) {
    return 0;
  }

  return Math.min(100, Math.round((usage.used / usage.limit) * 100));
};

export const DashboardStatTile: React.FC<Props> = ({
  label,
  count,
  isLoading,
  icon,
  iconClassName,
  barClassName,
  href,
  seeAllLabel,
  usage,
  usageLabel,
  create,
  pending,
}) => {
  const hasLimit: boolean = !!usage && usage.limit !== null;

  const isCreateDisabled: boolean = !!create?.disabledTooltip;

  const createButtonClassName: string = `flex items-center justify-center
    w-8 h-8 rounded-full border transition-colors
    border-gray-200 dark:border-gray-600`;

  return (
    <div
      className="group relative h-full rounded-xl border p-4
        bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700
        transition-all duration-200
        hover:-translate-y-0.5 hover:shadow-md hover:border-blue-300
        dark:hover:border-blue-500"
    >
      <Link
        href={href}
        className="flex flex-col h-full"
        aria-label={seeAllLabel}
      >
        <div className="flex items-center gap-3 pr-10">
          <span
            className={`flex items-center justify-center shrink-0
              w-11 h-11 rounded-lg text-xl ${iconClassName}`}
          >
            {icon}
          </span>

          <span className="text-sm truncate text-gray-500 dark:text-gray-400">
            {label}
          </span>
        </div>

        <div className="mt-4 h-9 flex items-center">
          {isLoading ? (
            <Skeleton.Button active size="small" />
          ) : (
            <span
              className="text-3xl font-semibold leading-none tabular-nums
                text-slate-800 dark:text-white"
            >
              {count}
            </span>
          )}

          {!isLoading && pending && (
            <span
              className={`ml-3 rounded-full px-2.5 py-1 text-xs font-medium
                tabular-nums ${
                  pending.count > 0
                    ? "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300"
                    : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                }`}
            >
              {pending.count} {pending.label}
            </span>
          )}
        </div>

        <div className="mt-3 h-4">
          {hasLimit && usage && (
            <Tooltip title={usageLabel}>
              <div className="flex items-center gap-2">
                <div
                  className="flex-1 h-1.5 rounded-full overflow-hidden
                    bg-gray-100 dark:bg-gray-700"
                >
                  <div
                    className={`h-full rounded-full ${barClassName}`}
                    style={{ width: `${getUsagePercent(usage)}%` }}
                  />
                </div>

                <span className="text-xs tabular-nums text-gray-400">
                  {usage.used}/{usage.limit}
                </span>
              </div>
            </Tooltip>
          )}
        </div>

        <span
          className="mt-3 flex items-center gap-1 text-xs
            text-gray-400 group-hover:text-blue-500 transition-colors"
        >
          {seeAllLabel}
          <ArrowRightOutlined className="text-[10px]" />
        </span>
      </Link>

      {create && (
        <div className="absolute top-4 right-4">
          <Tooltip title={create.disabledTooltip ?? create.tooltip}>
            {isCreateDisabled ? (
              <span
                aria-disabled="true"
                aria-label={create.disabledTooltip}
                className={`${createButtonClassName} cursor-not-allowed
                  opacity-40 text-gray-500 dark:text-gray-300`}
              >
                <PlusOutlined />
              </span>
            ) : (
              <Link
                href={create.href}
                aria-label={create.tooltip}
                className={`${createButtonClassName}
                  text-gray-500 dark:text-gray-300
                  hover:bg-blue-500 hover:border-blue-500 hover:text-white
                  dark:hover:bg-blue-500 dark:hover:border-blue-500`}
              >
                <PlusOutlined />
              </Link>
            )}
          </Tooltip>
        </div>
      )}
    </div>
  );
};
