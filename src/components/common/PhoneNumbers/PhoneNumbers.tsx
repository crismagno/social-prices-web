import { Select, Tooltip } from "antd";
import { Controller, useFieldArray } from "react-hook-form";
import { z } from "zod";

import { IPhoneNumber } from "../../../shared/business/interfaces/phone-number";
import StoresEnum from "../../../shared/business/stores/stores.enum";
import { createPhoneNumberName } from "../../../shared/utils/string-extensions/string-extensions";
import ButtonCommon from "../ButtonCommon/ButtonCommon";
import Collapse from "../Collapse/Collapse";
import ContainerTitle from "../ContainerTitle/ContainerTitle";
import FormInput from "../FormInput/FormInput";
import FormSelect, { FormSelectOption } from "../FormSelect/FormSelect";
import { IconPlus, IconTrash } from "../icons/icons";

export const phoneNumberFormSchema = z.object({
  uid: z.string(),
  type: z.string().nonempty("Phone type is required"),
  number: z.string().nonempty("Phone number is required"),
  isCollapsed: z.boolean().optional(),
  messengers: z.array(z.string()),
});

export type TPhoneNumberFormSchema = z.infer<typeof phoneNumberFormSchema>;

export const generateNewAPhoneNumber = (
  isCollapsed: boolean = true
): TPhoneNumberFormSchema => ({
  type: StoresEnum.PhoneTypes.OTHER,
  number: "",
  isCollapsed,
  uid: Date.now().toString(),
  messengers: [],
});

interface Props {
  control: any;
  watch: any;
  register: any;
  errors: any;
  containerExtraHeader?: any;
}

export const PhoneNumbers: React.FC<Props> = ({
  control,
  errors,
  register,
  watch,
  containerExtraHeader,
}) => {
  const {
    append: appendPhone,
    fields: fieldsPhones,
    remove: removePhone,
  } = useFieldArray({
    control,
    name: "phoneNumbers",
  });

  const addNewPhoneNumber = () => appendPhone(generateNewAPhoneNumber(true));

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
          <label className="mr-4">Phones</label>

          <Tooltip title="Add a new phone number">
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
              title={phoneNumberName.trim() || `Phone Number (${index + 1})`}
              className="relative mt-5"
              extraHeader={
                <Tooltip title="Remove phone number">
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
                  <FormSelect
                    label="Type"
                    placeholder={"Select phone type"}
                    defaultValue={formPhoneNumber.type}
                    register={register}
                    registerName={`phoneNumbers.${index}.type`}
                    registerOptions={{ required: true }}
                    errorMessage={errors?.phoneNumbers?.[index]?.type?.message}
                  >
                    {Object.keys(StoresEnum.PhoneTypes).map(
                      (phoneType: string) => (
                        <FormSelectOption key={phoneType} value={phoneType}>
                          {
                            StoresEnum.PhoneTypesLabels[
                              phoneType as StoresEnum.PhoneTypes
                            ]
                          }
                        </FormSelectOption>
                      )
                    )}
                  </FormSelect>
                </div>

                <div className="flex flex-col justify-start w-1/2">
                  <FormInput
                    label="Phone Number"
                    placeholder={"Enter phone number"}
                    defaultValue={formPhoneNumber.number}
                    register={register}
                    registerName={`phoneNumbers.${index}.number`}
                    registerOptions={{ required: true }}
                    errorMessage={
                      errors?.phoneNumbers?.[index]?.number?.message
                    }
                    maxLength={30}
                  />
                </div>

                <div className="flex flex-col justify-start w-1/2">
                  <div className={`flex flex-col mt-4 mr-5`}>
                    <label className={`text-sm`}>Messengers</label>

                    <Controller
                      control={control}
                      name={`phoneNumbers.${index}.messengers`}
                      render={({
                        field: { onChange, onBlur, value, name, ref },
                      }) => (
                        <Select
                          onChange={onChange}
                          onBlur={onBlur}
                          name={name}
                          value={value}
                          ref={ref}
                          placeholder={"Select messengers"}
                          mode="multiple"
                        >
                          {Object.keys(StoresEnum.PhoneNumberMessenger).map(
                            (phoneMessenger: string) => (
                              <Select.Option
                                key={phoneMessenger}
                                value={phoneMessenger}
                              >
                                {
                                  StoresEnum.PhoneNumberMessengerLabels[
                                    phoneMessenger as StoresEnum.PhoneNumberMessenger
                                  ]
                                }
                              </Select.Option>
                            )
                          )}
                        </Select>
                      )}
                    ></Controller>
                  </div>
                </div>
              </div>
            </Collapse>
          );
        }
      )}
    </ContainerTitle>
  );
};
