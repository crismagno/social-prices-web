"use client";

import { Segmented } from "antd";

import FeatureIcon from "../../../components/store-site/shared/blocks/FeatureIcon";
import useLanguageData from "../../../data/context/language/useLanguageData";
import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";

interface Props {
  value: StoreSitesEnum.FeatureIcon | null;
  onChange: (icon: StoreSitesEnum.FeatureIcon) => void;
}

/** The ready icons of a feature card, side by side to click. */
const FeatureIconPicker = ({ value, onChange }: Props) => {
  const { t } = useLanguageData();

  return (
    <Segmented<StoreSitesEnum.FeatureIcon>
      style={{ flexWrap: "wrap", display: "inline-flex", maxWidth: "100%" }}
      value={value ?? StoreSitesEnum.FeatureIcon.STAR}
      onChange={onChange}
      options={Object.values(StoreSitesEnum.FeatureIcon).map(
        (icon: StoreSitesEnum.FeatureIcon) => ({
          value: icon,
          icon: <FeatureIcon icon={icon} />,
          title: t(`storeSite.editor.blocks.icons.${icon}`),
        }),
      )}
    />
  );
};

export default FeatureIconPicker;
