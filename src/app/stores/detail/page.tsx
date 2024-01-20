"use client";

import { useState } from "react";

import { Button, Card, Col, message, Row, Tooltip, UploadFile } from "antd";
import { RcFile } from "antd/es/upload";
import { isArray } from "class-validator";
import moment from "moment";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context";
import { useRouter } from "next/navigation";
import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import z from "zod";

import { zodResolver } from "@hookform/resolvers/zod";

import Avatar from "../../../components/common/Avatar/Avatar";
import ButtonCommon from "../../../components/common/ButtonCommon/ButtonCommon";
import Collapse from "../../../components/common/Collapse/Collapse";
import ContainerTitle from "../../../components/common/ContainerTitle/ContainerTitle";
import FormInput from "../../../components/common/FormInput/FormInput";
import FormSelect, {
  FormSelectOption,
} from "../../../components/common/FormSelect/FormSelect";
import handleClientError from "../../../components/common/handleClientError/handleClientError";
import HrCustom from "../../../components/common/HrCustom/HrCustom";
import { IconPlus, IconTrash } from "../../../components/common/icons/icons";
import ImageModal from "../../../components/common/ImageModal/ImageModal";
import Layout from "../../../components/template/Layout/Layout";
import { serviceMethodsInstance } from "../../../services/social-prices-api/ServiceMethods";
import CreateStoreDto from "../../../services/social-prices-api/stores/dto/createStore.dto";
import {
  IStoreAddress,
  IStorePhoneNumber,
} from "../../../shared/business/stores/stores.interface";
import { getFileUrl } from "../../../shared/utils/images/helper";
import citiesMockData from "../../../shared/utils/mock-data/brazil-cities.json";
import statesMockData from "../../../shared/utils/mock-data/brazil-states.json";
import countriesMockData from "../../../shared/utils/mock-data/countries.json";
import {
  ICityMockData,
  ICountryMockData,
  IStateMockData,
} from "../../../shared/utils/mock-data/interfaces";
import {
  createPhoneNumberName,
  createUserAddressName,
} from "../../../shared/utils/string-extensions/string-extensions";

const addressFormSchema = z.object({
  address1: z.string().nonempty("Address1 is required"),
  address2: z.string().optional(),
  city: z.string().nonempty("City is required"),
  isValid: z.boolean(),
  stateCode: z.string().nonempty("State is required"),
  uid: z.string(),
  zip: z.string().nonempty("Zipcode is required"),
  description: z.string().optional(),
  countryCode: z.string().nonempty("Country is required"),
  district: z.string().nonempty("District is required"),
  isCollapsed: z.boolean(),
});

type TAddressFormSchema = z.infer<typeof addressFormSchema>;

const phoneNumberFormSchema = z.object({
  uid: z.string(),
  number: z.string().nonempty("Phone number is required"),
  isCollapsed: z.boolean().optional(),
});

type TPhoneNumberFormSchema = z.infer<typeof phoneNumberFormSchema>;

const formSchema = z.object({
  name: z.string().nonempty("Name is required"),
  email: z.string().email().nonempty("Email is required"),
  startedAt: z.string().nonempty("Started At is required"),
  description: z.string().nullable(),
  addresses: z.array(addressFormSchema),
  phoneNumbers: z.array(phoneNumberFormSchema),
});

type TFormSchema = z.infer<typeof formSchema>;

const countries: ICountryMockData[] = countriesMockData.filter(
  (country) => country.code === "BR"
);
const states: IStateMockData[] = statesMockData;
const stateCities: ICityMockData[] = citiesMockData.states;

const generateNewAddress = (
  isCollapsed: boolean = true
): TAddressFormSchema => ({
  address1: "",
  city: "",
  countryCode: countries[0].code,
  isValid: true,
  uid: `${Date.now()}`,
  zip: "",
  address2: "",
  description: "",
  stateCode: "",
  district: "",
  isCollapsed,
});

const generateNewAPhoneNumber = (
  isCollapsed: boolean = true
): TPhoneNumberFormSchema => ({
  number: "",
  isCollapsed,
  uid: Date.now().toString(),
});

