"use client";

import { useEffect, useState } from "react";

import {
  App,
  Button,
  Card,
  Col,
  Divider,
  Row,
  Select,
  Tooltip,
  UploadFile,
} from "antd";
import { RcFile } from "antd/es/upload";
import { isArray } from "class-validator";
import moment from "moment";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import {
  ReadonlyURLSearchParams,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import z from "zod";

import { EnterOutlined } from "@ant-design/icons";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Addresses,
  addressFormSchema,
  countries,
  generateNewAddress,
  states,
} from "../../../components/common/Addresses/Addresses";
import Avatar from "../../../components/common/Avatar/Avatar";
import handleClientError from "../../../components/common/HandleClientError/HandleClientError";
import HrCustom from "../../../components/common/HrCustom/HrCustom";
import ImageModal from "../../../components/common/ImageModal/ImageModal";
import LoadingFull from "../../../components/common/LoadingFull/LoadingFull";
import {
  generateNewPhoneNumber,
  phoneNumberFormSchema,
  PhoneNumbers,
} from "../../../components/common/PhoneNumbers/PhoneNumbers";
import { TagTagCustomAntd } from "../../../components/common/TagTagCustomAntd/TagTagCustomAntd";
import { InputCustomAntd } from "../../../components/custom/antd/InputCustomAntd/InputCustomAntd";
import { SelectCustomAntd } from "../../../components/custom/antd/SelectCustomAntd/SelectCustomAntd";
import { TextareaCustomAntd } from "../../../components/custom/antd/TextareaCustomAntd/TextareaCustomAntd";
import Layout from "../../../components/template/Layout/Layout";
import useLanguageData from "../../../data/context/language/useLanguageData";
import CreateCustomerDto from "../../../services/social-prices-api/customers/dto/createCustomer.dto";
import UpdateCustomerDto from "../../../services/social-prices-api/customers/dto/updateCustomer.dto";
import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import { ICustomer } from "../../../shared/business/customers/customer.interface";
import AddressEnum from "../../../shared/business/shared/address/address.enum";
import { IAddress } from "../../../shared/business/shared/address/address.interface";
import PersonEnum from "../../../shared/business/shared/person/person.enum";
import { IPhoneNumber } from "../../../shared/business/shared/phone/phone-number.interface";
import TagsEnum from "../../../shared/business/tags/tags.enum";
import { ITag } from "../../../shared/business/tags/tags.interface";
import Urls from "../../../shared/common/routes-app/routes-app";
import { sortArray } from "../../../shared/utils/array/array-functions";
import DatesEnum from "../../../shared/utils/dates/dates.enum";
import { getFileUrl } from "../../../shared/utils/images/images-helper";
import { getImageUrl } from "../../../shared/utils/images/images-url";
import { useFindTagsByType } from "../../tags/useFindTagsByType";
import { useFindCustomerById } from "./useFindCustomerById";

const formSchema = z.object({
  name: z.string().trim().nonempty("Name is required"),
  email: z.string().trim().email().nonempty("Email is required"),
  addresses: z.array(addressFormSchema),
  phoneNumbers: z.array(phoneNumberFormSchema),
  about: z.string().trim().nullable(),
  birthDate: z.string().nullable(),
  gender: z.string().nullable(),
  tagsIds: z.array(z.string()),
  uniqName: z.string().trim().nullable(),
});

type TFormSchema = z.infer<typeof formSchema>;

