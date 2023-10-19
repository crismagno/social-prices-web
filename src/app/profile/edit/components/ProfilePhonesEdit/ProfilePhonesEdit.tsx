"use client";

import { useState } from "react";

import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";

import Button from "../../../../../components/common/Button/Button";
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
import { usersServiceMethodsInstance } from "../../../../../services/social-prices-api/users/user-service.methods";
import IUser, {
  IPhoneNumber,
} from "../../../../../shared/business/users/user.interface";
import UsersEnum from "../../../../../shared/business/users/users.enum";
import { createPhoneNumberName } from "../../../../../shared/utils/string-extensions/string-extensions";

interface IProfileEditFormPhoneNumber extends IPhoneNumber {
  isCollapsed: boolean;
}

type IProfileEditForm = {
  phoneNumbers: IProfileEditFormPhoneNumber[];
};

interface Props {
  className?: string;
}

const generateNewAPhoneNumber = (
  isCollapsed: boolean = true
): IProfileEditFormPhoneNumber => ({
  number: "",
  type: UsersEnum.PhoneTypes.OTHER,
  isCollapsed,
});

const ProfilePhonesEdit: React.FC<Props> = ({ className }) => {
  const { user, updateUserSession } = useAuthData();

  const defaultValues: IProfileEditForm = {
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
  } = useForm<IProfileEditForm>({
    defaultValues,
  });

  const { append, fields, remove } = useFieldArray({
    control,
    name: "phoneNumbers",
  });

  const [isSubmitting, setIsSUbmitting] = useState<boolean>(false);

  const onSubmit: SubmitHandler<IProfileEditForm> = async (data) => {
    try {
      setIsSUbmitting(true);

      const response: IUser =
        await usersServiceMethodsInstance.updateUserPhoneNumbers({
          phoneNumbers: data.phoneNumbers,
        });

      updateUserSession(response);
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsSUbmitting(false);
    }
  };

  const addNewPhoneNumber = () => append(generateNewAPhoneNumber());

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
            <label className="mr-4">Phone Numbers</label>

            <Button
              onClick={addNewPhoneNumber}
              color="primary"
              className="rounded-r-full rounded-l-full"
            >
              {IconPlus()}
            </Button>
          </div>
        }
        extraHeader={
          <Button
            className="text-sm"
            color="success"
            disabled={fields.length === 0}
            loading={{
              isLoading: isSubmitting,
              height: 20,
              width: 20,
              element: "Updating",
            }}
          >
            Save Phone Numbers
          </Button>
        }
        className="mt-10"
      >
        {fields.map(
          (formPhoneNumber: IProfileEditFormPhoneNumber, index: number) => {
            const phoneNUmber: IProfileEditFormPhoneNumber = watch(
              `phoneNumbers.${index}`
            );

            const phoneNumberName: string = createPhoneNumberName(phoneNUmber);

            return (
              <Collapse
                key={index}
                collapsed={formPhoneNumber.isCollapsed}
                title={phoneNumberName.trim() || `Phone Number (${index + 1})`}
                className="relative mt-5"
                extraHeader={
                  <Button
                    onClick={() => removeNewPhoneNumber(index)}
                    color="transparent"
                    className="rounded-r-full rounded-l-full absolute right-2 shadow-none"
                  >
                    {IconTrash("w-3 h-3 text-red-500 hover:text-red-600")}
                  </Button>
                }
              >
                <div className="flex">
                  <div className="flex flex-col justify-start w-1/2">
                    <FormSelect
                      label="Country"
                      placeholder={"Select phone type"}
                      defaultValue={formPhoneNumber.type}
                      register={register}
                      registerName={`phoneNumbers.${index}.type`}
                      registerOptions={{ required: true }}
                      errorMessage={
                        errors?.phoneNumbers?.[index]?.type &&
                        "Phone type is required"
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
                        errors?.phoneNumbers?.[index]?.number &&
                        "Phone number is required"
                      }
                      maxLength={30}
                    />
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
