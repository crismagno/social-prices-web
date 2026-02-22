"use client";

import { useState } from 'react';

import {
  Button,
  message,
} from 'antd';
import {
  SubmitHandler,
  useForm,
} from 'react-hook-form';
import { z } from 'zod';

import { SaveOutlined } from '@ant-design/icons';
import { zodResolver } from '@hookform/resolvers/zod';

import handleClientError
  from '../../../../../components/common/HandleClientError/HandleClientError';
import {
  generateNewPhoneNumber,
  phoneNumberFormSchema,
  PhoneNumbers,
} from '../../../../../components/common/PhoneNumbers/PhoneNumbers';
import useAuthData from '../../../../../data/context/auth/useAuthData';
import useLanguageData
  from '../../../../../data/context/language/useLanguageData';
import {
  serviceMethodsInstance,
} from '../../../../../services/social-prices-api/service-methods';
import {
  IPhoneNumber,
} from '../../../../../shared/business/shared/phone/phone-number.interface';
import IUser from '../../../../../shared/business/users/user.interface';

const formSchema = z.object({
  phoneNumbers: z.array(phoneNumberFormSchema),
});

type TFormSchema = z.infer<typeof formSchema>;

interface Props {
  className?: string;
}

const ProfilePhonesEdit: React.FC<Props> = ({ className = "" }) => {
  const { user, updateUserSession } = useAuthData();
  const { t } = useLanguageData()!;

  const defaultValues: TFormSchema = {
    phoneNumbers: user?.phoneNumbers?.length
      ? user.phoneNumbers.map((phoneNumber: IPhoneNumber, index: number) => ({
          ...phoneNumber,
          isCollapsed: index === 0,
        }))
      : [generateNewPhoneNumber(false)],
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

      const response: IUser =
        await serviceMethodsInstance.usersServiceMethods.updateUserPhoneNumbers(
          {
            phoneNumbers: data.phoneNumbers as IPhoneNumber[],
          }
        );

      message.success(t("profile.phoneNumbersInfoUpdated"));

      updateUserSession(response);
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={`w-full ${className}`}>
      <PhoneNumbers
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
            {t("profile.savePhones")}
          </Button>
        }
      />
    </form>
  );
};

export default ProfilePhonesEdit;
