"use client";

import { useState } from "react";

import { Button, message } from "antd";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

import { SaveOutlined } from "@ant-design/icons";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Addresses,
  addressFormSchema,
  countries,
  generateNewAddress,
  states,
} from "../../../../../components/common/Addresses/Addresses";
import handleClientError from "../../../../../components/common/handleClientError/handleClientError";
import useAuthData from "../../../../../data/context/auth/useAuthData";
import { serviceMethodsInstance } from "../../../../../services/social-prices-api/ServiceMethods";
import { IAddress } from "../../../../../shared/business/interfaces/address.interface";
import IUser from "../../../../../shared/business/users/user.interface";

const formSchema = z.object({
  addresses: z.array(addressFormSchema),
});

type TFormSchema = z.infer<typeof formSchema>;

interface Props {
  className?: string;
}

const ProfileAddressesEdit: React.FC<Props> = ({ className = "" }) => {
  const { user, updateUserSession } = useAuthData();

  const defaultValues: TFormSchema = {
    addresses: user?.addresses?.length
      ? user.addresses.map((address: IAddress, index: number) => ({
          ...address,
          countryCode: address.country?.code,
          stateCode: address.state?.code ?? "",
          isCollapsed: index === 0,
        }))
      : [generateNewAddress(false)],
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

      const addresses: IAddress[] = data.addresses.map(
        (address): IAddress => ({
          ...address,
          country: {
            code: address.countryCode,
            name:
              countries.find((country) => country.code === address.countryCode)
                ?.name ?? "",
          },
          state: {
            code: address.stateCode ?? "",
            name:
              states.find((state) => state.code === address.stateCode)?.name ??
              "",
          },
        })
      );

      const response: IUser =
        await serviceMethodsInstance.usersServiceMethods.updateUserAddresses({
          addresses,
        });

      message.success("Your addresses information was updated!");

      updateUserSession(response);
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsSUbmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={`w-full ${className}`}>
      <Addresses
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
            Save Addresses
          </Button>
        }
      />
    </form>
  );
};

export default ProfileAddressesEdit;
