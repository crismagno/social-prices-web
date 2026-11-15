"use client";

import { Button, Segmented, Tooltip } from "antd";

import { ShopOutlined, ShoppingOutlined } from "@ant-design/icons";

import useAuthData from "../../../data/context/auth/useAuthData";
import useLanguageData from "../../../data/context/language/useLanguageData";
import UsersEnum from "../../../shared/business/users/users.enum";

interface Props {
  isCollapsed?: boolean;
}

// The owner of a company can look at the account as a customer, to see the
// purchases made for them. Only the screens change; the account stays a company.
export const AccountModeSwitch: React.FC<Props> = ({ isCollapsed }) => {
  const { canSwitchView, viewMode, switchViewMode } = useAuthData();

  const { t } = useLanguageData();

  if (!canSwitchView) {
    return null;
  }

  if (isCollapsed) {
    const next: UsersEnum.Type =
      viewMode === UsersEnum.Type.CUSTOMER
        ? UsersEnum.Type.COMPANY
        : UsersEnum.Type.CUSTOMER;

    return (
      <Tooltip
        title={t("accountMode.switchTo").replace(
          "{mode}",
          t(UsersEnum.TypeLabels[next]),
        )}
      >
        <Button
          shape="circle"
          icon={
            viewMode === UsersEnum.Type.CUSTOMER ? (
              <ShoppingOutlined />
            ) : (
              <ShopOutlined />
            )
          }
          onClick={() => switchViewMode(next)}
        />
      </Tooltip>
    );
  }

  return (
    <Tooltip title={t("accountMode.hint")}>
      <Segmented<UsersEnum.Type>
        block
        className="w-full"
        value={viewMode}
        onChange={switchViewMode}
        options={[
          {
            value: UsersEnum.Type.CUSTOMER,
            label: t(UsersEnum.TypeLabels[UsersEnum.Type.CUSTOMER]),
            icon: <ShoppingOutlined />,
          },
          {
            value: UsersEnum.Type.COMPANY,
            label: t(UsersEnum.TypeLabels[UsersEnum.Type.COMPANY]),
            icon: <ShopOutlined />,
          },
        ]}
      />
    </Tooltip>
  );
};
