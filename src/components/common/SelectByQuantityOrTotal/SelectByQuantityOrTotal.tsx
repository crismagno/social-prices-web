import { useState } from "react";

import { Select } from "antd";
import { map } from "lodash";

import CommonEnum from "../../../shared/common/enums/common.enum";

interface Props {
  label?: string;
  onChange: (quantityOrTotal: CommonEnum.QuantityOrTotal) => void;
}

const SelectByQuantityOrTotal: React.FC<Props> = ({ onChange, label }) => {
  const [quantityOrTotal, setQuantityOrTotal] =
    useState<CommonEnum.QuantityOrTotal>(CommonEnum.QuantityOrTotal.TOTAL);

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
              {CommonEnum.QuantityOrTotalLabels[quantityOrTotal]}
            </Select.Option>
          )
        )}
      </Select>
    </div>
  );
};

export default SelectByQuantityOrTotal;
