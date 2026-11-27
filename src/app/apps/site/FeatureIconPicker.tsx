"use client";

import { Button } from "antd";

import FeatureIcon from "../../../components/store-site/shared/blocks/FeatureIcon";
import useLanguageData from "../../../data/context/language/useLanguageData";
import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";

interface Props {
  value: StoreSitesEnum.FeatureIcon | null;
  onChange: (icon: StoreSitesEnum.FeatureIcon) => void;
  /**
   * Where having no icon is a choice: the words of that choice, and what
   * choosing it does. Without them, an empty value shows the star as chosen.
   */
  noneLabel?: string;
  onClear?: () => void;
}

/**
 * The ready icons side by side to click, on as many lines as they need: there
 * are more of them than fit in one.
 */
const FeatureIconPicker = ({ value, onChange, noneLabel, onClear }: Props) => {
  const { t } = useLanguageData();

  const canBeNone: boolean = !!noneLabel && !!onClear;

  const chosen: StoreSitesEnum.FeatureIcon | null =
    value ?? (canBeNone ? null : StoreSitesEnum.FeatureIcon.STAR);

  return (
    <div className="flex flex-wrap gap-1" role="radiogroup">
      {canBeNone && (
        <Button
          size="small"
          role="radio"
          aria-checked={chosen === null}
          type={chosen === null ? "primary" : "default"}
          onClick={onClear}
        >
          {noneLabel}
        </Button>
      )}
      {Object.values(StoreSitesEnum.FeatureIcon).map(
        (icon: StoreSitesEnum.FeatureIcon) => (
          <Button
            key={icon}
            size="small"
            role="radio"
            aria-checked={chosen === icon}
            aria-label={t(`storeSite.editor.blocks.icons.${icon}`)}
            title={t(`storeSite.editor.blocks.icons.${icon}`)}
            type={chosen === icon ? "primary" : "default"}
            icon={<FeatureIcon icon={icon} />}
            onClick={() => onChange(icon)}
          />
        ),
      )}
    </div>
  );
};

export default FeatureIconPicker;
