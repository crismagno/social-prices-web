import { Button, Divider } from "antd";
import { Control, FieldErrors, useFieldArray } from "react-hook-form";
import { z } from "zod";

import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";

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
}

export const MultiColors: React.FC<Props> = ({
  control,
  errors,
  containerExtraHeader,
}) => {
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
          <label className="mr-4">Colors</label>

          <Button
            type="primary"
            onClick={addNewColor}
            icon={<PlusOutlined />}
            className="rounded-full"
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
            />

            <Button
              type="link"
              danger
              onClick={(e) => {
                e.preventDefault();
                removeColor(index);
              }}
              icon={<DeleteOutlined />}
            />

            <Divider type="vertical" />
          </div>
        ))}
      </div>
    </ContainerTitle>
  );
};
