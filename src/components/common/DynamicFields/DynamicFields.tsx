import { Button, Col, Divider, Radio, Row } from "antd";
import {
  Control,
  Controller,
  FieldErrors,
  useFieldArray,
  UseFormSetValue,
  useWatch,
} from "react-hook-form";
import { z } from "zod";

import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";

import useLanguageData from "../../../data/context/language/useLanguageData";
import DynamicFieldEnum from "../../../shared/business/shared/dynamic-field/dynamic-field.enum";
import { InputCustomAntd } from "../../custom/antd/InputCustomAntd/InputCustomAntd";
import { InputNumberCustomAntd } from "../../custom/antd/InputNumberCustomAntd/InputNumberCustomAntd";
import { SelectCustomAntd } from "../../custom/antd/SelectCustomAntd/SelectCustomAntd";
import ContainerTitle from "../ContainerTitle/ContainerTitle";

export const dynamicFieldSchema = z.object({
  name: z.string().trim(),
  type: z.nativeEnum(DynamicFieldEnum.Type),
  value: z.any().optional(),
});

export type TDynamicFieldForm = z.infer<typeof dynamicFieldSchema>;

/**
 * Default value each type starts with. Also used when the user switches the
 * type of a field that already has a value.
 */
export const defaultValueByDynamicFieldType: Record<
  DynamicFieldEnum.Type,
  boolean | string | number
> = {
  [DynamicFieldEnum.Type.BOOLEAN]: false,
  [DynamicFieldEnum.Type.STRING]: "",
  [DynamicFieldEnum.Type.INT]: 0,
  [DynamicFieldEnum.Type.DECIMAL]: 0,
};

/**
 * Rejects a list whose names repeat, ignoring case and surrounding spaces.
 * Attach it to the array field so the message lands on the form.
 */
export const hasUniqueDynamicFieldNames = (
  fields: { name?: string | null }[] | undefined
): boolean => {
  const names: string[] = (fields ?? [])
    .map((field) => (field?.name ?? "").trim().toLowerCase())
    .filter((name) => !!name);

  return new Set(names).size === names.length;
};

