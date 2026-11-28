import React, { ReactNode } from "react";

import { presetPalettes } from "@ant-design/colors";
import {
  AppstoreOutlined,
  EditOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import { Skeleton, theme } from "antd";

import useLanguageData from "../../../../data/context/language/useLanguageData";
import SalesEnum from "../../../../shared/business/sales/sales.enum";

interface ITypeOption {
  key: string;
  types: SalesEnum.Type[];
  icon: ReactNode;
  label: string;
  count: number;
  accent: string;
}

interface Props {
  typeCounts: Partial<Record<SalesEnum.Type, number>>;
  isLoading?: boolean;
  selectedTypes?: SalesEnum.Type[];
  onChange: (types: SalesEnum.Type[]) => void;
}

export const SalesTypeFilter: React.FC<Props> = ({
  typeCounts,
  isLoading = false,
  selectedTypes = [],
  onChange,
}) => {
  const { t } = useLanguageData();
  const { token } = theme.useToken();

  const shoppingCount: number = typeCounts[SalesEnum.Type.SHOPPING] ?? 0;
  const manualCount: number = typeCounts[SalesEnum.Type.MANUAL] ?? 0;
  const total: number = shoppingCount + manualCount;

  const selectedKey: string =
    selectedTypes.length === 1 ? selectedTypes[0] : "ALL";

  const options: ITypeOption[] = [
    {
      key: "ALL",
      types: [],
      icon: <AppstoreOutlined />,
      label: t("sales.originAll"),
      count: total,
      accent: token.colorPrimary,
    },
    {
      key: SalesEnum.Type.SHOPPING,
      types: [SalesEnum.Type.SHOPPING],
      icon: <GlobalOutlined />,
      label: t("sales.originSite"),
      count: shoppingCount,
      accent: presetPalettes.orange[5],
    },
    {
      key: SalesEnum.Type.MANUAL,
      types: [SalesEnum.Type.MANUAL],
      icon: <EditOutlined />,
      label: t("sales.originManual"),
      count: manualCount,
      accent: presetPalettes.blue[5],
    },
  ];

  return (
    <div role="radiogroup" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {options.map((option: ITypeOption) => {
        const isSelected: boolean = option.key === selectedKey;
        const share: number = total
          ? Math.round((option.count / total) * 100)
          : 0;

        return (
          <button
            key={option.key}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(option.types)}
            className="group flex cursor-pointer items-center gap-4 rounded-xl px-4 py-3.5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              background: isSelected
                ? `linear-gradient(135deg, ${option.accent}, ${option.accent}cc)`
                : token.colorBgContainer,
              borderWidth: 1,
              borderStyle: "solid",
              borderColor: isSelected
                ? option.accent
                : token.colorBorderSecondary,
              boxShadow: isSelected
                ? `0 8px 20px -8px ${option.accent}`
                : token.boxShadowTertiary,
              outlineColor: option.accent,
            }}
          >
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl transition-transform duration-200 group-hover:scale-110"
              style={{
                background: isSelected
                  ? "rgba(255, 255, 255, 0.22)"
                  : `${option.accent}1f`,
                color: isSelected ? "#fff" : option.accent,
              }}
            >
              {option.icon}
            </span>

            <span className="min-w-0 flex-1">
              <span
                className="block truncate text-sm font-medium"
                style={{
                  color: isSelected
                    ? "rgba(255, 255, 255, 0.9)"
                    : token.colorTextSecondary,
                }}
              >
                {option.label}
              </span>

              {isLoading ? (
                <Skeleton.Button active size="small" className="mt-1" />
              ) : (
                <span
                  className="block text-2xl font-bold leading-tight tabular-nums"
                  style={{ color: isSelected ? "#fff" : token.colorText }}
                >
                  {option.count}
                </span>
              )}
            </span>

            {option.key !== "ALL" && !isLoading && (
              <span
                className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums"
                style={{
                  background: isSelected
                    ? "rgba(255, 255, 255, 0.22)"
                    : `${option.accent}1a`,
                  color: isSelected ? "#fff" : option.accent,
                }}
              >
                {share}%
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
