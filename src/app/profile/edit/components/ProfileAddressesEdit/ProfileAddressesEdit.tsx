"use client";

import { useState } from 'react';

import {
  App,
  Button,
} from 'antd';
import {
  SubmitHandler,
  useForm,
} from 'react-hook-form';
import { z } from 'zod';

import { SaveOutlined } from '@ant-design/icons';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  Addresses,
  addressFormSchema,
  countries,
  generateNewAddress,
  states,
} from '../../../../../components/common/Addresses/Addresses';
import handleClientError
  from '../../../../../components/common/HandleClientError/HandleClientError';
import useAuthData from '../../../../../data/context/auth/useAuthData';
import useLanguageData
  from '../../../../../data/context/language/useLanguageData';
import {
  serviceMethodsInstance,
} from '../../../../../services/social-prices-api/service-methods';
import AddressEnum
  from '../../../../../shared/business/shared/address/address.enum';
import {
  IAddress,
} from '../../../../../shared/business/shared/address/address.interface';
import IUser from '../../../../../shared/business/users/user.interface';

const formSchema = z.object({
  addresses: z.array(addressFormSchema),
});

type TFormSchema = z.infer<typeof formSchema>;

interface Props {
  className?: string;
}

const ProfileAddressesEdit: React.FC<Props> = ({ className = "" }) => {
  const { message } = App.useApp();
  const { user, updateUserSession } = useAuthData();
  const { t } = useLanguageData()!;

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
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<TFormSchema>({
    defaultValues,
    resolver: zodResolver(formSchema),
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const onSubmit: SubmitHandler<TFormSchema> = async (data) => {
    try {
      setIsSubmitting(true);

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
          types: address.types as AddressEnum.Type[],
        })
      );

      const response: IUser =
        await serviceMethodsInstance.usersServiceMethods.updateUserAddresses({
          addresses,
        });

      message.success(t("profile.addressesInfoUpdated"));

      updateUserSession(response);
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={`w-full ${className}`}>
      <Addresses
        control={control}
        errors={errors}
        watch={watch}
        containerExtraHeader={
          <Button
            loading={isSubmitting}
            type="primary"
            onClick={handleSubmit(onSubmit)}
            icon={<SaveOutlined />}
          >
            {t("profile.saveAddresses")}
          </Button>
        }
      />
    </form>
  );
};

export default ProfileAddressesEdit;
