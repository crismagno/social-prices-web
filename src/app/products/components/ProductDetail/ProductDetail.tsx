"use client";

import "./styles.scss";

import { useEffect, useMemo, useState } from "react";

import {
  Button,
  Col,
  Input,
  Modal,
  QRCode,
  Row,
  Select,
  Space,
  Upload,
  UploadFile,
  UploadProps,
} from "antd";
import ImgCrop from "antd-img-crop";
import { RcFile } from "antd/es/upload";
import { isArray } from "class-validator";
import { filter, isObject, map } from "lodash";
import moment from "moment";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import z from "zod";

import { zodResolver } from "@hookform/resolvers/zod";

import ContainerTitle from "../../../../components/common/ContainerTitle/ContainerTitle";
import handleClientError from "../../../../components/common/HandleClientError/HandleClientError";
import HrCustom from "../../../../components/common/HrCustom/HrCustom";
import LoadingFull from "../../../../components/common/LoadingFull/LoadingFull";
import {
  colorSchema,
  MultiColors,
} from "../../../../components/common/MultiColors/MultiColors";
import { ProductHistoricPricesButton } from "../../../../components/common/ProductHistoricPricesButton/ProductHistoricPricesButton";
import { ProductPreviousBarcodesPopover } from "../../../../components/common/ProductPreviousBarcodesPopover/ProductPreviousBarcodesPopover";
import { StoreNameStatus } from "../../../../components/common/StoreNameStatus/StoreNameStatus";
import { TagCategoryCustomAntd } from "../../../../components/common/TagCategoryCustomAntd/TagCategoryCustomAntd";
import { TagTagCustomAntd } from "../../../../components/common/TagTagCustomAntd/TagTagCustomAntd";
import { CheckboxCustomAntd } from "../../../../components/custom/antd/CheckboxCustomAntd/CheckboxCustomAntd";
import { InputCustomAntd } from "../../../../components/custom/antd/InputCustomAntd/InputCustomAntd";
import { InputNumberCustomAntd } from "../../../../components/custom/antd/InputNumberCustomAntd/InputNumberCustomAntd";
import { SelectCustomAntd } from "../../../../components/custom/antd/SelectCustomAntd/SelectCustomAntd";
import { TextareaCustomAntd } from "../../../../components/custom/antd/TextareaCustomAntd/TextareaCustomAntd";
import useLanguageData from "../../../../data/context/language/useLanguageData";
import CreateProductDto from "../../../../services/social-prices-api/products/dto/createProduct.dto";
import UpdateProductDto from "../../../../services/social-prices-api/products/dto/updateProduct.dto";
import { serviceMethodsInstance } from "../../../../services/social-prices-api/service-methods";
import CategoriesEnum from "../../../../shared/business/categories/categories.enum";
import { ICategory } from "../../../../shared/business/categories/categories.interface";
import { IProduct } from "../../../../shared/business/products/products.interface";
import { IStore } from "../../../../shared/business/stores/stores.interface";
import TagsEnum from "../../../../shared/business/tags/tags.enum";
import { ITag } from "../../../../shared/business/tags/tags.interface";
import { parseColorPickerToHexString } from "../../../../shared/utils/antd/color-picker/color-picker";
import { sortArray } from "../../../../shared/utils/array/array-functions";
import DatesEnum from "../../../../shared/utils/dates/dates.enum";
import { getFileUrl } from "../../../../shared/utils/images/images-helper";
import { getImageUrl } from "../../../../shared/utils/images/images-url";
import {
  formatterMoney,
  parserMoney,
} from "../../../../shared/utils/strings/string";
import { useFindCategoriesByType } from "../../../categories/useFindCategoriesByType";
import { useFindStoresByUser } from "../../../stores/useFindStoresByUser";
import { useFindTagsByType } from "../../../tags/useFindTagsByType";
import { useFindProductById } from "../../detail/useFindProductById";

