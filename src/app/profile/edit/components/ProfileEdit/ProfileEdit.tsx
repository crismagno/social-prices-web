"use client";

import { useState } from "react";

import { message } from "antd";
import moment from "moment";
import { SubmitHandler, useForm } from "react-hook-form";
import z from "zod";

import { zodResolver } from "@hookform/resolvers/zod";

import Button from "../../../../../components/common/Button/Button";
import ContainerTitle from "../../../../../components/common/ContainerTitle/ContainerTitle";
import FormInput from "../../../../../components/common/FormInput/FormInput";
import FormSelect, {
  FormSelectOption,
} from "../../../../../components/common/FormSelect/FormSelect";
import handleClientError from "../../../../../components/common/handleClientError/handleClientError";
import useAuthData from "../../../../../data/hook/useAuthData";
import { serviceMethodsInstance } from "../../../../../services/social-prices-api/ServiceMethods";
import IUser from "../../../../../shared/business/users/user.interface";
import UsersEnum from "../../../../../shared/business/users/users.enum";
import DatesEnum from "../../../../../shared/utils/dates/dates.enum";

interface Props {
  className?: string;
}

const formSchema = z.object({
  firstName: z.string().nonempty("First name is required"),
  lastName: z.string().nonempty("Last name is required"),
  birthDate: z.string().nonempty("Birth date name is required"),
  middleName: z.string().nullable(),
  gender: z.string().nullable(),
});

type TFormSchema = z.infer<typeof formSchema>;

const ProfileEdit: React.FC<Props> = ({ className = "" }) => {
  const { user, updateUserSession } = useAuthData();

  const defaultValues: TFormSchema = {
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    birthDate: moment(user?.birthDate)
      .utc()
      .format(DatesEnum.Format.YYYYMMDD_DASHED),
    gender: user?.gender ?? UsersEnum.Gender.OTHER,
    middleName: user?.middleName ?? null,
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TFormSchema>({
    defaultValues,
    resolver: zodResolver(formSchema),
  });

  const [isSubmitting, setIsSUbmitting] = useState<boolean>(false);

  const onSubmit: SubmitHandler<TFormSchema> = async (data: TFormSchema) => {
    try {
      setIsSUbmitting(true);

      const response: IUser =
        await serviceMethodsInstance.usersServiceMethods.updateUser({
          birthDate: moment(data.birthDate).toDate(),
          firstName: data.firstName,
          gender: data.gender,
          lastName: data.lastName,
          middleName: data.middleName ?? null,
        });

      message.success("Your basic information was updated!");

      updateUserSession(response);
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsSUbmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={`w-full ${className}`}>
      <ContainerTitle
        title="Profile"
        className="mt-10"
        extraHeader={
          <Button
            color="success"
            className="text-sm"
            onClick={handleSubmit(onSubmit)}
            loading={{
              isLoading: isSubmitting,
              height: 20,
              width: 20,
              element: "Updating",
            }}
          >
            Save Profile
          </Button>
        }
      >
        <div className="flex">
          <div className="flex flex-col justify-start w-1/2">
            <FormInput
              label="First name"
              placeholder={"Enter first name"}
              defaultValue={user?.firstName ?? ""}
              register={register}
              registerName="firstName"
              registerOptions={{ required: true }}
              errorMessage={errors.firstName?.message}
              maxLength={100}
            />

            <FormInput
              label="Middle name"
              placeholder={"Enter middle name"}
              defaultValue={user?.middleName ?? ""}
              register={register}
              registerName="middleName"
              maxLength={100}
            />

            <FormInput
              label="Last name"
              placeholder={"Enter last name"}
              defaultValue={user?.lastName ?? ""}
              register={register}
              registerName="lastName"
              registerOptions={{ required: true }}
              errorMessage={errors.lastName?.message}
              maxLength={100}
            />
          </div>

          <div className="flex flex-col justify-start w-1/2">
            <FormInput
              label="Birth date"
              type="date"
              placeholder={"Enter birth date"}
              defaultValue={moment(user?.birthDate)
                .utc()
                .format(DatesEnum.Format.YYYYMMDD_DASHED)}
              register={register}
              registerName="birthDate"
              registerOptions={{ required: true }}
              errorMessage={errors.birthDate?.message}
            />

            <FormSelect
              label="Gender"
              placeholder={"Select gender"}
              defaultValue={user?.gender ?? UsersEnum.Gender.MALE}
              register={register}
              registerName="gender"
            >
              {Object.keys(UsersEnum.Gender).map((gender: any) => (
                <FormSelectOption key={gender} value={gender}>
                  {UsersEnum.GenderLabels[gender]}
                </FormSelectOption>
              ))}
            </FormSelect>
          </div>
        </div>
      </ContainerTitle>
    </form>
  );
};

export default ProfileEdit;
