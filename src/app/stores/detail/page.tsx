"use client";

import { useEffect, useState } from "react";

import {
  Badge,
  Button,
  Card,
  Col,
  Divider,
  message,
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
import { TagCategoryCustomAntd } from "../../../components/common/TagCategoryCustomAntd/TagCategoryCustomAntd";
import { TagTagCustomAntd } from "../../../components/common/TagTagCustomAntd/TagTagCustomAntd";
import { InputCustomAntd } from "../../../components/custom/antd/InputCustomAntd/InputCustomAntd";
import { SelectCustomAntd } from "../../../components/custom/antd/SelectCustomAntd/SelectCustomAntd";
import { TextareaCustomAntd } from "../../../components/custom/antd/TextareaCustomAntd/TextareaCustomAntd";
import Layout from "../../../components/template/Layout/Layout";
import useLanguageData from "../../../data/context/language/useLanguageData";
import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import CreateStoreDto from "../../../services/social-prices-api/stores/dto/createStore.dto";
import UpdateStoreDto from "../../../services/social-prices-api/stores/dto/updateStore.dto";
import CategoriesEnum from "../../../shared/business/categories/categories.enum";
import { ICategory } from "../../../shared/business/categories/categories.interface";
import AddressEnum from "../../../shared/business/shared/address/address.enum";
import { IAddress } from "../../../shared/business/shared/address/address.interface";
import { IPhoneNumber } from "../../../shared/business/shared/phone/phone-number.interface";
import StoresEnum from "../../../shared/business/stores/stores.enum";
import { IStore } from "../../../shared/business/stores/stores.interface";
import TagsEnum from "../../../shared/business/tags/tags.enum";
import { ITag } from "../../../shared/business/tags/tags.interface";
import Urls from "../../../shared/common/routes-app/routes-app";
import DatesEnum from "../../../shared/utils/dates/dates.enum";
import { getFileUrl } from "../../../shared/utils/images/images-helper";
import { getImageUrl } from "../../../shared/utils/images/images-url";
import { useFindCategoriesByType } from "../../categories/useFindCategoriesByType";
import { useFindTagsByType } from "../../tags/useFindTagsByType";
import { useFindStoreById } from "./useFindStoreById";

const formSchema = z.object({
  name: z.string().trim().nonempty("Name is required"),
  email: z.string().trim().email().nonempty("Email is required"),
  startedAt: z.string().nonempty("Started At is required"),
  description: z.string().trim().nullable(),
  addresses: z.array(addressFormSchema),
  phoneNumbers: z.array(phoneNumberFormSchema),
  about: z.string().trim().nullable(),
  status: z.string(),
  categoriesIds: z.array(z.string()),
  tagsIds: z.array(z.string()),
  cnpj: z.string().trim().nullable(),
  type: z.string().trim().nullable(),
});

type TFormSchema = z.infer<typeof formSchema>;

export default function StoreDetailPage() {
  const router: AppRouterInstance = useRouter();
  const searchParams: ReadonlyURLSearchParams = useSearchParams();
  const { t } = useLanguageData();

  const storeId: string | null = searchParams.get("sid");

  const { store, isLoadingStore } = useFindStoreById(storeId);

  const { categories, isLoading: isLoadingCategories } =
    useFindCategoriesByType(CategoriesEnum.Type.STORE);

  const { tags, isLoading: isLoadingTags } = useFindTagsByType(
    TagsEnum.Type.STORE
  );

  const [formValues, setFormValues] = useState<TFormSchema>();

  const isEditMode: boolean = !!storeId && !!store;

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
        : [generateNewPhoneNumber(false)],
      status: store?.status ?? StoresEnum.Status.ACTIVE,
      categoriesIds: store?.categoriesIds ?? [],
      tagsIds: store?.tagsIds ?? [],
      cnpj: store?.cnpj ?? null,
      type: store?.type ?? null,
    };

    setFormValues(values);
  }, [store]);

  if ((storeId && isLoadingStore) || isLoadingCategories || isLoadingTags) {
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
        tagsIds: data.tagsIds,
        cnpj: data.cnpj,
        type: data.type as StoresEnum.Type,
      };

      for (const property of Object.keys(createStoreDto)) {
        let value: any = createStoreDto[property];

        if (isArray(value)) {
          value = JSON.stringify(value);
        }

        formData.append([`${property}`], value);
      }

      await serviceMethodsInstance.storesServiceMethods.create(formData);

      message.success(t("stores.storeCreatedSuccessfully"));

      router.back();
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: TFormSchema) => {
    try {
      if (!store) {
        message.warning(t("stores.storeNotFoundToUpdate"));
        return;
      }

      setIsSubmitting(true);

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
        tagsIds: data.tagsIds,
        cnpj: data.cnpj,
        type: data.type as StoresEnum.Type,
      };

      for (const property of Object.keys(updateStoreDto)) {
        let value: any = updateStoreDto[property];

        if (isArray(value)) {
          value = JSON.stringify(value);
        }

        formData.append([`${property}`], value);
      }

      await serviceMethodsInstance.storesServiceMethods.update(formData);

      message.success(t("stores.storeUpdatedSuccessfully"));

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

    let url: string | null = store?.logo ? getImageUrl(store.logo) : null;

    if (fileList.length) {
      url = await getFileUrl(fileList?.[0]);
    }

    setLogoUrl(url);
  };

  return (
    <Layout
      subtitle={
        isEditMode ? t("stores.editStoreDetails") : t("stores.newStoreDetails")
      }
      title={
        isEditMode
          ? `${t("stores.editStore")}: ${store?.name}`
          : t("stores.newStore")
      }
      hasBackButton
    >
      <Card className="h-min-80 mt-2">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex justify-center w-full">
            <div className="cursor-pointer z-10">
              <Tooltip title={t("stores.editLogo")} placement="bottom">
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

          <Row gutter={24} justify={"end"}>
            <Col>
              <Tooltip title={t("stores.goToStore")}>
                <Button
                  type="primary"
                  onClick={() =>
                    router.push(Urls.STORE.replace(":storeId", store!._id))
                  }
                  icon={<EnterOutlined />}
                >
                  {t("stores.store")}
                </Button>
              </Tooltip>
            </Col>
          </Row>

          <Divider className="mt-2" />

          <Row gutter={[16, 16]} className="mt-10">
            <Col xs={24} md={8}>
              <InputCustomAntd
                controller={{ control, name: `name` }}
                label={t("common.name")}
                placeholder={t("placeholders.enterName")}
                errorMessage={errors.name?.message}
                maxLength={200}
              />
            </Col>

            <Col xs={24} md={8}>
              <InputCustomAntd
                controller={{ control, name: `email` }}
                label={t("common.email")}
                placeholder={t("placeholders.enterEmail")}
                errorMessage={errors.email?.message}
                maxLength={200}
                type="email"
              />
            </Col>
            <Col xs={24} md={8}>
              <InputCustomAntd
                controller={{ control, name: `startedAt` }}
                label={t("stores.startedAt")}
                type="date"
                placeholder={t("stores.startedAt")}
                errorMessage={errors.startedAt?.message}
              />
            </Col>
          </Row>

          <Row>
            <Col xs={24} md={8}>
              <InputCustomAntd
                controller={{ control, name: `description` }}
                label={t("stores.description")}
                placeholder={t("placeholders.enterDescription")}
                errorMessage={errors.description?.message}
                maxLength={200}
              />
            </Col>
            <Col xs={8}>
              <SelectCustomAntd<IStore>
                controller={{ control, name: "status" }}
                label={t("common.status")}
                placeholder={t("stores.selectStatus")}
                errorMessage={errors.status?.message}
              >
                {Object.keys(StoresEnum.Status).map((status: string) => (
                  <Select.Option key={status} value={status}>
                    <span className="mr-1">
                      {t(StoresEnum.StatusLabel[status as StoresEnum.Status])}
                    </span>
                    <Badge
                      color={
                        StoresEnum.StatusBadgeColor[status as StoresEnum.Status]
                      }
                    />
                  </Select.Option>
                ))}
              </SelectCustomAntd>
            </Col>

            <Col xs={24} md={8}>
              <SelectCustomAntd<IStore>
                controller={{ control, name: "categoriesIds" }}
                label={t("categories.title")}
                placeholder={t("stores.selectCategories")}
                mode="multiple"
                errorMessage={errors.categoriesIds?.message}
              >
                {categories.map((category: ICategory) => (
                  <Select.Option key={category._id} value={category._id}>
                    <TagCategoryCustomAntd category={category} useTag={false} />
                  </Select.Option>
                ))}
              </SelectCustomAntd>
            </Col>

            <Col xs={24} md={8}>
              <SelectCustomAntd<IStore>
                controller={{ control, name: "tagsIds" }}
                label={t("tags.title")}
                placeholder={t("stores.selectTags")}
                mode="multiple"
                errorMessage={errors.tagsIds?.message}
              >
                {tags.map((tag: ITag) => (
                  <Select.Option key={tag._id} value={tag._id}>
                    <TagTagCustomAntd tag={tag} useTag={false} />
                  </Select.Option>
                ))}
              </SelectCustomAntd>
            </Col>

            <Col xs={24} md={8}>
              <InputCustomAntd
                controller={{ control, name: `cnpj` }}
                label={t("stores.cnpjCpf")}
                placeholder={t("stores.enterCnpjCpf")}
                errorMessage={errors.cnpj?.message}
              />
            </Col>

            <Col xs={24} md={8}>
              <SelectCustomAntd<IStore>
                controller={{ control, name: "type" }}
                label={t("stores.type")}
                placeholder={t("stores.selectType")}
                errorMessage={errors.type?.message}
              >
                {Object.keys(StoresEnum.Type).map((type: string) => (
                  <Select.Option key={type} value={type}>
                    {t(StoresEnum.TypeLabels[type as StoresEnum.Type])}
                  </Select.Option>
                ))}
              </SelectCustomAntd>
            </Col>
          </Row>

          <Row>
            <Col xs={24}>
              <TextareaCustomAntd
                label={t("stores.about")}
                controller={{ control, name: "about" }}
                placeholder={t("stores.enterAbout")}
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