const dimensionsFormSchema = z.object({
  size: z.string().optional(),
  height: z.any().optional(),
  width: z.any().optional(),
  length: z.any().optional(),
  depth: z.any().optional(),
  diameter: z.any().optional(),
  thickness: z.any().optional(),
  volume: z.any().optional(),
  weight: z.any().optional(),
});

const _baseFormSchema = z.object({
  name: z.string().trim(),
  quantity: z.any().optional(),
  description: z.string().trim().optional(),
  details: z.string().trim().optional(),
  price: z.any().optional(),
  isActive: z.boolean(),
  storeIds: z.array(z.string()),
  barcode: z.string().trim().optional(),
  sku: z.string().trim().optional(),
  QRCode: z.string().optional(),
  categoriesIds: z.array(z.string()),
  tagsIds: z.array(z.string()),
  brand: z.string().trim().optional(),
  releaseDate: z.any().nullable().optional(),
  expirationDate: z.any().nullable().optional(),
  dimensions: dimensionsFormSchema.optional(),
  colors: z.array(colorSchema).optional(),
});

type TFormSchema = z.infer<typeof _baseFormSchema>;

interface Props {
  productId: string | null;
  onCancel?: (product: IProduct | null) => void | Promise<void>;
  onCreate?: (product: IProduct | null) => void | Promise<void>;
  onUpdate?: (product: IProduct | null) => void | Promise<void>;
}

