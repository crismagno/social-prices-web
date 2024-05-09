"use client";

import { useEffect, useState } from "react";

import {
  Badge,
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
import { Controller, SubmitHandler, useForm } from "react-hook-form";
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
import { TagCategoryCustomAntd } from "../../../components/custom/antd/TagCategoryCustomAntd/TagCategoryCustomAntd";
import Layout from "../../../components/template/Layout/Layout";
import { serviceMethodsInstance } from "../../../services/social-prices-api/ServiceMethods";
import CreateStoreDto from "../../../services/social-prices-api/stores/dto/createStore.dto";
import UpdateStoreDto from "../../../services/social-prices-api/stores/dto/updateStore.dto";
import CategoriesEnum from "../../../shared/business/categories/categories.enum";
import { ICategory } from "../../../shared/business/categories/categories.interface";
import AddressEnum from "../../../shared/business/enums/address.enum";
import { IAddress } from "../../../shared/business/interfaces/address.interface";
import { IPhoneNumber } from "../../../shared/business/interfaces/phone-number";
import StoresEnum from "../../../shared/business/stores/stores.enum";
import DatesEnum from "../../../shared/utils/dates/dates.enum";
import { getFileUrl } from "../../../shared/utils/images/helper";
import { getImageUrl } from "../../../shared/utils/images/url-images";
import { useFindCategoriesByType } from "../../categories/useFindCategoriesByType";
import { useFindStoreById } from "./useFindStoreById";

const formSchema = z.object({
  name: z.string().nonempty("Name is required"),
  email: z.string().email().nonempty("Email is required"),
  startedAt: z.string().nonempty("Started At is required"),
  description: z.string().nullable(),
  addresses: z.array(addressFormSchema),
  phoneNumbers: z.array(phoneNumberFormSchema),
  about: z.string().nullable(),
  status: z.string(),
  categoriesIds: z.array(z.string()),
});

type TFormSchema = z.infer<typeof formSchema>;

export default function StoreDetailPage() {
  const router: AppRouterInstance = useRouter();

  const searchParams: ReadonlyURLSearchParams = useSearchParams();

  const storeId: string | null = searchParams.get("sid");

  const { store, isLoadingStore } = useFindStoreById(storeId);

  const { categories, isLoading: isLoadingCategories } =
    useFindCategoriesByType(CategoriesEnum.Type.STORE);

  const [formValues, setFormValues] = useState<TFormSchema>();

  const isEditMode: boolean = !!storeId && !!store;

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

  const [logoUrl, setLogoUrl] = useState<string | null>();

  useEffect(() => {
    if (store?.logo) {
      const url: string = getImageUrl(store.logo);
      setLogoUrl(url);
    }

    const values: TFormSchema = {
      about: store?.about ?? null,
      name: store?.name ?? "",
      email: store?.email ?? "",
      description: store?.description ?? "",
      startedAt: moment(store?.startedAt)
        .utc()
        .format(DatesEnum.Format.YYYYMMDD_DASHED),
      addresses: store?.addresses.length
        ? store?.addresses.map((address: IAddress, index: number) => ({
            ...address,
            countryCode: address.country?.code,
            stateCode: address.state?.code ?? "",
            isCollapsed: index === 0,
          }))
        : [generateNewAddress(false)],
      phoneNumbers: store?.phoneNumbers.length
        ? store?.phoneNumbers.map(
            (phoneNumber: IPhoneNumber, index: number) => ({
              ...phoneNumber,
              isCollapsed: index === 0,
            })
          )
        : [generateNewAPhoneNumber(false)],
      status: store?.status ?? StoresEnum.Status.ACTIVE,
      categoriesIds: store?.categoriesIds ?? [],
    };

    setFormValues(values);
  }, [store]);

  if ((storeId && isLoadingStore) || isLoadingCategories) {
    return <LoadingFull />;
  }

  const onSubmit: SubmitHandler<TFormSchema> = async (data: TFormSchema) => {
    if (isEditMode) {
      await updateStore(data);
    } else {
      await createStore(data);
    }
  };

  const createStore = async (data: TFormSchema) => {
    try {
      if (fileList.length === 0) {
        message.warning("Please select a logo.");
        return;
      }

      setIsSUbmitting(true);

      const formData = new FormData();

      formData.append("logo", fileList[0].originFileObj as RcFile);

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

      const createStoreDto: CreateStoreDto = {
        description: data.description,
        email: data.email,
        name: data.name,
        startedAt: moment(data.startedAt).toDate(),
        addresses,
        phoneNumbers: data.phoneNumbers,
        about: data.about,
        status: data.status as StoresEnum.Status,
        categoriesIds: data.categoriesIds,
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

  const updateStore = async (data: TFormSchema) => {
    try {
      if (!store) {
        message.warning("Store not found to update!");
        return;
      }

      setIsSUbmitting(true);

      const formData = new FormData();

      if (fileList.length > 0) {
        formData.append("logo", fileList[0].originFileObj as RcFile);
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
            code: address.stateCode ?? null,
            name:
              states.find((state) => state.code === address.stateCode)?.name ??
              "",
          },
          types: address.types as AddressEnum.Type[],
        })
      );

      const updateStoreDto: UpdateStoreDto = {
        storeId: store._id,
        description: data.description,
        email: data.email,
        name: data.name,
        startedAt: moment(data.startedAt).toDate(),
        addresses,
        phoneNumbers: data.phoneNumbers,
        about: data.about,
        status: data.status as StoresEnum.Status,
        categoriesIds: data.categoriesIds,
      };

      for (const property of Object.keys(updateStoreDto)) {
        let value: any = updateStoreDto[property];

        if (isArray(value)) {
          value = JSON.stringify(value);
        }

        formData.append([`${property}`], value);
      }

      await serviceMethodsInstance.storesServiceMethods.update(formData);

      message.success("Your store has been updated successfully!");

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

    let url: string | null = store?.logo ? getImageUrl(store.logo) : null;

    if (fileList.length) {
      url = await getFileUrl(fileList?.[0]);
    }

    setLogoUrl(url);
  };

  return (
    <Layout
      subtitle={isEditMode ? "Edit store details" : "New store details"}
      title={isEditMode ? "Edit store" : "New store"}
      hasBackButton
    >
      <Card className="h-min-80 mt-2">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex justify-center w-full">
            <div className="cursor-pointer z-10">
              <Tooltip title="Edit logo" placement="bottom">
                <Avatar
                  src={logoUrl}
                  width={180}
                  className="shadow-lg border-none"
                  onClick={() => setIsVisibleAvatarModal(true)}
                  noUseAwsS3
                />

                <ImageModal
                  isVisible={isVisibleEditAvatarModal}
                  onCancel={() => setIsVisibleAvatarModal(false)}
                  onOk={onImageModalOk}
                  url={logoUrl}
                />
              </Tooltip>
            </div>
          </div>

          <Row gutter={[16, 16]} className="mt-10">
            <Col xs={24} md={8}>
              <FormInput
                label="Name"
                placeholder={"Enter name"}
                defaultValue={store?.name}
                register={register}
                registerName="name"
                registerOptions={{ required: true }}
                errorMessage={errors.name?.message}
                maxLength={200}
              />
            </Col>

            <Col xs={24} md={8}>
              <FormInput
                label="Email"
                placeholder={"Enter email"}
                defaultValue={store?.email}
                register={register}
                registerName="email"
                registerOptions={{ required: true }}
                errorMessage={errors.email?.message}
                maxLength={200}
                type="email"
                divClassName="pl-0"
              />
            </Col>
            <Col xs={24} md={8}>
              <FormInput
                label="Started At"
                type="date"
                placeholder={"Enter started at"}
                defaultValue={store?.startedAt}
                register={register}
                registerName="startedAt"
                registerOptions={{ required: true }}
                errorMessage={errors.startedAt?.message}
              />
            </Col>
          </Row>

          <Row>
            <Col xs={24} md={8}>
              <FormInput
                label="Description"
                placeholder={"Enter description"}
                defaultValue={store?.description}
                register={register}
                registerName="description"
                errorMessage={errors.description?.message}
                maxLength={200}
              />
            </Col>
            <Col xs={8}>
              <div className={`flex flex-col mt-4 mr-5`}>
                <label className={`text-sm`}>Status</label>

                <Controller
                  control={control}
                  name={`status`}
                  render={({
                    field: { onChange, onBlur, value, name, ref },
                  }) => (
                    <Select
                      onChange={onChange}
                      onBlur={onBlur}
                      name={name}
                      value={value}
                      ref={ref}
                      placeholder={"Select status"}
                    >
                      {Object.keys(StoresEnum.Status).map((status: string) => (
                        <Select.Option key={status} value={status}>
                          <span className="mr-1">
                            {
                              StoresEnum.StatusLabel[
                                status as StoresEnum.Status
                              ]
                            }
                          </span>
                          <Badge
                            color={
                              StoresEnum.StatusBadgeColor[
                                status as StoresEnum.Status
                              ]
                            }
                          />
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                ></Controller>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className={`flex flex-col mt-4 mr-5`}>
                <label className={`text-sm`}>Categories</label>

                <Controller
                  control={control}
                  name={`categoriesIds`}
                  render={({
                    field: { onChange, onBlur, value, name, ref },
                  }) => (
                    <Select
                      onChange={onChange}
                      onBlur={onBlur}
                      name={name}
                      value={value}
                      ref={ref}
                      placeholder={"Select categories"}
                      mode="multiple"
                    >
                      {categories.map((category: ICategory) => (
                        <Select.Option key={category._id} value={category._id}>
                          <TagCategoryCustomAntd
                            category={category}
                            useTag={false}
                          />
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                ></Controller>
              </div>
            </Col>
          </Row>

          <Row>
            <Col xs={24}>
              <FormTextarea
                label="About"
                placeholder={"Enter about"}
                defaultValue={store?.about}
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
