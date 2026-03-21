import { useState } from "react";

import { Select } from "antd";
import { map } from "lodash";

import useLanguageData from "../../../data/context/language/useLanguageData";
import CommonEnum from "../../../shared/common/enums/common.enum";

interface Props {
  label?: string;
  onChange: (quantityOrTotal: CommonEnum.QuantityOrTotal) => void;
}

const SelectByQuantityOrTotal: React.FC<Props> = ({ onChange, label }) => {
  const { t } = useLanguageData();
  const [quantityOrTotal, setQuantityOrTotal] =
    useState<CommonEnum.QuantityOrTotal>(CommonEnum.QuantityOrTotal.TOTAL);

  const quantityOrTotalLabels: Record<CommonEnum.QuantityOrTotal, string> = {
    [CommonEnum.QuantityOrTotal.QUANTITY]: t("common.quantity"),
    [CommonEnum.QuantityOrTotal.TOTAL]: t("common.total"),
  };

  return (
    <div>
      <label className="mr-1 font-bold">{label ?? "Select:"}</label>

      <Select
        style={{ width: 120 }}
        value={quantityOrTotal}
        defaultValue={CommonEnum.QuantityOrTotal.TOTAL}
        onChange={(value: CommonEnum.QuantityOrTotal) => {
          setQuantityOrTotal(value);
          onChange(value);
        }}
      >
        {map(
          Object.keys(CommonEnum.QuantityOrTotal),
          (quantityOrTotal: CommonEnum.QuantityOrTotal) => (
            <Select.Option key={quantityOrTotal} value={quantityOrTotal}>
              {quantityOrTotalLabels[quantityOrTotal]}
            </Select.Option>
          )
        )}
      </Select>
    </div>
  );
};

export default SelectByQuantityOrTotal;
