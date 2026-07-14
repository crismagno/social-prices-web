"use client";

import { useMemo, useState } from "react";

import { App, Button, Col, Row, Select } from "antd";
import moment from "moment";
import { SubmitHandler, useForm } from "react-hook-form";
import z from "zod";

import { SaveOutlined } from "@ant-design/icons";
import { zodResolver } from "@hookform/resolvers/zod";

import ContainerTitle from "../../../../../components/common/ContainerTitle/ContainerTitle";
import handleClientError from "../../../../../components/common/HandleClientError/HandleClientError";
import { InputCustomAntd } from "../../../../../components/custom/antd/InputCustomAntd/InputCustomAntd";
import { SelectCustomAntd } from "../../../../../components/custom/antd/SelectCustomAntd/SelectCustomAntd";
import { TextareaCustomAntd } from "../../../../../components/custom/antd/TextareaCustomAntd/TextareaCustomAntd";
import useAuthData from "../../../../../data/context/auth/useAuthData";
import useLanguageData from "../../../../../data/context/language/useLanguageData";
import { serviceMethodsInstance } from "../../../../../services/social-prices-api/service-methods";
import PersonEnum from "../../../../../shared/business/shared/person/person.enum";
import IUser from "../../../../../shared/business/users/user.interface";
import DatesEnum from "../../../../../shared/utils/dates/dates.enum";

interface Props {
  className?: string;
}

const _baseFormSchema = z.object({
  name: z.string().trim(),
  birthDate: z.string(),
  gender: z.string().nullable(),
  about: z.string().trim().nullable(),
});

type TFormSchema = z.infer<typeof _baseFormSchema>;

const ProfileEdit: React.FC<Props> = ({ className = "" }) => {
  const { message } = App.useApp();
  const { user, updateUserSession } = useAuthData();
  const { t } = useLanguageData()!;

  const formSchema = useMemo(
    () =>
      z.object({
        name: z.string().trim().nonempty(t("errors.nameRequired")),
        birthDate: z.string().nonempty(t("errors.birthDateRequired")),
        gender: z.string().nullable(),
        about: z.string().trim().nullable(),
      }),
    [t],
  );

  const defaultValues: TFormSchema = {
    name: user?.name ?? "",
    birthDate: moment(user?.birthDate)
      .utc()
      .format(DatesEnum.Format.YYYYMMDD_DASHED),
    gender: user?.gender ?? PersonEnum.Gender.OTHER,
    about: user?.about ?? null,
  };

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<TFormSchema>({
    defaultValues,
    resolver: zodResolver(formSchema),
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const onSubmit: SubmitHandler<TFormSchema> = async (data: TFormSchema) => {
    try {
      setIsSubmitting(true);

      const response: IUser =
        await serviceMethodsInstance.usersServiceMethods.updateUser({
          birthDate: moment(data.birthDate).toDate(),
          name: data.name,
          gender: data.gender as PersonEnum.Gender,
          about: data.about,
        });

      message.success(t("profile.basicInfoUpdated"));

      updateUserSession(response);
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={`w-full ${className}`}>
      <ContainerTitle
        title={t("navigation.profile")}
        className="mt-10"
        extraHeader={
          <Button
            loading={isSubmitting}
            type="primary"
            onClick={handleSubmit(onSubmit)}
            icon={<SaveOutlined />}
          >
            {t("profile.saveProfile")}
          </Button>
        }
      >
        <Row>
          <Col xs={24} md={8}>
            <InputCustomAntd
              controller={{ control, name: "name" }}
              label={t("common.name")}
              errorMessage={errors.name?.message}
              maxLength={100}
              placeholder={t("placeholders.enterName")}
            />
          </Col>

          <Col xs={24} md={8}>
            <InputCustomAntd
              controller={{ control, name: "birthDate" }}
              label={t("customers.birthDate")}
              type="date"
              placeholder={t("placeholders.enterBirthDate")}
              errorMessage={errors.birthDate?.message}
            />
          </Col>

          <Col xs={24} md={8}>
            <SelectCustomAntd<IUser>
              controller={{ control, name: "gender" }}
              label={t("customers.gender")}
              errorMessage={errors.gender?.message}
              placeholder={t("placeholders.selectGender")}
            >
              {Object.keys(PersonEnum.Gender).map((gender: string) => (
                <Select.Option key={gender} value={gender}>
                  {t(PersonEnum.GenderLabels[gender as PersonEnum.Gender])}
                </Select.Option>
              ))}
            </SelectCustomAntd>
          </Col>
        </Row>

        <Row>
          <Col xs={24}>
            <TextareaCustomAntd
              controller={{ control, name: "about" }}
              label={t("customers.about")}
              placeholder={t("placeholders.enterAbout")}
              rows={2}
            />
          </Col>
        </Row>
      </ContainerTitle>
    </form>
  );
};

export default ProfileEdit;
