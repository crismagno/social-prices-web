import { Descriptions, Tag } from "antd";

import useLanguageData from "../../../data/context/language/useLanguageData";
import DynamicFieldEnum from "../../../shared/business/shared/dynamic-field/dynamic-field.enum";
import { IDynamicField } from "../../../shared/business/shared/dynamic-field/dynamic-field.interface";

interface Props {
  dynamicFields?: IDynamicField[] | null;
  title?: string;
}

/**
 * Read only counterpart of DynamicFields. Renders nothing when the entity has
 * no dynamic fields, so it can be dropped into any detail page.
 */
export const DynamicFieldsView: React.FC<Props> = ({
  dynamicFields,
  title,
}) => {
  const { t } = useLanguageData();

  if (!dynamicFields?.length) {
    return null;
  }

  const renderValue = (field: IDynamicField) => {
    if (field.type === DynamicFieldEnum.Type.BOOLEAN) {
      return (
        <Tag color={field.value ? "green" : "red"}>
          {field.value ? t("dynamicFields.true") : t("dynamicFields.false")}
        </Tag>
      );
    }

    if (field.value === null || field.value === undefined || field.value === "") {
      return "-";
    }

    return `${field.value}`;
  };

  return (
    <Descriptions
      bordered
      column={1}
      size="small"
      title={title ?? t("dynamicFields.title")}
    >
      {dynamicFields.map((field: IDynamicField) => (
        <Descriptions.Item
          key={field.name}
          label={
            <div className="flex flex-col">
              <span>{field.name}</span>
              <span className="text-xs text-gray-400">
                {t(`dynamicFields.types.${field.type}`)}
              </span>
            </div>
          }
        >
          {renderValue(field)}
        </Descriptions.Item>
      ))}
    </Descriptions>
  );
};
