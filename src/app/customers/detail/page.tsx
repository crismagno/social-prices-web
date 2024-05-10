"use client";

import { useEffect, useState } from "react";

import {
  Button,
  Card,
  Col,
  message,
  Row,
  Select,
  Tooltip,
  UploadFile,
} from "antd";
import { RcFile } from "antd/es/upload";
import { isArray } from "class-validator";
import moment from "moment";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context";
import {
  ReadonlyURLSearchParams,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import z from "zod";

import { zodResolver } from "@hookform/resolvers/zod";

import {
  Addresses,
  addressFormSchema,
  countries,
  generateNewAddress,
  states,
} from "../../../components/common/Addresses/Addresses";
import Avatar from "../../../components/common/Avatar/Avatar";
import FormInput from "../../../components/common/FormInput/FormInput";
import FormTextarea from "../../../components/common/FormTextarea/FormTextarea";
import handleClientError from "../../../components/common/handleClientError/handleClientError";
import HrCustom from "../../../components/common/HrCustom/HrCustom";
import ImageModal from "../../../components/common/ImageModal/ImageModal";
import LoadingFull from "../../../components/common/LoadingFull/LoadingFull";
import {
  generateNewAPhoneNumber,
  phoneNumberFormSchema,
  PhoneNumbers,
} from "../../../components/common/PhoneNumbers/PhoneNumbers";
import { SelectCustomAntd } from "../../../components/custom/antd/SelectCustomAntd/SelectCustomAntd";
import Layout from "../../../components/template/Layout/Layout";
import CreateCustomerDto from "../../../services/social-prices-api/customers/dto/createCustomer.dto";
import UpdateCustomerDto from "../../../services/social-prices-api/customers/dto/updateCustomer.dto";
import { serviceMethodsInstance } from "../../../services/social-prices-api/ServiceMethods";
import { ICustomer } from "../../../shared/business/customers/customer.interface";
import AddressEnum from "../../../shared/business/enums/address.enum";
import { IAddress } from "../../../shared/business/interfaces/address.interface";
import { IPhoneNumber } from "../../../shared/business/interfaces/phone-number";
import UsersEnum from "../../../shared/business/users/users.enum";
import DatesEnum from "../../../shared/utils/dates/dates.enum";
import { getFileUrl } from "../../../shared/utils/images/helper";
import { getImageUrl } from "../../../shared/utils/images/url-images";
import { useFindCustomerById } from "./useFindCustomerById";

const formSchema = z.object({
  name: z.string().nonempty("Name is required"),
  email: z.string().email().nonempty("Email is required"),
  addresses: z.array(addressFormSchema),
  phoneNumbers: z.array(phoneNumberFormSchema),
  about: z.string().nullable(),
  birthDate: z.string().nullable(),
  gender: z.string().nullable(),
});

type TFormSchema = z.infer<typeof formSchema>;

export default function CustomerDetailPage() {
  const router: AppRouterInstance = useRouter();

  const searchParams: ReadonlyURLSearchParams = useSearchParams();

  const customerId: string | null = searchParams.get("cid");

  const { customer, isLoading } = useFindCustomerById(customerId);

  const [formValues, setFormValues] = useState<TFormSchema>();

  const isEditMode: boolean = !!customerId && !!customer;

  const {
    register,
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

  const [isSubmitting, setIsSUbmitting] = useState<boolean>(false);

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
            })
          )
        : [generateNewAPhoneNumber(false)],
      gender: customer?.gender ?? UsersEnum.Gender.OTHER,
    };

    setFormValues(values);
  }, [customer]);

  if (customerId && isLoading) {
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
      setIsSUbmitting(true);

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
        })
      );

      const createCustomerDto: CreateCustomerDto = {
        about: data.about ?? "",
        addresses,
        birthDate: moment(data.birthDate).toDate(),
        email: data.email,
        name: data.name,
        gender: data.gender as UsersEnum.Gender,
        phoneNumbers: data.phoneNumbers,
      };

      for (const property of Object.keys(createCustomerDto)) {
        let value: any = createCustomerDto[property];

        if (isArray(value)) {
          value = JSON.stringify(value);
        }

        formData.append([`${property}`], value);
      }

      await serviceMethodsInstance.customersServiceMethods.create(formData);

      message.success("Your customer has been created successfully!");

      router.back();
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsSUbmitting(false);
    }
  };

  const handleUpdate = async (data: TFormSchema) => {
    try {
      if (!customer) {
        message.warning("Customer not found to update!");
        return;
      }

      setIsSUbmitting(true);

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
        })
      );

      const updateCustomerDto: UpdateCustomerDto = {
        about: data.about ?? "",
        addresses,
        birthDate: moment(data.birthDate).toDate(),
        email: data.email,
        name: data.name,
        gender: data.gender as UsersEnum.Gender,
        phoneNumbers: data.phoneNumbers,
        customerId: customer._id,
      };

      for (const property of Object.keys(updateCustomerDto)) {
        let value: keyof UpdateCustomerDto = updateCustomerDto[property];

        if (isArray(value)) {
          value = JSON.stringify(value);
        }

        formData.append([`${property}`], value);
      }

      await serviceMethodsInstance.customersServiceMethods.update(formData);

      message.success("Your customer has been updated successfully!");

      router.back();
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsSUbmitting(false);
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
      subtitle={isEditMode ? "Edit customer details" : "New customer details"}
      title={isEditMode ? "Edit customer" : "New customer"}
      hasBackButton
    >
      <Card className="h-min-80 mt-2">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex justify-center w-full">
            <div className="cursor-pointer z-10">
              <Tooltip title="Edit avatar" placement="bottom">
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

          <Row className="mt-10">
            <Col xs={24} md={12}>
              <FormInput
                label="Name"
                placeholder={"Enter name"}
                defaultValue={customer?.name}
                register={register}
                registerName="name"
                registerOptions={{ required: true }}
                errorMessage={errors.name?.message}
                maxLength={200}
              />
            </Col>

            <Col xs={24} md={12}>
              <FormInput
                label="Email"
                placeholder={"Enter email"}
                defaultValue={customer?.email}
                register={register}
                registerName="email"
                registerOptions={{ required: true }}
                errorMessage={errors.email?.message}
                maxLength={200}
                type="email"
                divClassName="pl-0"
              />
            </Col>

            <Col xs={24} md={12}>
              <FormInput
                label="Birth Date"
                type="date"
                placeholder={"Enter birth date"}
                defaultValue={customer?.birthDate}
                register={register}
                registerName="birthDate"
                errorMessage={errors.birthDate?.message}
              />
            </Col>

            <Col xs={24} md={12}>
              <SelectCustomAntd<ICustomer>
                controller={{ control, name: "gender" }}
                label="Gender"
                errorMessage={errors.gender?.message}
              >
                {Object.keys(UsersEnum.Gender).map((gender: string) => (
                  <Select.Option key={gender} value={gender}>
                    {UsersEnum.GenderLabels[gender as UsersEnum.Gender]}
                  </Select.Option>
                ))}
              </SelectCustomAntd>
            </Col>
          </Row>

          <Row>
            <Col xs={24}>
              <FormTextarea
                label="About"
                placeholder={"Enter about"}
                defaultValue={customer?.about}
                register={register}
                registerName="about"
                rows={2}
              />
            </Col>
          </Row>

          <Addresses
            control={control}
            errors={errors}
            register={register}
            watch={watch}
          />

          <PhoneNumbers
            control={control}
            errors={errors}
            register={register}
            watch={watch}
          />

          <HrCustom className="my-7" />

          <div className="flex justify-center my-5">
            <Button
              type="default"
              className="mr-2"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button
              type="primary"
              onClick={handleSubmit(onSubmit)}
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              {isEditMode ? "Save" : "Create"}
            </Button>
          </div>
        </form>
      </Card>
    </Layout>
  );
}
