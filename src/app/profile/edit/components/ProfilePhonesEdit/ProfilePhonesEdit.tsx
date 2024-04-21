"use client";

import { useState } from "react";

import { Button, message, Select, Tooltip } from "antd";
import {
  Controller,
  SubmitHandler,
  useFieldArray,
  useForm,
} from "react-hook-form";
import { z } from "zod";

import { SaveOutlined } from "@ant-design/icons";
import { zodResolver } from "@hookform/resolvers/zod";

import ButtonCommon from "../../../../../components/common/ButtonCommon/ButtonCommon";
import Collapse from "../../../../../components/common/Collapse/Collapse";
import ContainerTitle from "../../../../../components/common/ContainerTitle/ContainerTitle";
import FormInput from "../../../../../components/common/FormInput/FormInput";
import FormSelect, {
  FormSelectOption,
} from "../../../../../components/common/FormSelect/FormSelect";
import handleClientError from "../../../../../components/common/handleClientError/handleClientError";
import {
  IconPlus,
  IconTrash,
} from "../../../../../components/common/icons/icons";
import useAuthData from "../../../../../data/hook/useAuthData";
import { serviceMethodsInstance } from "../../../../../services/social-prices-api/ServiceMethods";
import IUser, {
  IPhoneNumber,
} from "../../../../../shared/business/users/user.interface";
import UsersEnum from "../../../../../shared/business/users/users.enum";
import { createPhoneNumberName } from "../../../../../shared/utils/string-extensions/string-extensions";

const phoneNumberFormSchema = z.object({
  uid: z.string(),
  type: z.string().nonempty("Phone type is required"),
  number: z.string().nonempty("Phone number is required"),
  isCollapsed: z.boolean().optional(),
  messengers: z.array(z.string()),
});

type TPhoneNumberFormSchema = z.infer<typeof phoneNumberFormSchema>;

const formSchema = z.object({
  phoneNumbers: z.array(phoneNumberFormSchema),
});

type TFormSchema = z.infer<typeof formSchema>;

interface Props {
  className?: string;
}

const generateNewAPhoneNumber = (
  isCollapsed: boolean = true
): TPhoneNumberFormSchema => ({
  number: "",
  type: UsersEnum.PhoneTypes.OTHER,
  isCollapsed,
  uid: Date.now().toString(),
  messengers: [],
});

const ProfilePhonesEdit: React.FC<Props> = ({ className = "" }) => {
  const { user, updateUserSession } = useAuthData();

  const defaultValues: TFormSchema = {
    phoneNumbers: user?.phoneNumbers?.length
      ? user.phoneNumbers.map((phoneNumber: IPhoneNumber, index: number) => ({
          ...phoneNumber,
          isCollapsed: index === 0,
        }))
      : [generateNewAPhoneNumber(false)],
  };

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<TFormSchema>({
    defaultValues,
    resolver: zodResolver(formSchema),
  });

  const { append, fields, remove } = useFieldArray({
    control,
    name: "phoneNumbers",
  });

  const [isSubmitting, setIsSUbmitting] = useState<boolean>(false);

  const onSubmit: SubmitHandler<TFormSchema> = async (data) => {
    try {
      setIsSUbmitting(true);

      const response: IUser =
        await serviceMethodsInstance.usersServiceMethods.updateUserPhoneNumbers(
          {
            phoneNumbers: data.phoneNumbers as IPhoneNumber[],
          }
        );

      message.success("Your Phone numbers information was updated!");

      updateUserSession(response);
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsSUbmitting(false);
    }
  };

  const addNewPhoneNumber = () => append(generateNewAPhoneNumber(true));

  const removeNewPhoneNumber = (index: number) => {
    remove(index);

    if (fields.length === 1) {
      addNewPhoneNumber();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={`w-full ${className}`}>
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
        extraHeader={
          <Button
            disabled={fields.length === 0}
            loading={isSubmitting}
            type="primary"
            onClick={handleSubmit(onSubmit)}
            icon={<SaveOutlined />}
          >
            Save Phones
          </Button>
        }
        className="mt-10"
      >
        {fields.map(
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
                className="relative mt-5 text-sm"
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
                      errorMessage={
                        errors?.phoneNumbers?.[index]?.type?.message
                      }
                    >
                      {Object.keys(UsersEnum.PhoneTypes).map(
                        (phoneType: string) => (
                          <FormSelectOption key={phoneType} value={phoneType}>
                            {UsersEnum.PhoneTypesLabels[phoneType]}
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
                            {Object.keys(UsersEnum.PhoneNumberMessenger).map(
                              (phoneMessenger: string) => (
                                <Select.Option
                                  key={phoneMessenger}
                                  value={phoneMessenger}
                                >
                                  {
                                    UsersEnum.PhoneNumberMessengerLabels[
                                      phoneMessenger as UsersEnum.PhoneNumberMessenger
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
    </form>
  );
};

export default ProfilePhonesEdit;
