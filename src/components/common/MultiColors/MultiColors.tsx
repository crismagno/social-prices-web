import { Button, Divider } from "antd";
import { Control, FieldErrors, useFieldArray } from "react-hook-form";
import { z } from "zod";

import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";

import useLanguageData from "../../../data/context/language/useLanguageData";
import { ColorPickerCustomAntd } from "../../custom/antd/ColorPickerCustomAntd/ColorPickerCustomAntd";
import ContainerTitle from "../ContainerTitle/ContainerTitle";

export const colorSchema = z.object({
  value: z.any().optional(),
});

interface Props {
  control: Control<any>;
  errors: FieldErrors<{
    colors: { value: string }[];
  }>;
  containerExtraHeader?: React.ReactNode;
  disabled?: boolean;
}

export const MultiColors: React.FC<Props> = ({
  control,
  errors,
  containerExtraHeader,
  disabled,
}) => {
  const { t } = useLanguageData();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "colors",
  });

  const addNewColor = () => {
    append({ value: "#ffffff" });
  };

  const removeColor = (index: number) => {
    remove(index);

    if (fields.length === 1) {
      append({ value: "#ffffff" });
    }
  };

  return (
    <ContainerTitle
      title={
        <div className="flex items-center">
          <label className="mr-4">{t("products.colors")}</label>

          <Button
            type="primary"
            onClick={addNewColor}
            icon={<PlusOutlined />}
            className="rounded-full"
            disabled={disabled}
          />
        </div>
      }
      extraHeader={containerExtraHeader}
      className="mt-8"
    >
      <div className="flex items-center mt-5 flex-wrap">
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-center mr-3 mb-2">
            <ColorPickerCustomAntd
              controller={{
                control,
                name: `colors.${index}.value`,
              }}
              showText
              allowClear
              errorMessage={errors.colors?.[index]?.value?.message}
              divClassName="mr-2"
              disabled={disabled}
            />

            <Button
              type="link"
              danger
              onClick={(e) => {
                e.preventDefault();
                removeColor(index);
              }}
              icon={<DeleteOutlined />}
              disabled={disabled}
            />

            <Divider type="vertical" />
          </div>
        ))}
      </div>
    </ContainerTitle>
  );
};
