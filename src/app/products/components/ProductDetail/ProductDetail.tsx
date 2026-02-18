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
import { isArray } from "class-validator";
import { filter, isObject, map } from "lodash";
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

const formSchema = z.object({
  name: z.string().trim().nonempty("Name is required"),
  quantity: z.any().optional(),
  description: z.string().trim().optional(),
  details: z.string().trim().optional(),
  price: z.any().optional(),
  isActive: z.boolean(),
  storeIds: z.array(z.string()).min(1, "Should select at least one store"),
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

type TFormSchema = z.infer<typeof formSchema>;

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
    TagsEnum.Type.PRODUCT
  );

  const { product, isLoading } = useFindProductById(productId);

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
        })
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
                (c): c is { value: string } => !!c?.value
              ),
              (c) => parseColorPickerToHexString(c.value)
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
                (c): c is { value: string } => !!c?.value
              ),
              (c) => parseColorPickerToHexString(c.value)
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
              >
                {fileList.length < 10 && "+ Upload"}
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
              label="Name"
              placeholder={"Enter name"}
              errorMessage={errors.name?.message}
              maxLength={200}
            />
          </Col>

          <Col xs={24} md={8} sm={12} lg={8}>
            <InputCustomAntd
              controller={{ control, name: "barcode" }}
              label={
                <>
                  <span>Barcode</span>
                  {product && (
                    <ProductPreviousBarcodesPopover product={product} />
                  )}
                </>
              }
              placeholder={"Enter barcode"}
              errorMessage={errors.barcode?.message}
              maxLength={100}
            />
          </Col>

          <Col xs={24} md={8} sm={12} lg={8}>
            <InputCustomAntd
              controller={{ control, name: "sku" }}
              label={
                <>
                  <span>SKU</span>
                </>
              }
              placeholder={"Enter sku"}
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
                  <span className="mr-2">Price</span>
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
              label="Quantity"
              placeholder={"Enter quantity"}
              type="number"
            />
          </Col>
          <Col xs={24} md={8} sm={12} lg={8}>
            <SelectCustomAntd<IProduct>
              controller={{ control, name: "storeIds" }}
              label="Stores"
              errorMessage={errors.storeIds?.message}
              placeholder={"Select stores"}
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
              label="Brand"
              placeholder={"Enter brand"}
              errorMessage={errors.brand?.message}
            />
          </Col>

          <Col xs={24} md={8} sm={12} lg={8}>
            <SelectCustomAntd<IProduct>
              controller={{ control, name: "categoriesIds" }}
              label="Categories"
              errorMessage={errors.categoriesIds?.message}
              placeholder={"Select categories"}
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
              label="Tags"
              errorMessage={errors.tagsIds?.message}
              placeholder={"Select tags"}
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
              label="Release Date"
              type="date"
              placeholder={"Enter release date"}
              errorMessage={errors.releaseDate?.message}
            />
          </Col>

          <Col xs={24} md={8} sm={12} lg={8}>
            <InputCustomAntd
              controller={{ control, name: "expirationDate" }}
              label="Expiration Date"
              type="date"
              placeholder={"Enter expiration date"}
              errorMessage={errors.expirationDate?.message}
            />
          </Col>
        </Row>

        <Row>
          <Col xs={24} md={8} sm={12} lg={8}>
            <CheckboxCustomAntd<IProduct>
              controller={{ control, name: "isActive" }}
              label="Is Active"
              labelClassName="mr-1"
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
              label="Description"
              placeholder={"Enter description"}
              errorMessage={errors.description?.message}
              rows={4}
            />
          </Col>
        </Row>

        <Row className="mt-3">
          <Col xs={24}>
            <TextareaCustomAntd
              controller={{ control, name: "details" }}
              label="Details"
              placeholder={"Enter details"}
              errorMessage={errors.details?.message}
              rows={4}
            />
          </Col>
        </Row>

        <ContainerTitle title="Dimensions" className="mt-7">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12} sm={12} lg={5}>
              <InputCustomAntd
                controller={{ control, name: "dimensions.size" }}
                label="Size"
                placeholder={"Enter size"}
              />
            </Col>

            <Col xs={24} md={12} sm={12} lg={5}>
              <InputCustomAntd
                controller={{ control, name: "dimensions.height" }}
                label="Height(m)"
                placeholder={"Enter height"}
                type="number"
                min={0}
              />
            </Col>

            <Col xs={24} md={12} sm={12} lg={5}>
              <InputCustomAntd
                controller={{ control, name: "dimensions.width" }}
                label="Width(m)"
                placeholder={"Enter width"}
                type="number"
                min={0}
              />
            </Col>

            <Col xs={24} md={12} sm={12} lg={5}>
              <InputCustomAntd
                controller={{ control, name: "dimensions.length" }}
                label="Length(m)"
                placeholder={"Enter length"}
                type="number"
                min={0}
              />
            </Col>

            <Col xs={24} md={12} sm={12} lg={5}>
              <InputCustomAntd
                controller={{ control, name: "dimensions.depth" }}
                label="Depth(m)"
                placeholder={"Enter depth"}
                type="number"
                min={0}
              />
            </Col>

            <Col xs={24} md={12} sm={12} lg={5}>
              <InputCustomAntd
                controller={{ control, name: "dimensions.diameter" }}
                label="Diameter(m)"
                placeholder={"Enter diameter"}
                type="number"
                min={0}
              />
            </Col>

            <Col xs={24} md={12} sm={12} lg={5}>
              <InputCustomAntd
                controller={{ control, name: "dimensions.thickness" }}
                label="Thickness(m) "
                placeholder={"Enter thickness"}
                type="number"
                min={0}
              />
            </Col>

            <Col xs={24} md={12} sm={12} lg={5}>
              <InputCustomAntd
                controller={{ control, name: "dimensions.volume" }}
                label="Volume(l)"
                placeholder={"Enter volume"}
                type="number"
                min={0}
              />
            </Col>

            <Col xs={24} md={12} sm={12} lg={5}>
              <InputCustomAntd
                controller={{ control, name: "dimensions.weight" }}
                label="Weight(kg)"
                placeholder={"Enter weight"}
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
    </div>
  );
};
