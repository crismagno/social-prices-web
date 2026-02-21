"use client";

import "./styles.scss";

import { useEffect, useState } from "react";

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
import { isArray, isObject } from "class-validator";
import { filter, map } from "lodash";
import moment from "moment";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import z from "zod";

import { zodResolver } from "@hookform/resolvers/zod";

import ContainerTitle from "../../../../components/common/ContainerTitle/ContainerTitle";
import handleClientError from "../../../../components/common/handleClientError/handleClientError";
import HrCustom from "../../../../components/common/HrCustom/HrCustom";
import LoadingFull from "../../../../components/common/LoadingFull/LoadingFull";
import {
  colorSchema,
  MultiColors,
} from "../../../../components/common/MultiColors/MultiColors";
import { ProductPreviousBarcodesPopover } from "../../../../components/common/ProductPreviousBarcodesPopover/ProductPreviousBarcodesPopover";
import SelectProduct from "../../../../components/common/SelectProduct/SelectProduct";
import { TagCategoryCustomAntd } from "../../../../components/common/TagCategoryCustomAntd/TagCategoryCustomAntd";
import { TagTagCustomAntd } from "../../../../components/common/TagTagCustomAntd/TagTagCustomAntd";
import { CheckboxCustomAntd } from "../../../../components/custom/antd/CheckboxCustomAntd/CheckboxCustomAntd";
import { InputCustomAntd } from "../../../../components/custom/antd/InputCustomAntd/InputCustomAntd";
import { InputNumberCustomAntd } from "../../../../components/custom/antd/InputNumberCustomAntd/InputNumberCustomAntd";
import { SelectCustomAntd } from "../../../../components/custom/antd/SelectCustomAntd/SelectCustomAntd";
import { TextareaCustomAntd } from "../../../../components/custom/antd/TextareaCustomAntd/TextareaCustomAntd";
import CreateProductItemDto from "../../../../services/social-prices-api/product-items/dto/createProductItem.dto";
import UpdateProductItemDto from "../../../../services/social-prices-api/product-items/dto/updateProductItem.dto";
import { serviceMethodsInstance } from "../../../../services/social-prices-api/service-methods";
import CategoriesEnum from "../../../../shared/business/categories/categories.enum";
import { ICategory } from "../../../../shared/business/categories/categories.interface";
import { IProductItem } from "../../../../shared/business/product-items/product-items.interface";
import { IProduct } from "../../../../shared/business/products/products.interface";
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
import { useFindProductsByUser } from "../../../products/useFindProductsByUser";
import { useFindTagsByType } from "../../../tags/useFindTagsByType";
import { useFindProductItemById } from "../../useFindProductItemById";

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

const formSchema = z.object({
  name: z.string().trim().nonempty("Name is required"),
  quantity: z.any().optional(),
  description: z.string().trim().optional(),
  details: z.string().trim().optional(),
  price: z.any().optional(),
  isActive: z.boolean(),
  isDefault: z.boolean(),
  productId: z.string().nonempty("Product is required"),
  barcode: z.string().trim().optional(),
  sku: z.string().trim().optional(),
  QRCode: z.string().trim().optional(),
  categoriesIds: z.array(z.string()),
  tagsIds: z.array(z.string()),
  brand: z.string().trim().optional(),
  releaseDate: z.any().nullable().optional(),
  expirationDate: z.any().nullable().optional(),
  dimensions: dimensionsFormSchema.optional(),
  colors: z.array(colorSchema).optional(),
});

type TFormSchema = z.infer<typeof formSchema>;

interface Props {
  productItemId: string | null;
  onCancel?: (productItem: IProductItem | null) => void | Promise<void>;
  onCreate?: (productItem: IProductItem | null) => void | Promise<void>;
  onUpdate?: (productItem: IProductItem | null) => void | Promise<void>;
}

