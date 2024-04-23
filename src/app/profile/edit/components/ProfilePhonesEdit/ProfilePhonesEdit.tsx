"use client";

import { useState } from "react";

import { Button, message } from "antd";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

import { SaveOutlined } from "@ant-design/icons";
import { zodResolver } from "@hookform/resolvers/zod";

import handleClientError from "../../../../../components/common/handleClientError/handleClientError";
import {
  generateNewAPhoneNumber,
  phoneNumberFormSchema,
  PhoneNumbers,
} from "../../../../../components/common/PhoneNumbers/PhoneNumbers";
import useAuthData from "../../../../../data/hook/useAuthData";
import { serviceMethodsInstance } from "../../../../../services/social-prices-api/ServiceMethods";
import { IPhoneNumber } from "../../../../../shared/business/interfaces/phone-number";
import IUser from "../../../../../shared/business/users/user.interface";

const formSchema = z.object({
  phoneNumbers: z.array(phoneNumberFormSchema),
});

type TFormSchema = z.infer<typeof formSchema>;

interface Props {
  className?: string;
}

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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={`w-full ${className}`}>
      <PhoneNumbers
        control={control}
        errors={errors}
        register={register}
        watch={watch}
        containerExtraHeader={
          <Button
            loading={isSubmitting}
            type="primary"
            onClick={handleSubmit(onSubmit)}
            icon={<SaveOutlined />}
          >
            Save Phones
          </Button>
        }
      />
    </form>
  );
};

export default ProfilePhonesEdit;
