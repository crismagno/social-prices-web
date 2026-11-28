import React, { ReactNode } from "react";

import { presetPalettes } from "@ant-design/colors";
import {
  CarOutlined,
  CheckCircleFilled,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  RollbackOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { Skeleton, theme } from "antd";

import useLanguageData from "../../../../data/context/language/useLanguageData";
import SalesEnum from "../../../../shared/business/sales/sales.enum";

interface IStatusVisual {
  icon: ReactNode;
  /** Key of an Ant Design preset palette. */
  palette: keyof typeof presetPalettes;
}

/**
 * Workflow order, so the cards read from a new sale to its end. The palettes
 * are distinct per card (the table tags reuse blue/red for several statuses).
 */
const STATUS_VISUALS: [SalesEnum.Status, IStatusVisual][] = [
  [
    SalesEnum.Status.STARTED,
    { icon: <PlayCircleOutlined />, palette: "geekblue" },
  ],
  [
    SalesEnum.Status.PENDING,
    { icon: <ClockCircleOutlined />, palette: "gold" },
  ],
  [SalesEnum.Status.PROCESSING, { icon: <SyncOutlined />, palette: "cyan" }],
  [SalesEnum.Status.DELIVERY, { icon: <CarOutlined />, palette: "purple" }],
  [
    SalesEnum.Status.COMPLETED,
    { icon: <CheckCircleOutlined />, palette: "green" },
  ],
  [
    SalesEnum.Status.STOPPED,
    { icon: <PauseCircleOutlined />, palette: "volcano" },
  ],
  [
    SalesEnum.Status.ERROR,
    { icon: <ExclamationCircleOutlined />, palette: "red" },
  ],
  [
    SalesEnum.Status.CANCELLED,
    { icon: <CloseCircleOutlined />, palette: "grey" },
  ],
  [
    SalesEnum.Status.REFUNDED,
    { icon: <RollbackOutlined />, palette: "orange" },
  ],
];

interface Props {
  statusCounts: Partial<Record<SalesEnum.Status, number>>;
  isLoading: boolean;
  selectedStatuses?: SalesEnum.Status[];
  onSelectStatus?: (status: SalesEnum.Status) => void;
}

export const SalesStatusCards: React.FC<Props> = ({
  statusCounts,
  isLoading,
  selectedStatuses = [],
  onSelectStatus,
}) => {
  const { t } = useLanguageData();
  const { token } = theme.useToken();

  const total: number = Object.values(statusCounts).reduce(
    (sum: number, count?: number) => sum + (count ?? 0),
    0,
  );

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 xl:grid-cols-9">
      {STATUS_VISUALS.map(([status, { icon, palette }]) => {
        const colors: string[] = presetPalettes[palette];
        const accent: string = colors[5];
        const count: number = statusCounts[status] ?? 0;
        const share: number = total ? Math.round((count / total) * 100) : 0;
        const isSelected: boolean = selectedStatuses.includes(status);
        const isEmpty: boolean = !isLoading && count === 0;

        return (
          <button
            key={status}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onSelectStatus?.(status)}
            className="group relative flex cursor-pointer flex-col gap-2 overflow-hidden rounded-lg px-2.5 py-2 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              background: isSelected
                ? `linear-gradient(135deg, ${accent}26, ${accent}0d)`
                : token.colorBgContainer,
              borderWidth: 1,
              borderStyle: "solid",
              borderColor: isSelected ? accent : token.colorBorderSecondary,
              boxShadow: isSelected
                ? `0 0 0 1px ${accent}, 0 6px 16px -6px ${accent}80`
                : token.boxShadowTertiary,
              outlineColor: accent,
              opacity: isEmpty && !isSelected ? 0.6 : 1,
            }}
          >
            <div className="flex items-start justify-between">
              <span
                className="flex h-6 w-6 items-center justify-center rounded-md text-xs transition-transform duration-200 group-hover:scale-110"
                style={{
                  background: isSelected ? accent : `${accent}1f`,
                  color: isSelected ? "#fff" : accent,
                }}
              >
                {icon}
              </span>

              {isSelected && (
                <CheckCircleFilled style={{ color: accent, fontSize: 13 }} />
              )}
            </div>

            <div className="min-w-0">
              {isLoading ? (
                <Skeleton.Button active size="small" />
              ) : (
                <div
                  className="text-lg font-bold leading-none tabular-nums"
                  style={{ color: token.colorText }}
                >
                  {count}
                </div>
              )}

              <div
                className="mt-1 truncate text-[11px] font-medium"
                style={{ color: token.colorTextSecondary }}
              >
                {t(SalesEnum.StatusLabels[status])}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div
                className="h-1 flex-1 overflow-hidden rounded-full"
                style={{ background: token.colorFillSecondary }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${share}%`, background: accent }}
                />
              </div>

              <span
                className="text-[10px] font-medium tabular-nums"
                style={{ color: token.colorTextTertiary }}
              >
                {share}%
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