export const ProductItemDetail: React.FC<Props> = ({
  productItemId,
  onCreate,
  onCancel,
  onUpdate,
}) => {
  const { products, isLoading: isLoadingProducts } = useFindProductsByUser();

  const { categories, isLoading: isLoadingCategories } =
    useFindCategoriesByType(CategoriesEnum.Type.PRODUCT);

  const { tags, isLoading: isLoadingTags } = useFindTagsByType(
    TagsEnum.Type.PRODUCT
  );

  const { productItem, isLoading } = useFindProductItemById(productItemId);

  const [formValues, setFormValues] = useState<TFormSchema>();

  const isEditMode: boolean = !!productItemId && !!productItem;
  const isDefaultItem: boolean = productItem?.isDefault ?? false;
  const isReadonly: boolean = isEditMode && isDefaultItem;

  const {
    handleSubmit,
    formState: { errors },
    control,
    reset,
    watch,
    setValue,
  } = useForm<TFormSchema>({
    values: formValues,
    resolver: zodResolver(formSchema),
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const [previewOpen, setPreviewOpen] = useState<boolean>(false);

  const [previewSrc, setPreviewSrc] = useState<string | null>(null);

  useEffect(() => {
    if (productItem?.filesUrl?.length) {
      const productItemFilesUrlToFileList: UploadFile[] =
        productItem.filesUrl.map((fileUrl: string, index: number) => ({
          uid: `product-item-file-${index}`,
          name: fileUrl,
          status: "done" as const,
          url: getImageUrl(fileUrl),
        }));

      setFileList(productItemFilesUrlToFileList);
    }

    const values: TFormSchema = {
      name: productItem?.name ?? "",
      description: productItem?.description ?? "",
      details: productItem?.details ?? "",
      barcode: productItem?.barcode ?? "",
      sku: productItem?.sku ?? "",
      QRCode: productItem?.QRCode ?? "",
      isActive: productItem ? productItem.isActive : true,
      isDefault: productItem ? productItem.isDefault : false,
      price: productItem?.price ?? 0,
      quantity: productItem?.quantity ?? 0,
      productId: productItem?.productId ?? "",
      categoriesIds: productItem?.categoriesIds ?? [],
      tagsIds: productItem?.tagsIds ?? [],
      brand: productItem?.brand ?? "",
      releaseDate: productItem?.releaseDate
        ? moment(productItem?.releaseDate)
            .utc()
            .format(DatesEnum.Format.YYYYMMDD_DASHED)
        : null,
      expirationDate: productItem?.expirationDate
        ? moment(productItem?.expirationDate)
            .utc()
            .format(DatesEnum.Format.YYYYMMDD_DASHED)
        : null,
      colors: map(productItem?.colors ?? [], (color: string) => ({
        value: color,
      })),
      dimensions: {
        size: productItem?.dimensions?.size ?? "",
        height: productItem?.dimensions?.height ?? 0,
        width: productItem?.dimensions?.width ?? 0,
        length: productItem?.dimensions?.length ?? 0,
        depth: productItem?.dimensions?.depth ?? 0,
        diameter: productItem?.dimensions?.diameter ?? 0,
        thickness: productItem?.dimensions?.thickness ?? 0,
        volume: productItem?.dimensions?.volume ?? 0,
        weight: productItem?.dimensions?.weight ?? 0,
      },
    };

    setFormValues(values);
  }, [productItem]);

  if (
    (productItemId && isLoading) ||
    isLoadingProducts ||
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
      isActive: true,
      price: 0,
      quantity: 0,
      productId: "",
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
      await updateProductItem(data);
    } else {
      await createProductItem(data);
    }
  };

  const createProductItem = async (data: TFormSchema) => {
    try {
      setIsSubmitting(true);

      const formData = new FormData();

      for (var i = 0; i < fileList.length; i++) {
        formData.append("files", fileList[i].originFileObj as RcFile);
      }

      const createProductItemDto: CreateProductItemDto = {
        name: data.name,
        description: data.description ?? "",
        details: data.details ?? null,
        price: data.price ?? 0,
        quantity: data.quantity ?? 0,
        isActive: data.isActive,
        isDefault: data.isDefault ?? false,
        barcode: data.barcode ?? null,
        sku: data.sku ?? null,
        QRCode: data.QRCode ?? null,
        productId: data.productId,
        brand: data.brand ?? null,
        categoriesIds: data.categoriesIds ?? [],
        tagsIds: data.tagsIds ?? [],
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
                (c): c is { value: string } => !!c?.value
              ),
              (c) => parseColorPickerToHexString(c.value)
            )
          : [],
        dimensions: data?.dimensions as any,
      };

      for (const property of Object.keys(createProductItemDto)) {
        let value: any = createProductItemDto[property];

        if (isArray(value) || isObject(value)) {
          value = JSON.stringify(value);
        }

        formData.append(property, value);
      }

      const productItem: IProductItem =
        await serviceMethodsInstance.productItemsServiceMethods.create(
          formData
        );

      onCreate?.(productItem);
      resetForm();
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateProductItem = async (data: TFormSchema) => {
    try {
      setIsSubmitting(true);

      const deletedFilesUrl: string[] = productItem!.filesUrl.filter(
        (fileUrl: string) => {
          return !fileList.find(
            (file) => file.name === fileUrl && !file.originFileObj
          );
        }
      );

      const formData = new FormData();

      const fileListToUpload: UploadFile<any>[] = fileList.filter(
        (file) => file.originFileObj
      );

      for (var i = 0; i < fileListToUpload.length; i++) {
        formData.append("files", fileListToUpload[i].originFileObj as RcFile);
      }

      const updateProductItemDto: UpdateProductItemDto = {
        productItemId: productItem!._id,
        name: data.name,
        description: data.description ?? "",
        details: data.details ?? null,
        price: data.price ?? 0,
        quantity: data.quantity ?? 0,
        isActive: data.isActive,
        isDefault: data.isDefault ?? false,
        barcode: data.barcode ?? null,
        sku: data.sku ?? null,
        QRCode: data.QRCode ?? null,
        productId: productItem!.productId,
        brand: data.brand ?? null,
        categoriesIds: data.categoriesIds ?? [],
        tagsIds: data.tagsIds ?? [],
        deletedFilesUrl,
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
                (c): c is { value: string } => !!c?.value
              ),
              (c) => parseColorPickerToHexString(c.value)
            )
          : [],
        dimensions: data?.dimensions as any,
      };

      for (const property of Object.keys(updateProductItemDto)) {
        let value: any = updateProductItemDto[property];

        if (isArray(value) || isObject(value)) {
          value = JSON.stringify(value);
        }

        formData.append(property, value);
      }

      await serviceMethodsInstance.productItemsServiceMethods.update(formData);

      onUpdate?.(productItem);
      resetForm();
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-min-80 mt-2">
      {isReadonly && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
          <p className="text-blue-800">
            ℹ️ This is a default product item. It is automatically synchronized
            with the product and cannot be edited directly. Please edit the
            product to update this item.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="content-edit-files flex flex-col justify-start">
          <label className={`text-sm`}>Images</label>

          <div className="mt-2 w-full overflow-auto">
            <ImgCrop rotationSlider>
              <Upload
                action="https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload"
                listType="picture-card"
                fileList={fileList}
                onChange={onChange}
                onPreview={onPreview}
                multiple
                disabled={isReadonly}
              >
                {fileList.length < 10 && !isReadonly && "+ Upload"}
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
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="preview image"
                style={{ width: "100%" }}
                src={previewSrc ?? undefined}
              />
            </Modal>
          </div>
        </div>

        <HrCustom className="my-7" />

        <Row gutter={[16, 16]}>
          <Col
            xs={24}
            md={8}
            sm={12}
            lg={8}
            className="flex flex-col justify-end"
          >
            <SelectProduct
              label={"Product"}
              labelClassName="font-normal"
              disabled={!!isEditMode}
              selectedProductId={productItem?.productId ?? watch("productId")}
              onSelectProduct={(selectProduct: IProduct | null) => {
                setValue("productId", selectProduct?._id ?? "");
              }}
            />
            {errors.productId?.message && (
              <label className="text-sm text-red-500">
                {errors.productId?.message}
              </label>
            )}
          </Col>

          <Col xs={24} md={8} sm={12} lg={8}>
            <InputCustomAntd
              controller={{ control, name: "name" }}
              label="Name"
              placeholder={"Enter name"}
              errorMessage={errors.name?.message}
              maxLength={200}
              disabled={isReadonly}
            />
          </Col>

          <Col xs={24} md={8} sm={12} lg={8}>
            <InputCustomAntd
              controller={{ control, name: "barcode" }}
              label={
                <>
                  <span>Barcode</span>
                  {productItem && (
                    <ProductPreviousBarcodesPopover product={productItem} />
                  )}
                </>
              }
              placeholder={"Enter barcode"}
              errorMessage={errors.barcode?.message}
              maxLength={100}
              disabled={isReadonly}
            />
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={8} sm={12} lg={8}>
            <InputCustomAntd
              controller={{ control, name: "sku" }}
              label="SKU"
              placeholder={"Enter sku"}
              errorMessage={errors.sku?.message}
              maxLength={400}
              disabled={isReadonly}
            />
          </Col>

          <Col xs={24} md={8} sm={12} lg={8}>
            <InputNumberCustomAntd
              controller={{ control, name: "price" }}
              label="Price"
              formatter={formatterMoney}
              parser={parserMoney}
              disabled={isReadonly}
            />
          </Col>

          <Col xs={24} md={8} sm={12} lg={8}>
            <InputCustomAntd
              controller={{ control, name: "quantity" }}
              label="Quantity"
              placeholder={"Enter quantity"}
              type="number"
              disabled={isReadonly}
            />
          </Col>
        </Row>

        <Row>
          <Col xs={24} md={8} sm={12} lg={8}>
            <InputCustomAntd
              controller={{ control, name: "brand" }}
              label="Brand"
              placeholder={"Enter brand"}
              errorMessage={errors.brand?.message}
              disabled={isReadonly}
            />
          </Col>

          <Col xs={24} md={8} sm={12} lg={8}>
            <SelectCustomAntd<IProductItem>
              controller={{ control, name: "categoriesIds" }}
              label="Categories"
              errorMessage={errors.categoriesIds?.message}
              placeholder={"Select categories"}
              mode="multiple"
              disabled={isReadonly}
            >
              {sortArray(categories, "name").map((category: ICategory) => (
                <Select.Option key={category._id} value={category._id}>
                  <TagCategoryCustomAntd category={category} useTag={false} />
                </Select.Option>
              ))}
            </SelectCustomAntd>
          </Col>

          <Col xs={24} md={8} sm={12} lg={8}>
            <SelectCustomAntd<IProductItem>
              controller={{ control, name: "tagsIds" }}
              label="Tags"
              errorMessage={errors.tagsIds?.message}
              placeholder={"Select tags"}
              mode="multiple"
              disabled={isReadonly}
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
              label="Release Date"
              type="date"
              placeholder={"Enter release date"}
              errorMessage={errors.releaseDate?.message as string}
              disabled={isReadonly}
            />
          </Col>

          <Col xs={24} md={8} sm={12} lg={8}>
            <InputCustomAntd
              controller={{ control, name: "expirationDate" }}
              label="Expiration Date"
              type="date"
              placeholder={"Enter expiration date"}
              errorMessage={errors.expirationDate?.message as string}
              disabled={isReadonly}
            />
          </Col>
        </Row>

        <Row>
          <Col xs={24} md={8} sm={12} lg={8}>
            <CheckboxCustomAntd<IProductItem>
              controller={{ control, name: "isActive" }}
              label="Is Active"
              labelClassName="mr-1"
              disabled={isReadonly}
            />
          </Col>

          <Col xs={24} md={8} sm={12} lg={8}>
            <CheckboxCustomAntd<IProductItem>
              controller={{ control, name: "isDefault" }}
              label="Is Default"
              labelClassName="mr-1"
              disabled={true}
            />
          </Col>

          <Col xs={24} md={8} sm={12} lg={8}>
            <div className={`flex flex-col mt-4`}>
              <label className={`text-sm mr-1`}>QRCode</label>

              <Controller
                control={control}
                name={`QRCode`}
                render={({ field: { onChange, value, name, ref } }) => (
                  <Space direction="vertical" align="start">
                    <QRCode value={value ?? ""} />
                    <Input
                      name={name}
                      placeholder="-"
                      maxLength={60}
                      value={value}
                      onChange={onChange}
                      disabled={isReadonly}
                    />
                  </Space>
                )}
              />
            </div>
          </Col>
        </Row>

        <Row className="mt-4">
          <Col xs={24}>
            <TextareaCustomAntd
              controller={{ control, name: "description" }}
              label="Description"
              placeholder={"Enter description"}
              errorMessage={errors.description?.message}
              rows={4}
              disabled={isReadonly}
            />
          </Col>
        </Row>

        <Row gutter={[16, 16]} className="mt-4">
          <Col xs={24}>
            <TextareaCustomAntd
              controller={{ control, name: "details" }}
              label="Details"
              placeholder={"Enter details"}
              errorMessage={errors.details?.message}
              rows={4}
              disabled={isReadonly}
            />
          </Col>
        </Row>

        <ContainerTitle title="Dimensions" className="mt-7">
          <Row>
            <Col xs={24} md={4} sm={6} lg={5}>
              <InputCustomAntd
                controller={{ control, name: "dimensions.size" }}
                label="Size"
                placeholder={"Enter size"}
                disabled={isReadonly}
              />
            </Col>

            <Col xs={24} md={4} sm={6} lg={5}>
              <InputCustomAntd
                controller={{ control, name: "dimensions.height" }}
                label="Height(m)"
                placeholder={"Enter height"}
                type="number"
                min={0}
                disabled={isReadonly}
              />
            </Col>

            <Col xs={24} md={4} sm={6} lg={5}>
              <InputCustomAntd
                controller={{ control, name: "dimensions.width" }}
                label="Width(m)"
                placeholder={"Enter width"}
                type="number"
                min={0}
                disabled={isReadonly}
              />
            </Col>

            <Col xs={24} md={4} sm={6} lg={5}>
              <InputCustomAntd
                controller={{ control, name: "dimensions.length" }}
                label="Length(m)"
                placeholder={"Enter length"}
                type="number"
                min={0}
                disabled={isReadonly}
              />
            </Col>

            <Col xs={24} md={4} sm={6} lg={5}>
              <InputCustomAntd
                controller={{ control, name: "dimensions.depth" }}
                label="Depth(m)"
                placeholder={"Enter depth"}
                type="number"
                min={0}
                disabled={isReadonly}
              />
            </Col>

            <Col xs={24} md={4} sm={6} lg={5}>
              <InputCustomAntd
                controller={{ control, name: "dimensions.diameter" }}
                label="Diameter(m)"
                placeholder={"Enter diameter"}
                type="number"
                min={0}
                disabled={isReadonly}
              />
            </Col>

            <Col xs={24} md={4} sm={6} lg={5}>
              <InputCustomAntd
                controller={{ control, name: "dimensions.thickness" }}
                label="Thickness(m)"
                placeholder={"Enter thickness"}
                type="number"
                min={0}
                disabled={isReadonly}
              />
            </Col>

            <Col xs={24} md={4} sm={6} lg={5}>
              <InputCustomAntd
                controller={{ control, name: "dimensions.volume" }}
                label="Volume(l)"
                placeholder={"Enter volume"}
                type="number"
                min={0}
                disabled={isReadonly}
              />
            </Col>

            <Col xs={24} md={4} sm={6} lg={5}>
              <InputCustomAntd
                controller={{ control, name: "dimensions.weight" }}
                label="Weight(kg)"
                placeholder={"Enter weight"}
                type="number"
                min={0}
                disabled={isReadonly}
              />
            </Col>
          </Row>
        </ContainerTitle>

        <MultiColors control={control} errors={errors} disabled={isReadonly} />

        <HrCustom className="my-7" />

        <div className="flex justify-center my-5">
          <Button
            type="default"
            className="mr-2"
            onClick={() => {
              onCancel?.(productItem);
              resetForm();
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          {!isReadonly && (
            <Button
              type="primary"
              onClick={handleSubmit(onSubmit)}
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              {isEditMode ? "Save" : "Create"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};
