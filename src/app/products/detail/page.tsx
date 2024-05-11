"use client";

import "./styles.scss";

import { useEffect, useState } from "react";

import {
  Button,
  Card,
  Col,
  Input,
  message,
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
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context";
import {
  ReadonlyURLSearchParams,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import z from "zod";

import { zodResolver } from "@hookform/resolvers/zod";

import FormInput from "../../../components/common/FormInput/FormInput";
import FormTextarea from "../../../components/common/FormTextarea/FormTextarea";
import handleClientError from "../../../components/common/handleClientError/handleClientError";
import HrCustom from "../../../components/common/HrCustom/HrCustom";
import LoadingFull from "../../../components/common/LoadingFull/LoadingFull";
import { TagCategoryCustomAntd } from "../../../components/common/TagCategoryCustomAntd/TagCategoryCustomAntd";
import { CheckboxCustomAntd } from "../../../components/custom/antd/CheckboxCustomAntd/CheckboxCustomAntd";
import { InputNumberCustomAntd } from "../../../components/custom/antd/InputNumberCustomAntd/InputNumberCustomAntd";
import { SelectCustomAntd } from "../../../components/custom/antd/SelectCustomAntd/SelectCustomAntd";
import Layout from "../../../components/template/Layout/Layout";
import CreateProductDto from "../../../services/social-prices-api/products/dto/createProduct.dto";
import UpdateProductDto from "../../../services/social-prices-api/products/dto/updateProduct.dto";
import { serviceMethodsInstance } from "../../../services/social-prices-api/ServiceMethods";
import CategoriesEnum from "../../../shared/business/categories/categories.enum";
import { ICategory } from "../../../shared/business/categories/categories.interface";
import { IProduct } from "../../../shared/business/products/products.interface";
import { IStore } from "../../../shared/business/stores/stores.interface";
import { sortArray } from "../../../shared/utils/array/functions";
import { getFileUrl } from "../../../shared/utils/images/helper";
import { getImageUrl } from "../../../shared/utils/images/url-images";
import {
  formatterMoney,
  parserMoney,
} from "../../../shared/utils/string-extensions/string-extensions";
import { useFindCategoriesByType } from "../../categories/useFindCategoriesByType";
import { useFindStoresByUser } from "../../stores/useFindStoresByUser";
import { useFindProductById } from "./useFindProductById";

const formSchema = z.object({
  name: z.string().nonempty("Name is required"),
  quantity: z.any().optional(),
  description: z.string().optional(),
  details: z.string().optional(),
  price: z.any().optional(),
  isActive: z.boolean(),
  storeIds: z.array(z.string()),
  barCode: z.string().optional(),
  QRCode: z.string().optional(),
  categoriesIds: z.array(z.string()),
});

type TFormSchema = z.infer<typeof formSchema>;

export default function ProductDetailPage() {
  const router: AppRouterInstance = useRouter();

  const searchParams: ReadonlyURLSearchParams = useSearchParams();

  const { stores, isLoading: isLoadingStores } = useFindStoresByUser();

  const { categories, isLoading: isLoadingCategories } =
    useFindCategoriesByType(CategoriesEnum.Type.PRODUCT);

  const productId: string | null = searchParams.get("pid");

  const { product, isLoading } = useFindProductById(productId);

  const [formValues, setFormValues] = useState<TFormSchema>();

  const isEditMode: boolean = !!productId && !!product;

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<TFormSchema>({
    values: formValues,
    resolver: zodResolver(formSchema),
  });

  const [isSubmitting, setIsSUbmitting] = useState<boolean>(false);

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
      barCode: product?.barCode ?? "",
      details: product?.details ?? "",
      isActive: product ? product.isActive : true,
      price: product?.price ?? 0,
      quantity: product?.quantity ?? 0,
      storeIds: product?.storeIds ?? [],
      QRCode: product?.QRCode ?? "",
      categoriesIds: product?.categoriesIds ?? [],
    };

    setFormValues(values);
  }, [product]);

  if ((productId && isLoading) || isLoadingStores || isLoadingCategories) {
    return <LoadingFull />;
  }

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
      if (fileList.length === 0) {
        message.warning("Please select a image.");
        return;
      }

      setIsSUbmitting(true);

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
        barCode: data.barCode ?? null,
        QRCode: data.QRCode ?? null,
        categoriesIds: data.categoriesIds ?? [],
      };

      for (const property of Object.keys(createProductDto)) {
        let value: any = createProductDto[property];

        if (isArray(value)) {
          value = JSON.stringify(value);
        }

        formData.append([`${property}`], value);
      }

      await serviceMethodsInstance.productsServiceMethods.create(formData);

      message.success("Your product has been created successfully!");

      router.back();
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsSUbmitting(false);
    }
  };

  const updateProduct = async (data: TFormSchema) => {
    try {
      if (fileList.length === 0) {
        message.warning("Please select a image.");
        return;
      }

      setIsSUbmitting(true);

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
        barCode: data.barCode ?? null,
        storeIds: data.storeIds,
        productId: product!._id,
        QRCode: data.QRCode ?? null,
        deletedFilesUrl,
        categoriesIds: data.categoriesIds ?? [],
      };

      for (const property of Object.keys(updateProductDto)) {
        let value: any = updateProductDto[property];

        if (isArray(value)) {
          value = JSON.stringify(value);
        }

        formData.append([`${property}`], value);
      }

      await serviceMethodsInstance.productsServiceMethods.update(formData);

      message.success("Your product has been update successfully!");

      router.back();
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsSUbmitting(false);
    }
  };

  return (
    <Layout
      subtitle={isEditMode ? "Edit product details" : "New product details"}
      title={isEditMode ? "Edit product" : "New product"}
      hasBackButton
    >
      <Card className="h-min-80 mt-2">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="content-edit-files flex flex-col justify-start">
            <label className={`text-sm`}>Images</label>

            <div className="mt-2">
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
            <Col xs={24} md={8}>
              <FormInput
                label="Name"
                placeholder={"Enter name"}
                defaultValue={product?.name}
                register={register}
                registerName="name"
                registerOptions={{ required: true }}
                errorMessage={errors.name?.message}
                maxLength={200}
              />
            </Col>

            <Col xs={24} md={8}>
              <FormInput
                label="Barcode"
                placeholder={"Enter barcode"}
                defaultValue={product?.barCode}
                register={register}
                registerName="barCode"
                errorMessage={errors.barCode?.message}
                maxLength={100}
                divClassName="pl-0"
              />
            </Col>

            <Col xs={24} md={8}>
              <FormInput
                label="Description"
                placeholder={"Enter description"}
                defaultValue={product?.description}
                register={register}
                registerName="description"
                errorMessage={errors.description?.message}
                maxLength={200}
              />
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <InputNumberCustomAntd
                controller={{ control, name: "price" }}
                label="Price"
                formatter={formatterMoney}
                parser={parserMoney}
              />
            </Col>

            <Col xs={24} md={8}>
              <FormInput
                label="Quantity"
                placeholder={"Enter quantity"}
                defaultValue={product?.quantity}
                register={register}
                registerName="quantity"
                type="number"
              />
            </Col>
            <Col xs={24} md={8}>
              <SelectCustomAntd<IProduct>
                controller={{ control, name: "storeIds" }}
                label="Stores"
                errorMessage={errors.storeIds?.message}
                placeholder={"Select stores"}
                mode="multiple"
              >
                {stores.map((store: IStore) => (
                  <Select.Option key={store._id} value={store._id}>
                    {store.name}
                  </Select.Option>
                ))}
              </SelectCustomAntd>
            </Col>
          </Row>

          <Row>
            <Col xs={24} md={8}>
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
            <Col xs={24} md={8}>
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

            <Col xs={24} md={8}>
              <CheckboxCustomAntd<IProduct>
                controller={{ control, name: "isActive" }}
                label="Is Active"
              />
            </Col>
          </Row>

          <Row>
            <Col xs={24}>
              <FormTextarea
                label="Details"
                placeholder={"Enter details"}
                defaultValue={product?.details}
                register={register}
                registerName="details"
                errorMessage={errors.details?.message}
                rows={2}
              />
            </Col>
          </Row>

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