export default function NewStore() {
  const router: AppRouterInstance = useRouter();

  const defaultValues: TFormSchema = {
    name: "",
    email: "",
    description: null,
    startedAt: "",
    addresses: [generateNewAddress(false)],
    phoneNumbers: [generateNewAPhoneNumber(false)],
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
  } = useForm<TFormSchema>({
    defaultValues,
    resolver: zodResolver(formSchema),
  });

  const {
    append: appendAddress,
    fields: fieldsAddresses,
    remove: removeAddress,
  } = useFieldArray({
    control,
    name: "addresses",
  });

  const {
    append: appendPhone,
    fields: fieldsPhones,
    remove: removePhone,
  } = useFieldArray({
    control,
    name: "phoneNumbers",
  });

  const [isVisibleEditAvatarModal, setIsVisibleAvatarModal] =
    useState<boolean>(false);

  const [isSubmitting, setIsSUbmitting] = useState<boolean>(false);

  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const [logoUrl, setLogoUrl] = useState<string | null>();

  const onSubmit: SubmitHandler<TFormSchema> = async (data: TFormSchema) => {
    try {
      if (fileList.length === 0) {
        message.warning("Please select a logo.");
        return;
      }

      setIsSUbmitting(true);

      const formData = new FormData();

      formData.append("logo", fileList[0].originFileObj as RcFile);

      const addresses: IStoreAddress[] = data.addresses.map(
        (address): IStoreAddress => ({
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

      const createStoreDto: CreateStoreDto = {
        description: data.description,
        email: data.email,
        name: data.name,
        startedAt: moment(data.startedAt).toDate(),
        addresses,
        phoneNumbers: data.phoneNumbers,
      };

      for (const property of Object.keys(createStoreDto)) {
        let value: any = createStoreDto[property];

        if (isArray(value)) {
          value = JSON.stringify(value);
        }

        formData.append([`${property}`], value);
      }

      await serviceMethodsInstance.storesServiceMethods.create(formData);

      message.success("Your store has been created successfully!");

      router.back();
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsSUbmitting(false);
    }
  };

  const addNewAddress = () => appendAddress(generateNewAddress(false));

  const removeNewAddress = (index: number) => {
    removeAddress(index);

    if (fieldsAddresses.length === 1) {
      addNewAddress();
    }
  };

  const addNewPhoneNumber = () => appendPhone(generateNewAPhoneNumber(true));

  const removeNewPhoneNumber = (index: number) => {
    removePhone(index);

    if (fieldsPhones.length === 1) {
      addNewPhoneNumber();
    }
  };

  return (
    <Layout subtitle="New store" title="New store" hasBackButton>
      <Card className="h-min-80 mt-2">
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Common fields */}
          <div className="flex justify-center w-full">
            <div className="cursor-pointer z-10">
              <Tooltip title="Edit logo" placement="bottom">
                <Avatar
                  src={logoUrl}
                  width={150}
                  className="shadow-lg border-none"
                  onClick={() => setIsVisibleAvatarModal(true)}
                />

                <ImageModal
                  isVisible={isVisibleEditAvatarModal}
                  onCancel={() => setIsVisibleAvatarModal(false)}
                  onOk={async (_, fileList) => {
                    setIsVisibleAvatarModal(false);
                    setFileList(fileList);
                    const url: string | null = await getFileUrl(fileList?.[0]);
                    setLogoUrl(url);
                  }}
                />
              </Tooltip>
            </div>
          </div>

          <Row gutter={[16, 16]} className="mt-10">
            <Col xs={24} md={12}>
              <FormInput
                label="Name"
                placeholder={"Enter name"}
                defaultValue={""}
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
                defaultValue={""}
                register={register}
                registerName="email"
                registerOptions={{ required: true }}
                errorMessage={errors.email?.message}
                maxLength={200}
                type="email"
                divClassName="pl-0"
              />
            </Col>
          </Row>

          <Row>
            <Col xs={24} md={12}>
              <FormInput
                label="Started At"
                type="date"
                placeholder={"Enter started at"}
                defaultValue={null}
                register={register}
                registerName="startedAt"
                registerOptions={{ required: true }}
                errorMessage={errors.startedAt?.message}
              />
            </Col>

            <Col xs={24} md={12}>
              <FormInput
                label="Description"
                placeholder={"Enter description"}
                defaultValue={""}
                register={register}
                registerName="description"
                errorMessage={errors.description?.message}
                maxLength={200}
              />
            </Col>
          </Row>

          {/* Addresses fields */}
          <ContainerTitle
            title={
              <div className="flex items-center">
                <label className="mr-4">Addresses</label>

                <Tooltip title="Add a new address">
                  <ButtonCommon
                    onClick={(e) => {
                      e.preventDefault();
                      addNewAddress();
                    }}
                    color="primary"
                    className="rounded-r-full rounded-l-full"
                  >
                    {IconPlus()}
                  </ButtonCommon>
                </Tooltip>
              </div>
            }
            className="mt-10"
          >
            {fieldsAddresses.map(
              (formAddress: TAddressFormSchema, index: number) => {
                const address: TAddressFormSchema = watch(`addresses.${index}`);

                const addressName: string = createUserAddressName(address);

                return (
                  <Collapse
                    key={index}
                    collapsed={formAddress.isCollapsed}
                    title={addressName.trim() || `Address (${index + 1})`}
                    className="relative mt-5"
                    extraHeader={
                      <Tooltip title="Remove address">
                        <ButtonCommon
                          onClick={(e) => {
                            e.preventDefault();
                            removeNewAddress(index);
                          }}
                          color="transparent"
                          className="rounded-r-full rounded-l-full absolute right-2 shadow-none"
                        >
                          {IconTrash("w-3 h-3 text-red-500 hover:text-red-600")}
                        </ButtonCommon>
                      </Tooltip>
                    }
                  >
                    <div className="flex">
                      <div className="flex flex-col justify-start w-1/2">
                        <FormSelect
                          label="Country"
                          placeholder={"Select country"}
                          defaultValue={formAddress.countryCode}
                          register={register}
                          registerName={`addresses.${index}.countryCode`}
                          registerOptions={{ required: true }}
                          errorMessage={
                            errors?.addresses?.[index]?.countryCode?.message
                          }
                        >
                          {countries.map((country: ICountryMockData) => (
                            <FormSelectOption
                              key={country.code}
                              value={country.code}
                            >
                              {country.name}
                            </FormSelectOption>
                          ))}
                        </FormSelect>

                        <FormInput
                          label="Zipcode"
                          placeholder={"Enter zipcode"}
                          defaultValue={formAddress.zip}
                          register={register}
                          registerName={`addresses.${index}.zip`}
                          registerOptions={{ required: true }}
                          errorMessage={
                            errors?.addresses?.[index]?.zip?.message
                          }
                          maxLength={20}
                        />

                        <FormInput
                          label="District"
                          placeholder={"Enter district"}
                          defaultValue={formAddress.district}
                          register={register}
                          registerName={`addresses.${index}.district`}
                          registerOptions={{ required: true }}
                          errorMessage={
                            errors?.addresses?.[index]?.district?.message
                          }
                          maxLength={200}
                        />
                      </div>

                      <div className="flex flex-col justify-start w-1/2">
                        <FormSelect
                          label="State"
                          placeholder={"Select state"}
                          defaultValue={formAddress.stateCode}
                          register={register}
                          registerName={`addresses.${index}.stateCode`}
                          registerOptions={{ required: true }}
                          errorMessage={
                            errors?.addresses?.[index]?.stateCode?.message
                          }
                        >
                          {states.map((state: IStateMockData) => (
                            <FormSelectOption
                              key={state.code}
                              value={state.code}
                            >
                              {state.name}
                            </FormSelectOption>
                          ))}
                        </FormSelect>

                        <FormInput
                          label="Address 1"
                          placeholder={"Enter address 1"}
                          defaultValue={formAddress.address1}
                          register={register}
                          registerName={`addresses.${index}.address1`}
                          registerOptions={{ required: true }}
                          errorMessage={
                            errors?.addresses?.[index]?.address1?.message
                          }
                          maxLength={200}
                        />

                        <FormInput
                          label="Description"
                          placeholder={"Enter description"}
                          defaultValue={formAddress.description}
                          register={register}
                          registerName={`addresses.${index}.description`}
                          maxLength={400}
                        />
                      </div>

                      <div className="flex flex-col justify-start w-1/2">
                        <FormSelect
                          label="City"
                          placeholder={"Select city"}
                          defaultValue={formAddress.city}
                          register={register}
                          registerName={`addresses.${index}.city`}
                          registerOptions={{ required: true }}
                          errorMessage={
                            errors?.addresses?.[index]?.city?.message
                          }
                        >
                          {stateCities
                            .find(
                              (stateCity) =>
                                stateCity.stateCode === address.stateCode
                            )
                            ?.cities.map((city: string) => (
                              <FormSelectOption key={city} value={city}>
                                {city}
                              </FormSelectOption>
                            ))}
                        </FormSelect>

                        <FormInput
                          label="Address 2"
                          placeholder={"Enter address 2"}
                          defaultValue={formAddress.address2}
                          register={register}
                          registerName={`addresses.${index}.address2`}
                          maxLength={200}
                        />
                      </div>
                    </div>
                  </Collapse>
                );
              }
            )}
          </ContainerTitle>

          {/* Phones fields */}
          <ContainerTitle
            title={
              <div className="flex items-center">
                <label className="mr-4">Phone Numbers</label>

                <Tooltip title="Add a new phone number">
                  <ButtonCommon
                    onClick={(e) => {
                      e.preventDefault();
                      addNewPhoneNumber();
                    }}
                    color="primary"
                    className="rounded-r-full rounded-l-full"
                  >
                    {IconPlus()}
                  </ButtonCommon>
                </Tooltip>
              </div>
            }
            className="mt-10"
          >
            {fieldsPhones.map(
              (formPhoneNumber: TPhoneNumberFormSchema, index: number) => {
                const phoneNUmber: TPhoneNumberFormSchema = watch(
                  `phoneNumbers.${index}`
                );

                const phoneNumberName: string = createPhoneNumberName(
                  phoneNUmber as IStorePhoneNumber
                );

                return (
                  <Collapse
                    key={index}
                    collapsed={formPhoneNumber.isCollapsed}
                    title={
                      phoneNumberName.trim() || `Phone Number (${index + 1})`
                    }
                    className="relative mt-5"
                    extraHeader={
                      <Tooltip title="Remove phone number">
                        <ButtonCommon
                          onClick={(e) => {
                            e.preventDefault();
                            removeNewPhoneNumber(index);
                          }}
                          color="transparent"
                          className="rounded-r-full rounded-l-full absolute right-2 shadow-none"
                        >
                          {IconTrash("w-3 h-3 text-red-500 hover:text-red-600")}
                        </ButtonCommon>
                      </Tooltip>
                    }
                  >
                    <div className="flex">
                      <div className="flex flex-col justify-start w-1/2">
                        <FormInput
                          label="Phone Number"
                          placeholder={"Enter phone number"}
                          defaultValue={formPhoneNumber.number}
                          register={register}
                          registerName={`phoneNumbers.${index}.number`}
                          registerOptions={{ required: true }}
                          errorMessage={
                            errors?.phoneNumbers?.[index]?.number?.message
                          }
                          maxLength={30}
                        />
                      </div>
                    </div>
                  </Collapse>
                );
              }
            )}
          </ContainerTitle>

          <HrCustom className="my-7" />

          <div className="flex justify-center my-5">
            <Button
              type="default"
              className="mr-3"
              onClick={() => router.back()}
              loading={isSubmitting}
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
              Create
            </Button>
          </div>
        </form>
      </Card>
    </Layout>
  );
}