export default function CustomerDetailPage() {
  const { message } = App.useApp();
  const { t } = useLanguageData()!;
  const router: AppRouterInstance = useRouter();

  const searchParams: ReadonlyURLSearchParams = useSearchParams();

  const customerId: string | null = searchParams.get("cid");

  const { customer, isLoading } = useFindCustomerById(customerId);

  const { tags, isLoading: isLoadingTags } = useFindTagsByType(
    TagsEnum.Type.CUSTOMER,
  );

  const [formValues, setFormValues] = useState<TFormSchema>();

  const isEditMode: boolean = !!customerId && !!customer;

  const {
    handleSubmit,
    formState: { errors },
    control,
    watch,
  } = useForm<TFormSchema>({
    values: formValues,
    resolver: zodResolver(formSchema),
  });

  const [isVisibleEditAvatarModal, setIsVisibleAvatarModal] =
    useState<boolean>(false);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const [avatarUrl, setAvatarUrl] = useState<string | null>();

  useEffect(() => {
    if (customer?.avatar) {
      const url: string = getImageUrl(customer.avatar);
      setAvatarUrl(url);
    }

    const values: TFormSchema = {
      about: customer?.about ?? null,
      name: customer?.name ?? "",
      email: customer?.email ?? "",
      birthDate: moment(customer?.birthDate)
        .utc()
        .format(DatesEnum.Format.YYYYMMDD_DASHED),
      addresses: customer?.addresses.length
        ? customer.addresses.map((address: IAddress, index: number) => ({
            ...address,
            countryCode: address.country?.code,
            stateCode: address.state?.code ?? "",
            isCollapsed: index === 0,
          }))
        : [generateNewAddress(false)],
      phoneNumbers: customer?.phoneNumbers.length
        ? customer?.phoneNumbers.map(
            (phoneNumber: IPhoneNumber, index: number) => ({
              ...phoneNumber,
              isCollapsed: index === 0,
            }),
          )
        : [generateNewPhoneNumber(false)],
      gender: customer?.gender ?? PersonEnum.Gender.OTHER,
      tagsIds: customer?.tagsIds ?? [],
      uniqName: customer?.uniqName ?? null,
    };

    setFormValues(values);
  }, [customer]);

  if ((customerId && isLoading) || isLoadingTags) {
    return <LoadingFull />;
  }

  const onSubmit: SubmitHandler<TFormSchema> = async (data: TFormSchema) => {
    if (isEditMode) {
      await handleUpdate(data);
    } else {
      await handleCreate(data);
    }
  };

  const handleCreate = async (data: TFormSchema) => {
    try {
      setIsSubmitting(true);

      const formData = new FormData();

      if (fileList.length) {
        formData.append("avatar", fileList[0].originFileObj as RcFile);
      }

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
        }),
      );

      const createCustomerDto: CreateCustomerDto = {
        about: data.about ?? "",
        addresses,
        birthDate: moment(data.birthDate).toDate(),
        email: data.email,
        name: data.name,
        gender: data.gender as PersonEnum.Gender,
        phoneNumbers: data.phoneNumbers,
        tagsIds: data.tagsIds,
        uniqName: data.uniqName,
      };

      for (const property of Object.keys(createCustomerDto)) {
        let value: any = createCustomerDto[property];

        if (isArray(value)) {
          value = JSON.stringify(value);
        }

        formData.append([`${property}`], value);
      }

      await serviceMethodsInstance.customersServiceMethods.create(formData);

      message.success(t("customers.customerCreatedSuccessfully"));

      router.back();
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: TFormSchema) => {
    try {
      if (!customer) {
        message.warning(t("customers.customerNotFoundToUpdate"));
        return;
      }

      setIsSubmitting(true);

      const formData = new FormData();

      if (fileList.length) {
        formData.append("avatar", fileList[0].originFileObj as RcFile);
      }

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
        }),
      );

      const updateCustomerDto: UpdateCustomerDto = {
        about: data.about ?? "",
        addresses,
        birthDate: moment(data.birthDate).toDate(),
        email: data.email,
        name: data.name,
        gender: data.gender as PersonEnum.Gender,
        phoneNumbers: data.phoneNumbers,
        tagsIds: data.tagsIds,
        customerId: customer._id,
        uniqName: data.uniqName,
      };

      for (const property of Object.keys(updateCustomerDto)) {
        let value: keyof UpdateCustomerDto = updateCustomerDto[property];

        if (isArray(value)) {
          value = JSON.stringify(value) as keyof UpdateCustomerDto;
        }

        formData.append([`${property}`] as any, value);
      }

      await serviceMethodsInstance.customersServiceMethods.update(formData);

      message.success(t("customers.customerUpdatedSuccessfully"));

      router.back();
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onImageModalOk = async (_: any, fileList: UploadFile<any>[]) => {
    setIsVisibleAvatarModal(false);
    setFileList(fileList);

    let url: string | null = customer?.avatar
      ? getImageUrl(customer.avatar)
      : null;

    if (fileList.length) {
      url = await getFileUrl(fileList?.[0]);
    }

    setAvatarUrl(url);
  };

  return (
    <Layout
      subtitle={
        isEditMode
          ? t("customers.editCustomerDetails")
          : t("customers.newCustomerDetails")
      }
      title={
        isEditMode
          ? `${t("customers.editCustomer")}: ${customer?.name}`
          : t("customers.newCustomer")
      }
      hasBackButton
    >
      <Card className="h-min-80 mt-2">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex justify-center w-full">
            <div className="cursor-pointer z-10">
              <Tooltip title={t("profile.editAvatar")} placement="bottom">
                <Avatar
                  src={avatarUrl}
                  width={180}
                  className="shadow-lg border-none"
                  onClick={() => setIsVisibleAvatarModal(true)}
                  noUseAwsS3
                />

                <ImageModal
                  isVisible={isVisibleEditAvatarModal}
                  onCancel={() => setIsVisibleAvatarModal(false)}
                  onOk={onImageModalOk}
                  url={avatarUrl}
                />
              </Tooltip>
            </div>
          </div>

          {customer && (
            <Row gutter={24} justify={"end"}>
              <Col>
                <Tooltip title={t("customers.goToCustomer")}>
                  <Button
                    type="primary"
                    onClick={() =>
                      router.push(
                        Urls.CUSTOMER.replace(":customerId", customer!._id),
                      )
                    }
                    icon={<EnterOutlined />}
                  >
                    {t("customers.customer")}
                  </Button>
                </Tooltip>
              </Col>
            </Row>
          )}

          <Divider className="mt-6" />

          <Row className="mt-10">
            <Col xs={24} md={8}>
              <InputCustomAntd
                controller={{ control, name: "name" }}
                label={t("common.name")}
                placeholder={t("placeholders.enterName")}
                errorMessage={errors.name?.message}
                maxLength={200}
              />
            </Col>

            <Col xs={24} md={8}>
              <InputCustomAntd
                controller={{ control, name: "uniqName" }}
                label={t("customers.uniqName")}
                placeholder={t("customers.enterUniqName")}
                errorMessage={errors.uniqName?.message}
                maxLength={200}
              />
            </Col>

            <Col xs={24} md={8}>
              <InputCustomAntd
                controller={{ control, name: "email" }}
                label={t("common.email")}
                placeholder={t("placeholders.enterEmail")}
                errorMessage={errors.email?.message}
                maxLength={200}
                type="email"
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
              <SelectCustomAntd<ICustomer>
                controller={{ control, name: "gender" }}
                label={t("customers.gender")}
                errorMessage={errors.gender?.message}
              >
                {Object.keys(PersonEnum.Gender).map((gender: string) => (
                  <Select.Option key={gender} value={gender}>
                    {t(PersonEnum.GenderLabels[gender as PersonEnum.Gender])}
                  </Select.Option>
                ))}
              </SelectCustomAntd>
            </Col>

            <Col xs={24} md={8}>
              <SelectCustomAntd<ICustomer>
                controller={{ control, name: "tagsIds" }}
                label={t("tags.title")}
                errorMessage={errors.tagsIds?.message}
                placeholder={t("tags.selectTags")}
                mode="multiple"
              >
                {sortArray(tags, "name").map((tag: ITag) => (
                  <Select.Option key={tag._id} value={tag._id}>
                    <TagTagCustomAntd tag={tag} useTag={false} />
                  </Select.Option>
                ))}
              </SelectCustomAntd>
            </Col>
          </Row>

          <Row>
            <Col xs={24}>
              <TextareaCustomAntd
                label={t("customers.about")}
                controller={{ control, name: "about" }}
                placeholder={t("placeholders.enterAbout")}
                rows={2}
              />
            </Col>
          </Row>

          <Addresses control={control} errors={errors} watch={watch} />

          <PhoneNumbers control={control} errors={errors} watch={watch} />

          <HrCustom className="my-7" />

          <div className="flex justify-center my-5">
            <Button
              type="default"
              className="mr-2"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              {t("common.cancel")}
            </Button>

            <Button
              type="primary"
              onClick={handleSubmit(onSubmit)}
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              {isEditMode ? t("common.save") : t("common.create")}
            </Button>
          </div>
        </form>
      </Card>
    </Layout>
  );
}