interface Props {
  control: Control<any>;
  errors: FieldErrors<any>;
  /** Needed to reset a field's value when its type changes. */
  setValue: UseFormSetValue<any>;
  /**
   * Field array path on the form. Defaults to "dynamicFields" so the component
   * can be dropped into any other form by pointing it somewhere else.
   */
  name?: string;
  title?: string;
  containerExtraHeader?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

const DynamicFieldValueInput: React.FC<{
  control: Control<any>;
  name: string;
  type: DynamicFieldEnum.Type;
  label: string;
  disabled?: boolean;
  errorMessage?: string;
}> = ({ control, name, type, label, disabled, errorMessage }) => {
  const { t } = useLanguageData();

  if (type === DynamicFieldEnum.Type.BOOLEAN) {
    return (
      <div className="flex flex-col mt-4 mr-5">
        <label className="text-sm">{label}</label>

        <Controller
          control={control}
          name={name}
          render={({ field: { onChange, value } }) => (
            <Radio.Group
              value={!!value}
              onChange={(event) => onChange(event.target.value)}
              disabled={disabled}
              className="mt-2"
            >
              <Radio value={true}>{t("dynamicFields.true")}</Radio>
              <Radio value={false}>{t("dynamicFields.false")}</Radio>
            </Radio.Group>
          )}
        />

        {errorMessage && (
          <p role="alert" className="text-sm text-red-500 px-1">
            {errorMessage}
          </p>
        )}
      </div>
    );
  }

  if (
    type === DynamicFieldEnum.Type.INT ||
    type === DynamicFieldEnum.Type.DECIMAL
  ) {
    const isInteger: boolean = type === DynamicFieldEnum.Type.INT;

    return (
      <InputNumberCustomAntd
        controller={{ control, name }}
        label={label}
        placeholder={label}
        disabled={disabled}
        errorMessage={errorMessage}
        step={isInteger ? 1 : 0.01}
        precision={isInteger ? 0 : 2}
      />
    );
  }

  return (
    <InputCustomAntd
      controller={{ control, name }}
      label={label}
      placeholder={label}
      disabled={disabled}
      errorMessage={errorMessage}
    />
  );
};

export const DynamicFields: React.FC<Props> = ({
  control,
  errors,
  setValue,
  name = "dynamicFields",
  title,
  containerExtraHeader,
  disabled,
  className,
}) => {
  const { t } = useLanguageData();

  const { fields, append, remove } = useFieldArray({ control, name });

  const values = useWatch({ control, name });

  const addNewDynamicField = () => {
    append({
      name: "",
      type: DynamicFieldEnum.Type.STRING,
      value: defaultValueByDynamicFieldType[DynamicFieldEnum.Type.STRING],
    });
  };

  /**
   * Switching the type resets the value: converting across types produces
   * confusing results (e.g. "abc" becoming 0).
   */
  const onChangeType = (index: number, type: DynamicFieldEnum.Type) => {
    setValue(`${name}.${index}.type`, type);
    setValue(`${name}.${index}.value`, defaultValueByDynamicFieldType[type]);
  };

  const arrayError = (errors as any)?.[name];

  return (
    <ContainerTitle
      title={
        <div className="flex items-center">
          <label className="mr-4">{title ?? t("dynamicFields.title")}</label>

          <Button
            type="primary"
            onClick={addNewDynamicField}
            icon={<PlusOutlined />}
            className="rounded-full"
            disabled={disabled}
          />
        </div>
      }
      extraHeader={containerExtraHeader}
      className={className ?? "mt-8"}
    >
      {!fields.length && (
        <p className="mt-4 text-sm text-gray-400">
          {t("dynamicFields.empty")}
        </p>
      )}

      {fields.map((field, index) => {
        const type: DynamicFieldEnum.Type =
          values?.[index]?.type ?? DynamicFieldEnum.Type.STRING;

        return (
          <Row key={field.id} gutter={[10, 0]} align="middle">
            <Col xs={24} sm={8} md={8}>
              <InputCustomAntd
                controller={{ control, name: `${name}.${index}.name` }}
                label={t("dynamicFields.name")}
                placeholder={t("dynamicFields.name")}
                disabled={disabled}
                errorMessage={arrayError?.[index]?.name?.message}
              />
            </Col>

            <Col xs={24} sm={7} md={6}>
              <SelectCustomAntd
                controller={{ control, name: `${name}.${index}.type` }}
                label={t("dynamicFields.type")}
                disabled={disabled}
                errorMessage={arrayError?.[index]?.type?.message}
                onChange={(value: any) => onChangeType(index, value)}
                options={Object.values(DynamicFieldEnum.Type).map(
                  (typeValue: DynamicFieldEnum.Type) => ({
                    value: typeValue,
                    label: t(`dynamicFields.types.${typeValue}`),
                  })
                )}
              />
            </Col>

            <Col xs={22} sm={7} md={8}>
              <DynamicFieldValueInput
                control={control}
                name={`${name}.${index}.value`}
                type={type}
                label={t("dynamicFields.value")}
                disabled={disabled}
                errorMessage={arrayError?.[index]?.value?.message}
              />
            </Col>

            <Col xs={2} sm={2} md={2}>
              <Button
                type="link"
                danger
                onClick={(e) => {
                  e.preventDefault();
                  remove(index);
                }}
                icon={<DeleteOutlined />}
                disabled={disabled}
                className="mt-8"
              />
            </Col>

            <Col xs={24}>
              <Divider className="my-2" />
            </Col>
          </Row>
        );
      })}

      {typeof arrayError?.message === "string" && (
        <p role="alert" className="text-sm text-red-500 px-1">
          {arrayError.message}
        </p>
      )}
    </ContainerTitle>
  );
};