export const ProductDetail: React.FC<Props> = ({
  productId,
  onCreate,
  onCancel,
  onUpdate,
}) => {
  const { stores, isLoading: isLoadingStores } = useFindStoresByUser();

  const { categories, isLoading: isLoadingCategories } =
    useFindCategoriesByType(CategoriesEnum.Type.PRODUCT);

  const { tags, isLoading: isLoadingTags } = useFindTagsByType(
    TagsEnum.Type.PRODUCT,
  );

  const { product, isLoading } = useFindProductById(productId);

  const { t } = useLanguageData();

  const formSchema = useMemo(
    () =>
      z.object({
        name: z.string().trim().nonempty(t("errors.nameRequired")),
        quantity: z.any().optional(),
        description: z.string().trim().optional(),
        details: z.string().trim().optional(),
        price: z.any().optional(),
        isActive: z.boolean(),
        storeIds: z.array(z.string()).min(1, t("errors.selectAtLeastOneStore")),
        barcode: z.string().trim().optional(),
        sku: z.string().trim().optional(),
        QRCode: z.string().optional(),
        categoriesIds: z.array(z.string()),
        tagsIds: z.array(z.string()),
        brand: z.string().trim().optional(),
        releaseDate: z.any().nullable().optional(),
        expirationDate: z.any().nullable().optional(),
        dimensions: dimensionsFormSchema.optional(),
        colors: z.array(colorSchema).optional(),
      }),
    [t]
  );

  const [formValues, setFormValues] = useState<TFormSchema>();

  const isEditMode: boolean = !!productId && !!product;

  const {
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm<TFormSchema>({
    values: formValues,
    resolver: zodResolver(formSchema),
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const [previewOpen, setPreviewOpen] = useState<boolean>(false);

  const [previewSrc, setPreviewSrc] = useState<string | null>(null);

  useEffect(() => {
    if (product?.filesUrl?.length) {
      const productFilesUrlToFileList = product.filesUrl.map(
        (fileUrl: string, index: number) => ({
          uid: `product-file-${index}`,
          name: fileUrl,
          status: "done",
          url: getImageUrl(fileUrl),
        }),
      );

      setFileList(productFilesUrlToFileList);
    }

    const values: TFormSchema = {
      name: product?.name ?? "",
      description: product?.description ?? "",
      barcode: product?.barcode ?? "",
      sku: product?.sku ?? "",
      details: product?.details ?? "",
      isActive: product ? product.isActive : true,
      price: product?.price ?? 0,
      quantity: product?.quantity ?? 0,
      storeIds: product?.storeIds ?? [],
      QRCode: product?.QRCode ?? "",
      categoriesIds: product?.categoriesIds ?? [],
      tagsIds: product?.tagsIds ?? [],
      brand: product?.brand ?? "",
      releaseDate: product?.releaseDate
        ? moment(product?.releaseDate)
            .utc()
            .format(DatesEnum.Format.YYYYMMDD_DASHED)
        : null,
      expirationDate: product?.expirationDate
        ? moment(product?.expirationDate)
            .utc()
            .format(DatesEnum.Format.YYYYMMDD_DASHED)
        : null,
      colors: map(product?.colors ?? [], (color: string) => ({ value: color })),
      dimensions: {
        size: product?.dimensions?.size ?? "",
        height: product?.dimensions?.height ?? 0,
        width: product?.dimensions?.width ?? 0,
        length: product?.dimensions?.length ?? 0,
        depth: product?.dimensions?.depth ?? 0,
        diameter: product?.dimensions?.diameter ?? 0,
        thickness: product?.dimensions?.thickness ?? 0,
        volume: product?.dimensions?.volume ?? 0,
        weight: product?.dimensions?.weight ?? 0,
      },
    };

    setFormValues(values);
  }, [product]);

  if (
    (productId && isLoading) ||
    isLoadingStores ||
    isLoadingCategories ||
    isLoadingTags
  ) {
    return <LoadingFull />;
  }

  const resetForm = () => {
    setFileList([]);

    reset({
      name: "",
      description: "",
      barcode: "",
      sku: "",
      details: "",
      isActive: true,
      price: 0,
      quantity: 0,
      storeIds: [],
      QRCode: "",
      categoriesIds: [],
      tagsIds: [],
      brand: "",
      releaseDate: null,
      expirationDate: null,
      colors: [],
      dimensions: {
        size: "",
        height: 0,
        width: 0,
        length: 0,
        depth: 0,
        diameter: 0,
        thickness: 0,
        volume: 0,
        weight: 0,
      },
    });
  };

  const onChange: UploadProps["onChange"] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const onPreview = async (file: UploadFile) => {
    let src = file.url as string | null;

    if (!src) {
      src = await getFileUrl(fileList?.[0]);
    }

    setPreviewSrc(src);
    setPreviewOpen(true);
  };

  const onSubmit: SubmitHandler<TFormSchema> = async (data: TFormSchema) => {
    if (isEditMode) {
      await updateProduct(data);
    } else {
      await createProduct(data);
    }
  };

  const createProduct = async (data: TFormSchema) => {
    try {
      // if (fileList.length === 0) {
      //   message.warning("Please select a image.");
      //   return;
      // }

      setIsSubmitting(true);

      const formData = new FormData();

      for (var i = 0; i < fileList.length; i++) {
        formData.append("files", fileList[i].originFileObj as RcFile);
      }

      const createProductDto: CreateProductDto = {
        description: data.description ?? "",
        details: data.details ?? "",
        isActive: data.isActive,
        name: data.name,
        price: data.price ?? 0,
        quantity: data.quantity ?? 0,
        storeIds: data.storeIds,
        barcode: data.barcode ?? null,
        sku: data.sku ?? null,
        QRCode: data.QRCode ?? null,
        categoriesIds: data.categoriesIds ?? [],
        tagsIds: data.tagsIds ?? [],
        brand: data.brand ?? null,
        releaseDate: data.releaseDate
          ? moment
              .utc(data.releaseDate)
              .format(DatesEnum.Format.YYYYMMDD_DASHED)
          : null,
        expirationDate: data.expirationDate
          ? moment
              .utc(data.expirationDate)
              .format(DatesEnum.Format.YYYYMMDD_DASHED)
          : null,
        colors: data.colors?.length
          ? map(
              filter(
                data.colors ?? [],
                (c): c is { value: string } => !!c?.value,
              ),
              (c) => parseColorPickerToHexString(c.value),
            )
          : [],
        dimensions: data?.dimensions as any,
      };

      for (const property of Object.keys(createProductDto)) {
        let value: any = createProductDto[property];

        if (isArray(value) || isObject(value)) {
          value = JSON.stringify(value);
        }

        formData.append([`${property}`], value);
      }

      const product: IProduct =
        await serviceMethodsInstance.productsServiceMethods.create(formData);

      onCreate?.(product);
      resetForm();
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateProduct = async (data: TFormSchema) => {
    try {
      // if (fileList.length === 0) {
      //   message.warning("Please select a image.");
      //   return;
      // }

      setIsSubmitting(true);

      const deletedFilesUrl: string[] = product!.filesUrl.filter(
        (fileUrl: string) => {
          return !fileList.find(
            (file) => file.name === fileUrl && !file.originFileObj,
          );
        },
      );

      const formData = new FormData();

      const fileListToUpload: UploadFile<any>[] = fileList.filter(
        (file) => file.originFileObj,
      );

      for (var i = 0; i < fileListToUpload.length; i++) {
        formData.append("files", fileListToUpload[i].originFileObj as RcFile);
      }

      const updateProductDto: UpdateProductDto = {
        description: data.description ?? "",
        details: data.details ?? "",
        isActive: data.isActive,
        name: data.name,
        price: data.price ?? 0,
        quantity: data.quantity ?? 0,
        barcode: data.barcode ?? null,
        sku: data.sku ?? null,
        storeIds: data.storeIds,
        productId: product!._id,
        QRCode: data.QRCode ?? null,
        deletedFilesUrl,
        categoriesIds: data.categoriesIds ?? [],
        tagsIds: data.tagsIds ?? [],
        brand: data.brand ?? null,
        releaseDate: data.releaseDate
          ? moment
              .utc(data.releaseDate)
              .format(DatesEnum.Format.YYYYMMDD_DASHED)
          : null,
        expirationDate: data.expirationDate
          ? moment
              .utc(data.expirationDate)
              .format(DatesEnum.Format.YYYYMMDD_DASHED)
          : null,
        colors: data.colors?.length
          ? map(
              filter(
                data.colors ?? [],
                (c): c is { value: string } => !!c?.value,
              ),
              (c) => parseColorPickerToHexString(c.value),
            )
          : [],
        dimensions: data?.dimensions as any,
      };

      for (const property of Object.keys(updateProductDto)) {
        let value: any = updateProductDto[property];

        if (isArray(value) || isObject(value)) {
          value = JSON.stringify(value);
        }

        formData.append([`${property}`], value);
      }

      await serviceMethodsInstance.productsServiceMethods.update(formData);

      onUpdate?.(product);
      resetForm();
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-min-80 mt-2">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="content-edit-files flex flex-col justify-start">
          <label className={`text-sm`}>{t("products.images")}</label>

          <div className="mt-2 w-full overflow-auto">
            <ImgCrop rotationSlider modalTitle={t("products.editImages")}>
              <Upload
                action="https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload"
                listType="picture-card"
                fileList={fileList}
                onChange={onChange}
                onPreview={onPreview}
                multiple
              >
                {fileList.length < 10 && `+ ${t("common.upload")}`}
              </Upload>
            </ImgCrop>

            <Modal
              open={previewOpen}
              footer={null}
              onCancel={() => {
                setPreviewSrc(null);
                setPreviewOpen(false);
              }}
            >
              <img
                alt="preview image"
                style={{ width: "100%" }}
                src={previewSrc}
              />
            </Modal>
          </div>
        </div>

        <HrCustom className="my-7" />

        <Row gutter={[16, 16]}>
          <Col xs={24} md={8} sm={12} lg={8}>
            <InputCustomAntd
              controller={{ control, name: "name" }}
              label={t("common.name")}
              placeholder={t("products.enterName")}
              errorMessage={errors.name?.message}
              maxLength={200}
            />
          </Col>

          <Col xs={24} md={8} sm={12} lg={8}>
            <InputCustomAntd
              controller={{ control, name: "barcode" }}
              label={
                <>
                  <span>{t("products.barcode")}</span>
                  {product && (
                    <ProductPreviousBarcodesPopover product={product} />
                  )}
                </>
              }
              placeholder={t("products.enterBarcode")}
              errorMessage={errors.barcode?.message}
              maxLength={100}
            />
          </Col>

          <Col xs={24} md={8} sm={12} lg={8}>
            <InputCustomAntd
              controller={{ control, name: "sku" }}
              label={
                <>
                  <span>{t("products.sku")}</span>
                </>
              }
              placeholder={t("products.enterSku")}
              errorMessage={errors.sku?.message}
              maxLength={400}
            />
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={8} sm={12} lg={8}>
            <InputNumberCustomAntd
              controller={{ control, name: "price" }}
              label={
                <div>
                  <span className="mr-2">{t("common.price")}</span>
                  {product && <ProductHistoricPricesButton product={product} />}
                </div>
              }
              formatter={formatterMoney}
              parser={parserMoney}
            />
          </Col>

          <Col xs={24} md={8} sm={12} lg={8}>
            <InputCustomAntd
              controller={{ control, name: "quantity" }}
              label={t("common.quantity")}
              placeholder={t("products.enterQuantity")}
              type="number"
            />
          </Col>
          <Col xs={24} md={8} sm={12} lg={8}>
            <SelectCustomAntd<IProduct>
              controller={{ control, name: "storeIds" }}
              label={t("products.stores")}
              errorMessage={errors.storeIds?.message}
              placeholder={t("products.selectStores")}
              mode="multiple"
            >
              {stores.map((store: IStore) => (
                <Select.Option key={store._id} value={store._id}>
                  <StoreNameStatus store={store} />
                </Select.Option>
              ))}
            </SelectCustomAntd>
          </Col>
        </Row>

        <Row>
          <Col xs={24} md={8} sm={12} lg={8}>
            <InputCustomAntd
              controller={{ control, name: "brand" }}
              label={t("products.brand")}
              placeholder={t("products.enterBrand")}
              errorMessage={errors.brand?.message}
            />
          </Col>

          <Col xs={24} md={8} sm={12} lg={8}>
            <SelectCustomAntd<IProduct>
              controller={{ control, name: "categoriesIds" }}
              label={t("products.categories")}
              errorMessage={errors.categoriesIds?.message}
              placeholder={t("products.selectCategories")}
              mode="multiple"
            >
              {sortArray(categories, "name").map((category: ICategory) => (
                <Select.Option key={category._id} value={category._id}>
                  <TagCategoryCustomAntd category={category} useTag={false} />
                </Select.Option>
              ))}
            </SelectCustomAntd>
          </Col>

          <Col xs={24} md={8} sm={12} lg={8}>
            <SelectCustomAntd<IProduct>
              controller={{ control, name: "tagsIds" }}
              label={t("products.tags")}
              errorMessage={errors.tagsIds?.message}
              placeholder={t("products.selectTags")}
              mode="multiple"
            >
              {sortArray(tags, "name").map((tag: ITag) => (
                <Select.Option key={tag._id} value={tag._id}>
                  <TagTagCustomAntd tag={tag} useTag={false} />
                </Select.Option>
              ))}
            </SelectCustomAntd>
          </Col>

          <Col xs={24} md={8} sm={12} lg={8}>
            <InputCustomAntd
              controller={{ control, name: "releaseDate" }}
              label={t("products.releaseDate")}
              type="date"
              placeholder={t("products.enterReleaseDate")}
              errorMessage={errors.releaseDate?.message}
            />
          </Col>

          <Col xs={24} md={8} sm={12} lg={8}>
            <InputCustomAntd
              controller={{ control, name: "expirationDate" }}
              label={t("products.expirationDate")}
              type="date"
              placeholder={t("products.enterExpirationDate")}
              errorMessage={errors.expirationDate?.message}
            />
          </Col>
        </Row>

        <Row>
          <Col xs={24} md={8} sm={12} lg={8}>
            <CheckboxCustomAntd<IProduct>
              controller={{ control, name: "isActive" }}
              label={t("products.isActive")}
              labelClassName="mr-1"
            />
          </Col>

          <Col xs={24} md={8} sm={12} lg={8}>
            <div className={`flex flex-col mt-4`}>
              <label className={`text-sm mr-1`}>{t("products.qrcode")}</label>

              <Controller
                control={control}
                name={`QRCode`}
                render={({ field: { onChange, value, name, ref } }) => (
                  <Space direction="vertical" align="start">
                    <QRCode value={value as any} />
                    <Input
                      name={name}
                      placeholder="-"
                      maxLength={60}
                      value={value}
                      onChange={onChange}
                    />
                  </Space>
                )}
              ></Controller>
            </div>
          </Col>
        </Row>

        <Row className="mt-4">
          <Col xs={24}>
            <TextareaCustomAntd
              controller={{ control, name: "description" }}
              label={t("common.description")}
              placeholder={t("common.description")}
              errorMessage={errors.description?.message}
              rows={4}
            />
          </Col>
        </Row>

        <Row className="mt-3">
          <Col xs={24}>
            <TextareaCustomAntd
              controller={{ control, name: "details" }}
              label={t("common.details")}
              placeholder={t("common.details")}
              errorMessage={errors.details?.message}
              rows={4}
            />
          </Col>
        </Row>

        <ContainerTitle title={t("products.dimensions")} className="mt-7">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12} sm={12} lg={5}>
              <InputCustomAntd
                controller={{ control, name: "dimensions.size" }}
                label={t("products.size")}
                placeholder={t("products.size")}
              />
            </Col>

            <Col xs={24} md={12} sm={12} lg={5}>
              <InputCustomAntd
                controller={{ control, name: "dimensions.height" }}
                label={t("products.height")}
                placeholder={t("products.height")}
                type="number"
                min={0}
              />
            </Col>

            <Col xs={24} md={12} sm={12} lg={5}>
              <InputCustomAntd
                controller={{ control, name: "dimensions.width" }}
                label={t("products.width")}
                placeholder={t("products.width")}
                type="number"
                min={0}
              />
            </Col>

            <Col xs={24} md={12} sm={12} lg={5}>
              <InputCustomAntd
                controller={{ control, name: "dimensions.length" }}
                label={t("products.length")}
                placeholder={t("products.length")}
                type="number"
                min={0}
              />
            </Col>

            <Col xs={24} md={12} sm={12} lg={5}>
              <InputCustomAntd
                controller={{ control, name: "dimensions.depth" }}
                label={t("products.depth")}
                placeholder={t("products.depth")}
                type="number"
                min={0}
              />
            </Col>

            <Col xs={24} md={12} sm={12} lg={5}>
              <InputCustomAntd
                controller={{ control, name: "dimensions.diameter" }}
                label={t("products.diameter")}
                placeholder={t("products.diameter")}
                type="number"
                min={0}
              />
            </Col>

            <Col xs={24} md={12} sm={12} lg={5}>
              <InputCustomAntd
                controller={{ control, name: "dimensions.thickness" }}
                label={t("products.thickness")}
                placeholder={t("products.thickness")}
                type="number"
                min={0}
              />
            </Col>

            <Col xs={24} md={12} sm={12} lg={5}>
              <InputCustomAntd
                controller={{ control, name: "dimensions.volume" }}
                label={t("products.volume")}
                placeholder={t("products.volume")}
                type="number"
                min={0}
              />
            </Col>

            <Col xs={24} md={12} sm={12} lg={5}>
              <InputCustomAntd
                controller={{ control, name: "dimensions.weight" }}
                label={t("products.weight")}
                placeholder={t("products.weight")}
                type="number"
                min={0}
              />
            </Col>
          </Row>
        </ContainerTitle>

        <MultiColors control={control} errors={errors} />

        <HrCustom className="my-7" />

        <div className="flex justify-center my-5">
          <Button
            type="default"
            className="mr-2"
            onClick={() => {
              onCancel?.(product);
              resetForm();
            }}
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
    </div>
  );
};
