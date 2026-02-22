import { Select, Tooltip } from "antd";
import { useFieldArray } from "react-hook-form";
import { z } from "zod";

import useLanguageData from "../../../data/context/language/useLanguageData";
import PhoneNumberEnum from "../../../shared/business/shared/phone/phone-number.enum";
import { IPhoneNumber } from "../../../shared/business/shared/phone/phone-number.interface";
import { createPhoneNumberName } from "../../../shared/utils/strings/string";
import { InputCustomAntd } from "../../custom/antd/InputCustomAntd/InputCustomAntd";
import { SelectCustomAntd } from "../../custom/antd/SelectCustomAntd/SelectCustomAntd";
import ButtonCommon from "../ButtonCommon/ButtonCommon";
import Collapse from "../Collapse/Collapse";
import ContainerTitle from "../ContainerTitle/ContainerTitle";
import { IconPlus, IconTrash } from "../icons/icons";

export const phoneNumberFormSchema = z.object({
  uid: z.string(),
  type: z.string().nonempty("Phone type is required"),
  number: z.string().trim().nonempty("Phone number is required"),
  isCollapsed: z.boolean().optional(),
  messengers: z.array(z.string()),
});

export type TPhoneNumberFormSchema = z.infer<typeof phoneNumberFormSchema>;

export const generateNewPhoneNumber = (
  isCollapsed: boolean = true
): TPhoneNumberFormSchema => ({
  type: PhoneNumberEnum.Type.OTHER,
  number: "",
  isCollapsed,
  uid: Date.now().toString(),
  messengers: [],
});

interface Props {
  control: any;
  watch: any;
  errors: any;
  containerExtraHeader?: any;
}

export const PhoneNumbers: React.FC<Props> = ({
  control,
  errors,
  watch,
  containerExtraHeader,
}) => {
  const { t } = useLanguageData()!;

  const {
    append: appendPhone,
    fields: fieldsPhones,
    remove: removePhone,
  } = useFieldArray({
    control,
    name: "phoneNumbers",
  });

  const addNewPhoneNumber = () => appendPhone(generateNewPhoneNumber(true));

  const removeNewPhoneNumber = (index: number) => {
    removePhone(index);

    if (fieldsPhones.length === 1) {
      addNewPhoneNumber();
    }
  };

  return (
    <ContainerTitle
      title={
        <div className="flex items-center">
          <label className="mr-4">{t("profile.phoneNumbers")}</label>

          <Tooltip title={t("phoneNumber.addNewPhoneNumber")}>
            <ButtonCommon
              onClick={(e) => {
                e.preventDefault();
                addNewPhoneNumber();
              }}
              color="primary"
              className="rounded-r-full rounded-l-full"
            >
              {IconPlus()}
            </ButtonCommon>
          </Tooltip>
        </div>
      }
      extraHeader={containerExtraHeader}
      className="mt-10"
    >
      {fieldsPhones.map(
        (formPhoneNumber: TPhoneNumberFormSchema, index: number) => {
          const phoneNUmber: TPhoneNumberFormSchema = watch(
            `phoneNumbers.${index}`
          );

          const phoneNumberName: string = createPhoneNumberName(
            phoneNUmber as IPhoneNumber
          );

          return (
            <Collapse
              key={index}
              collapsed={formPhoneNumber.isCollapsed}
              title={phoneNumberName.trim() || `${t("phoneNumber.phoneNumber")} (${index + 1})`}
              className="relative mt-5"
              extraHeader={
                <Tooltip title={t("phoneNumber.removePhoneNumber")}>
                  <ButtonCommon
                    onClick={(e) => {
                      e.preventDefault();
                      removeNewPhoneNumber(index);
                    }}
                    color="transparent"
                    className="rounded-r-full rounded-l-full absolute right-2 shadow-none"
                  >
                    {IconTrash("w-3 h-3 text-red-500 hover:text-red-600")}
                  </ButtonCommon>
                </Tooltip>
              }
            >
              <div className="flex">
                <div className="flex flex-col justify-start w-1/2">
                  <SelectCustomAntd<IPhoneNumber>
                    controller={{ control, name: `phoneNumbers.${index}.type` }}
                    label={t("phoneNumber.type")}
                    errorMessage={errors?.phoneNumbers?.[index]?.type?.message}
                  >
                    {Object.keys(PhoneNumberEnum.Type).map(
                      (phoneType: string) => (
                        <Select.Option key={phoneType} value={phoneType}>
                          {
                            PhoneNumberEnum.TypeLabels[
                              phoneType as PhoneNumberEnum.Type
                            ]
                          }
                        </Select.Option>
                      )
                    )}
                  </SelectCustomAntd>
                </div>

                <div className="flex flex-col justify-start w-1/2">
                  <InputCustomAntd
                    controller={{
                      control,
                      name: `phoneNumbers.${index}.number`,
                    }}
                    label={t("phoneNumber.phoneNumber")}
                    placeholder={t("placeholders.enterPhone")}
                    errorMessage={
                      errors?.phoneNumbers?.[index]?.number?.message
                    }
                    maxLength={30}
                  />
                </div>

                <div className="flex flex-col justify-start w-1/2">
                  <SelectCustomAntd<IPhoneNumber>
                    controller={{
                      control,
                      name: `phoneNumbers.${index}.messengers`,
                    }}
                    label={t("phoneNumber.messengers")}
                    errorMessage={
                      errors?.phoneNumbers?.[index]?.messengers?.message
                    }
                    placeholder={t("phoneNumber.selectMessengers")}
                    mode="multiple"
                  >
                    {Object.keys(PhoneNumberEnum.PhoneNumberMessenger).map(
                      (phoneMessenger: string) => (
                        <Select.Option
                          key={phoneMessenger}
                          value={phoneMessenger}
                        >
                          {
                            PhoneNumberEnum.PhoneNumberMessengerLabels[
                              phoneMessenger as PhoneNumberEnum.PhoneNumberMessenger
                            ]
                          }
                        </Select.Option>
                      )
                    )}
                  </SelectCustomAntd>
                </div>
              </div>
            </Collapse>
          );
        }
      )}
    </ContainerTitle>
  );
};
