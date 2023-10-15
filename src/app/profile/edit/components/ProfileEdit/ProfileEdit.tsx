"use client";

import { SubmitHandler, useForm } from "react-hook-form";

import Button from "../../../../../components/common/Button/Button";
import ContainerTitle from "../../../../../components/common/ContainerTitle/ContainerTitle";
import FormInput from "../../../../../components/common/FormInput/FormInput";
import FormSelect, {
  FormSelectOption,
} from "../../../../../components/common/FormSelect/FormSelect";
import useAuthData from "../../../../../data/hook/useAuthData";
import UsersEnum from "../../../../../shared/business/users/users.enum";

type IProfileEditForm = {
  firstName: string;
  middleName?: string;
  lastName: string;
  birthDate?: Date;
  gender?: UsersEnum.Gender;
};

interface Props {
  className?: string;
}

const ProfileEdit: React.FC<Props> = ({ className }) => {
  const { user } = useAuthData();

  const defaultValues: IProfileEditForm = {
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    birthDate: user?.birthDate ?? new Date(),
    gender: user?.gender ?? UsersEnum.Gender.OTHER,
    middleName: user?.middleName ?? "",
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IProfileEditForm>({
    defaultValues,
  });

  const onSubmit: SubmitHandler<IProfileEditForm> = (data) => console.log(data);

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
              errorMessage={errors.firstName && "First name is required"}
            />

            <FormInput
              label="Middle name"
              placeholder={"Enter middle name"}
              defaultValue={user?.middleName ?? ""}
              register={register}
              registerName="middleName"
            />

            <FormInput
              label="Last name"
              placeholder={"Enter last name"}
              defaultValue={user?.lastName ?? ""}
              register={register}
              registerName="lastName"
              registerOptions={{ required: true }}
              errorMessage={errors.lastName && "Last name is required"}
            />
          </div>

          <div className="flex flex-col justify-start w-1/2">
            <FormInput
              label="Birth date"
              type="datetime-local"
              placeholder={"Enter birth date"}
              defaultValue={user?.birthDate ?? ""}
              register={register}
              registerName="birthDate"
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
