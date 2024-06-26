"use client";

import { useState } from "react";

import { Button, Col, message, Row } from "antd";
import moment from "moment";
import { SubmitHandler, useForm } from "react-hook-form";
import z from "zod";

import { SaveOutlined } from "@ant-design/icons";
import { zodResolver } from "@hookform/resolvers/zod";

import ContainerTitle from "../../../../../components/common/ContainerTitle/ContainerTitle";
import FormInput from "../../../../../components/common/FormInput/FormInput";
import { FormSelectOption } from "../../../../../components/common/FormSelect/FormSelect";
import FormTextarea from "../../../../../components/common/FormTextarea/FormTextarea";
import handleClientError from "../../../../../components/common/handleClientError/handleClientError";
import { SelectCustomAntd } from "../../../../../components/custom/antd/SelectCustomAntd/SelectCustomAntd";
import useAuthData from "../../../../../data/context/auth/useAuthData";
import { serviceMethodsInstance } from "../../../../../services/social-prices-api/ServiceMethods";
import IUser from "../../../../../shared/business/users/user.interface";
import UsersEnum from "../../../../../shared/business/users/users.enum";
import DatesEnum from "../../../../../shared/utils/dates/dates.enum";

interface Props {
  className?: string;
}

const formSchema = z.object({
  name: z.string().nonempty("Name is required"),
  birthDate: z.string().nonempty("Birth date is required"),
  gender: z.string().nullable(),
  about: z.string().nullable(),
});

type TFormSchema = z.infer<typeof formSchema>;

const ProfileEdit: React.FC<Props> = ({ className = "" }) => {
  const { user, updateUserSession } = useAuthData();

  const defaultValues: TFormSchema = {
    name: user?.name ?? "",
    birthDate: moment(user?.birthDate)
      .utc()
      .format(DatesEnum.Format.YYYYMMDD_DASHED),
    gender: user?.gender ?? UsersEnum.Gender.OTHER,
    about: user?.about ?? null,
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
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
          name: data.name,
          gender: data.gender as UsersEnum.Gender,
          about: data.about,
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
            loading={isSubmitting}
            type="primary"
            onClick={handleSubmit(onSubmit)}
            icon={<SaveOutlined />}
          >
            Save Profile
          </Button>
        }
      >
        <Row>
          <Col xs={24} md={8}>
            <FormInput
              label="Name"
              placeholder={"Enter name"}
              defaultValue={user?.name ?? ""}
              register={register}
              registerName="name"
              registerOptions={{ required: true }}
              errorMessage={errors.name?.message}
              maxLength={100}
            />
          </Col>

          <Col xs={24} md={8}>
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
          </Col>

          <Col xs={24} md={8}>
            <SelectCustomAntd<IUser>
              controller={{ control, name: "gender" }}
              label="Gender"
              errorMessage={errors.gender?.message}
              placeholder={"Select gender"}
            >
              {Object.keys(UsersEnum.Gender).map((gender: string) => (
                <FormSelectOption key={gender} value={gender}>
                  {UsersEnum.GenderLabels[gender as UsersEnum.Gender]}
                </FormSelectOption>
              ))}
            </SelectCustomAntd>
          </Col>
        </Row>

        <Row>
          <Col xs={24}>
            <FormTextarea
              label="About"
              placeholder={"Enter about"}
              defaultValue={user?.about ?? ""}
              register={register}
              registerName="about"
              rows={2}
            />
          </Col>
        </Row>
      </ContainerTitle>
    </form>
  );
};

export default ProfileEdit;
