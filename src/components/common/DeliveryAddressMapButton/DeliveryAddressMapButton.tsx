import React from "react";

import { Tooltip } from "antd";

import { EnvironmentOutlined } from "@ant-design/icons";

import useLanguageData from "../../../data/context/language/useLanguageData";
import { IAddress } from "../../../shared/business/shared/address/address.interface";

interface Props {
  address: IAddress | null;
}

export const DeliveryAddressMapButton: React.FC<Props> = ({ address }) => {
  const { t } = useLanguageData();

  if (!address) {
    return null;
  }

  const { address1, address2, city, country, district, state, zip } = address;

  function formatFullAddress(): string {
    const parts = [
      address1,
      address2,
      district,
      city,
      state?.name ?? "",
      zip,
      country?.name ?? "",
    ];

    return parts.filter(Boolean).join(", ");
  }

  const handleOpenRoute = () => {
    const encoded: string = encodeURIComponent(formatFullAddress());

    const url: string = `https://www.google.com/maps/dir/?api=1&origin=My+Location&destination=${encoded}`;

    if (!navigator.geolocation) {
      window.open(url, "_blank");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        window.open(
          `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${encoded}`,
          "_blank",
        );
      },
      (err) => {
        console.warn("Erro ao obter localização:", err);
        window.open(url, "_blank");
      },
      { enableHighAccuracy: true },
    );
  };

  return (
    <Tooltip title={t("sales.openDeliveryRoute")}>
      <EnvironmentOutlined
        onClick={handleOpenRoute}
        style={{ fontSize: 17, color: "#1677FF" }}
      />
    </Tooltip>
  );
};
