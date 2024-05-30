"use client";

import { useEffect, useState } from "react";

import { Button, Card, Col, Empty, Image, Row, Select, Tooltip } from "antd";
import { filter, find, includes, reduce } from "lodash";
import moment from "moment";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  addressFormSchema,
  countries,
  generateNewAddress,
  stateCities,
  states,
  TAddressFormSchema,
} from "../../../components/common/Addresses/Addresses";
import LoadingFull from "../../../components/common/LoadingFull/LoadingFull";
import { InputCustomAntd } from "../../../components/custom/antd/InputCustomAntd/InputCustomAntd";
import { InputNumberCustomAntd } from "../../../components/custom/antd/InputNumberCustomAntd/InputNumberCustomAntd";
import { SelectCustomAntd } from "../../../components/custom/antd/SelectCustomAntd/SelectCustomAntd";
import Layout from "../../../components/template/Layout/Layout";
import { ICustomer } from "../../../shared/business/customers/customer.interface";
import AddressEnum from "../../../shared/business/enums/address.enum";
import { IAddress } from "../../../shared/business/interfaces/address.interface";
import SalesEnum from "../../../shared/business/sales/sales.enum";
import { IStore } from "../../../shared/business/stores/stores.interface";
import UsersEnum from "../../../shared/business/users/users.enum";
import DatesEnum from "../../../shared/utils/dates/dates.enum";
import { defaultAvatarImage } from "../../../shared/utils/images/files-names";
import { getImageUrl } from "../../../shared/utils/images/url-images";
import {
  ICityMockData,
  ICountryMockData,
  IStateMockData,
} from "../../../shared/utils/mock-data/interfaces";
import {
  createAddressName,
  formatterMoney,
  parserMoney,
} from "../../../shared/utils/string-extensions/string-extensions";
import { useFindStoresByUser } from "../../stores/useFindStoresByUser";
import {
  AddProductsTable,
  IStoreProductToAddOnSale,
} from "./components/AddProductsTable/AddProductsTable";
import { SelectCustomer } from "./components/SelectCustomer/SelectCustomer";

const customerFormSchema = z.object({
  customerId: z.string().nullable(),
  name: z.string(),
  email: z.string(),
  address: addressFormSchema,
  phoneNumber: z.string().nullable(),
  about: z.string().nullable(),
  birthDate: z.string().nullable(),
  gender: z.string().nullable(),
});

type TCustomerFormSchema = z.infer<typeof customerFormSchema>;

const saleStoreProductFormSchema = z.object({
  productId: z.string(),
  barCode: z.string(),
  name: z.string(),
  note: z.string().nullable(),
  quantity: z.number(),
  price: z.number(),
  fileUrl: z.string().nullable(),
});

type TSaleStoreProductFormSchema = z.infer<typeof saleStoreProductFormSchema>;

const saleStoreFormSchema = z.object({
  storeId: z.string(),
  products: z.array(saleStoreProductFormSchema),
});

type TSaleStoreFormSchema = z.infer<typeof saleStoreFormSchema>;

const showValueNoteFormSchema = z.object({
  show: z.boolean(),
  value: z.number().nullable(),
  note: z.string().nullable(),
});

type TShowValueNoteFormSchema = z.infer<typeof showValueNoteFormSchema>;

const formSchema = z.object({
  customer: customerFormSchema,
  deliveryType: z.string(),
  selectedStoreIds: z.array(z.string()),
  saleStores: z.array(saleStoreFormSchema),
  discount: showValueNoteFormSchema,
  tax: showValueNoteFormSchema,
  shipping: showValueNoteFormSchema,
});

type TFormSchema = z.infer<typeof formSchema>;

const generateShowValueNote = (): TShowValueNoteFormSchema => ({
  show: false,
  note: null,
  value: 0,
});

export default function CreateSalePage() {
  const [formValues, setFormValues] = useState<TFormSchema>();

  const { stores, isLoading: isLoadingStores } = useFindStoresByUser();

  const [selectedCustomer, setSelectedCustomer] = useState<ICustomer | null>(
    null
  );

  const [selectedAddressUid, setSelectedAddressUid] = useState<string | null>(
    null
  );

  const {
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    control,
    watch,
  } = useForm<TFormSchema>({
    values: formValues,
    resolver: zodResolver(formSchema),
  });

  let saleStores: TSaleStoreFormSchema[] = watch("saleStores");
  let deliveryType: string = watch("deliveryType");

  useEffect(() => {
    const showValueNote: TShowValueNoteFormSchema = generateShowValueNote();

    setFormValues({
      ...formValues,
      customer: {
        about: null,
        address: generateNewAddress(),
        birthDate: null,
        customerId: null,
        email: "",
        gender: UsersEnum.Gender.MALE,
        name: "",
        phoneNumber: null,
      },
      deliveryType: SalesEnum.DeliveryType.DELIVERY,
      selectedStoreIds: [],
      saleStores: [],
      discount: showValueNote,
      shipping: showValueNote,
      tax: showValueNote,
    });
  }, []);

  if (isLoadingStores) {
    return <LoadingFull />;
  }

  const handleSelectCustomer = (customer: ICustomer | null) => {
    let firstAddress: IAddress | undefined = find(
      customer?.addresses,
      (customerAddress: IAddress) =>
        includes(customerAddress.types, AddressEnum.Type.SHIPPING)
    );

    firstAddress = firstAddress ?? customer?.addresses?.[0];

    const address: TAddressFormSchema = firstAddress
      ? {
          address1: firstAddress.address1,
          address2: firstAddress.address2,
          city: firstAddress.city,
          countryCode: firstAddress.country.code,
          description: firstAddress.description,
          district: firstAddress.district,
          isValid: firstAddress.isValid,
          types: firstAddress.types,
          uid: firstAddress.uid,
          zip: firstAddress.zip,
          isCollapsed: true,
          stateCode: firstAddress.state?.code!,
        }
      : generateNewAddress();

    setValue("customer", {
      customerId: customer?._id ?? null,
      about: null,
      address,
      birthDate: customer?.birthDate
        ? moment(customer?.birthDate)
            .utc()
            .format(DatesEnum.Format.YYYYMMDD_DASHED)
        : null,
      email: customer?.email ?? "",
      gender: customer?.gender ?? UsersEnum.Gender.MALE,
      name: customer?.name ?? "",
      phoneNumber: customer?.phoneNumbers?.[0]?.number ?? null,
    });

    setSelectedCustomer(customer);

    setSelectedAddressUid(firstAddress?.uid ?? null);
  };

  const handleSelectAddress = (addressUid: string | null) => {
    const findAddress: IAddress | undefined = addressUid
      ? find(selectedCustomer?.addresses, { uid: addressUid })
      : undefined;

    const address: TAddressFormSchema = findAddress
      ? {
          address1: findAddress.address1,
          address2: findAddress.address2,
          city: findAddress.city,
          countryCode: findAddress.country.code,
          description: findAddress.description,
          district: findAddress.district,
          isValid: findAddress.isValid,
          types: findAddress.types,
          uid: findAddress.uid,
          zip: findAddress.zip,
          isCollapsed: true,
          stateCode: findAddress.state?.code!,
        }
      : generateNewAddress();

    setValue("customer.address", address);

    setSelectedAddressUid(addressUid);
  };

  const handleAddProductToSale = (
    productToAddOnSale: IStoreProductToAddOnSale
  ) => {
    const storeProduct: TSaleStoreFormSchema | undefined = find(saleStores, {
      storeId: productToAddOnSale.storeId,
    });

    if (!storeProduct) {
      saleStores.push({
        storeId: productToAddOnSale.storeId,
        products: [
          {
            barCode: productToAddOnSale.product.barCode,
            note: null,
            price: productToAddOnSale.product.price,
            productId: productToAddOnSale.product.productId,
            quantity: productToAddOnSale.product.quantity,
            name: productToAddOnSale.product.name,
            fileUrl: productToAddOnSale.product.fileUrl,
          },
        ],
      });
    } else {
      const storeProductProduct: TSaleStoreProductFormSchema | undefined = find(
        storeProduct.products,
        { productId: productToAddOnSale.product.productId }
      );

      if (storeProductProduct) {
        storeProductProduct.barCode = productToAddOnSale.product.barCode;
        storeProductProduct.note = null;
        storeProductProduct.price = productToAddOnSale.product.price;
        storeProductProduct.productId = productToAddOnSale.product.productId;
        storeProductProduct.quantity += productToAddOnSale.product.quantity;
        storeProductProduct.name = productToAddOnSale.product.name;
        storeProductProduct.fileUrl = productToAddOnSale.product.fileUrl;
      } else {
        storeProduct.products.push({
          barCode: productToAddOnSale.product.barCode,
          note: null,
          price: productToAddOnSale.product.price,
          productId: productToAddOnSale.product.productId,
          quantity: productToAddOnSale.product.quantity,
          name: productToAddOnSale.product.name,
          fileUrl: productToAddOnSale.product.fileUrl,
        });
      }
    }

    setValue("saleStores", saleStores);
  };

  const handleRemoveAllProduct = () => {
    setValue("saleStores", []);
  };

  const handleRemoveAllProductByStore = (storeId: string) => {
    saleStores = filter(
      saleStores,
      (saleStore: TSaleStoreFormSchema) => saleStore.storeId !== storeId
    );

    setValue("saleStores", saleStores);
  };

  const handleRemoveProduct = (storeId: string, productId: string) => {
    const saleStore: TSaleStoreFormSchema | undefined = find(saleStores, {
      storeId,
    });

    if (saleStore?.products?.length && saleStore?.products?.length > 1) {
      saleStore.products = filter(
        saleStore.products,
        (saleStoreProduct: TSaleStoreProductFormSchema) =>
          saleStoreProduct.productId !== productId
      );
    } else {
      saleStores = filter(
        saleStores,
        (saleStore: TSaleStoreFormSchema) => saleStore.storeId !== storeId
      );
    }

    setValue("saleStores", saleStores);
  };

  const renderStoresProducts = () => {
    if (!saleStores?.length) {
      return <Empty />;
    }

    const elementArray: JSX.Element[] = saleStores.map(
      (saleStore: TSaleStoreFormSchema, indexSaleStore: number) => {
        const store: IStore | undefined = find(stores, {
          _id: saleStore.storeId,
        });

        return (
          <div key={store?._id} className="my-2">
            <div
              className={`flex items-center border-b-2 border-slate-100 mb-1 w-full`}
            >
              <label className="my-2 text-lg font-semibold mr-2">
                {store?.name ?? ""}
              </label>

              {saleStore.products.length > 1 ? (
                <Tooltip title="Remove All Products by Store">
                  <Button
                    type="danger"
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() =>
                      handleRemoveAllProductByStore(saleStore.storeId)
                    }
                  />
                </Tooltip>
              ) : null}
            </div>

            <Row className="p-1 px-4 bg-zinc-50 text-black font-semibold">
              <Col xs={8}>Product</Col>
              <Col xs={4}>Quantity</Col>
              <Col xs={4}>Price</Col>
              <Col xs={6}>Note</Col>
              <Col xs={2}></Col>
            </Row>

            {saleStore.products?.map(
              (
                saleStoreProduct: TSaleStoreProductFormSchema,
                indexSaleStoreProduct: number
              ) => {
                const fileUrl: string = saleStoreProduct.fileUrl
                  ? getImageUrl(saleStoreProduct.fileUrl)
                  : defaultAvatarImage;

                return (
                  <Row
                    key={saleStoreProduct.productId}
                    className="border-b border-slate-100 p-2"
                  >
                    <Col xs={8}>
                      <div className="flex items-center">
                        <div className="mr-2">
                          <Image
                            key={`${fileUrl}-${Date.now()}`}
                            width={50}
                            src={fileUrl}
                            onError={() => (
                              <Image
                                key={`${fileUrl}-${Date.now()}`}
                                width={50}
                                src={defaultAvatarImage}
                                alt="mainUrl"
                                className="rounded-full"
                              />
                            )}
                            alt="mainUrl"
                            className="rounded-full"
                          />
                        </div>

                        <div className="flex flex-col">
                          <span className="text-base">
                            {saleStoreProduct.name}
                          </span>

                          <span className="text-xs">
                            {saleStoreProduct.barCode}
                          </span>
                        </div>
                      </div>
                    </Col>

                    <Col xs={4}>
                      <InputNumberCustomAntd
                        divClassName="w-28"
                        controller={{
                          control,
                          name: `saleStores.${indexSaleStore}.products.${indexSaleStoreProduct}.quantity`,
                        }}
                      />
                    </Col>

                    <Col xs={4}>
                      <InputNumberCustomAntd
                        divClassName="w-28"
                        formatter={formatterMoney}
                        parser={parserMoney}
                        controller={{
                          control,
                          name: `saleStores.${indexSaleStore}.products.${indexSaleStoreProduct}.price`,
                        }}
                      />
                    </Col>

                    <Col xs={6}>
                      <InputCustomAntd
                        divClassName="w-32"
                        controller={{
                          control,
                          name: `saleStores.${indexSaleStore}.products.${indexSaleStoreProduct}.note`,
                        }}
                      />
                    </Col>

                    <Col xs={2}>
                      <Tooltip title="Remove Product">
                        <Button
                          type="danger"
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={() =>
                            handleRemoveProduct(
                              saleStore.storeId,
                              saleStoreProduct.productId
                            )
                          }
                        />
                      </Tooltip>
                    </Col>
                  </Row>
                );
              }
            )}
          </div>
        );
      }
    );

    const productsTotals: {
      quantity: number;
      price: number;
    } = reduce(
      saleStores,
      (accSaleStore, saleStore: TSaleStoreFormSchema) => {
        const productsQuantityPrice = reduce(
          saleStore.products,
          (
            accSaleStoreProduct,
            saleStoreProduct: TSaleStoreProductFormSchema
          ) => {
            accSaleStoreProduct.quantity += saleStoreProduct.quantity;
            accSaleStoreProduct.price += saleStoreProduct.price;
            return accSaleStoreProduct;
          },
          {
            quantity: 0,
            price: 0,
          }
        );

        accSaleStore.quantity += productsQuantityPrice.quantity;
        accSaleStore.price += productsQuantityPrice.price;

        return accSaleStore;
      },
      {
        quantity: 0,
        price: 0,
      }
    );

    return (
      <div>
        {elementArray}

        <Row className="p-2 px-4 bg-zinc-100 text-black font-bold">
          <Col xs={8}>SubTotal:</Col>

          <Col xs={4}>
            <Tooltip title="Quantity products selected">
              {productsTotals.quantity}
            </Tooltip>
          </Col>

          <Col xs={12}>
            <Tooltip title="Sum all prices products">
              R${productsTotals.price.toFixed(2)}
            </Tooltip>
          </Col>
        </Row>

        <Row className="border-b px-4 border-slate-100 p-2">
          <Col xs={8}>
            <label className="font-semibold mr-2">Discount:</label>
            <Tooltip title="Edit Discount">
              <Button
                icon={<EditOutlined />}
                size="small"
                onClick={() => {
                  setValue("discount.show", !watch("discount.show"));
                }}
              />
            </Tooltip>
          </Col>

          <Col xs={4}></Col>

          <Col xs={12}>
            {watch("discount.show") ? (
              <InputNumberCustomAntd
                divClassName="w-28"
                formatter={formatterMoney}
                parser={parserMoney}
                controller={{
                  control,
                  name: `discount.value`,
                }}
              />
            ) : (
              <Tooltip title="Discount Value">
                R$ {watch("discount.value")}
              </Tooltip>
            )}
          </Col>
        </Row>

        {deliveryType === SalesEnum.DeliveryType.DELIVERY && (
          <Row className="border-b px-4 border-slate-100 p-2">
            <Col xs={8}>
              <label className="font-semibold mr-2">Shipping:</label>

              <Tooltip title="Edit Shipping">
                <Button
                  icon={<EditOutlined />}
                  size="small"
                  onClick={() => {
                    setValue("shipping.show", !watch("shipping.show"));
                  }}
                />
              </Tooltip>
            </Col>

            <Col xs={4}></Col>

            <Col xs={12}>
              {watch("shipping.show") ? (
                <InputNumberCustomAntd
                  divClassName="w-28"
                  formatter={formatterMoney}
                  parser={parserMoney}
                  controller={{
                    control,
                    name: `shipping.value`,
                  }}
                />
              ) : (
                <Tooltip title="Shipping Value">
                  R$ {watch("shipping.value")}
                </Tooltip>
              )}
            </Col>
          </Row>
        )}

        <Row className="border-b px-4 border-slate-100 p-2">
          <Col xs={8}>
            <label className="font-semibold mr-2">Tax:</label>
            <Tooltip title="Edit Tax">
              <Button
                icon={<EditOutlined />}
                size="small"
                onClick={() => {
                  setValue("tax.show", !watch("tax.show"));
                }}
              />
            </Tooltip>
          </Col>

          <Col xs={4}></Col>

          <Col xs={12}>
            {watch("tax.show") ? (
              <InputNumberCustomAntd
                divClassName="w-28"
                formatter={formatterMoney}
                parser={parserMoney}
                controller={{
                  control,
                  name: `tax.value`,
                }}
              />
            ) : (
              <Tooltip title="Tax Value">R$ {watch("tax.value")}</Tooltip>
            )}
          </Col>
        </Row>

        <Row className="p-2 px-4 bg-zinc-100 text-black font-bold">
          <Col xs={8}>Total:</Col>

          <Col xs={4}>
            <Tooltip title="Quantity products selected">
              {productsTotals.quantity}
            </Tooltip>
          </Col>

          <Col xs={12}>
            <Tooltip title="Sum all prices products">
              R$
              {(
                productsTotals.price -
                watch("discount.value") -
                watch("tax.value") -
                watch("shipping.value")
              ).toFixed(2)}
            </Tooltip>
          </Col>
        </Row>
      </div>
    );
  };

  return (
    <Layout subtitle="Create manual sale" title="Create Sale" hasBackButton>
      <Row gutter={[16, 16]} className="mt-5">
        <Col xs={24}>
          <div className="bg-white w-full py-3 px-5 rounded-md">
            <span className="text-lg mr-2">Sale Number:</span>
            <span className="text-lg font-bold e-radius">{Date.now()}</span>
          </div>
        </Col>
      </Row>

      <Row gutter={[8, 8]} className="mt-2">
        {/* Customer Info */}
        <Col xs={24} md={12}>
          <Card
            title={
              <div className="flex">
                <label className="mr-2">Customer: </label>
                <SelectCustomer onSelectCustomer={handleSelectCustomer} />
              </div>
            }
            className="h-min-80"
          >
            <Row>
              <Col xs={24} md={4}>
                <Tooltip title="See avatar">
                  <Image
                    width={110}
                    height={110}
                    src={
                      selectedCustomer?.avatar
                        ? getImageUrl(selectedCustomer.avatar)
                        : defaultAvatarImage
                    }
                    onError={() => (
                      <Image
                        width={110}
                        height={110}
                        src={defaultAvatarImage}
                        alt="avatar"
                        className="rounded-full shadow-md"
                      />
                    )}
                    alt="avatar"
                    className="rounded-full shadow-md"
                  />
                </Tooltip>
              </Col>

              <Col xs={24} md={10}>
                <InputCustomAntd
                  controller={{ control, name: "customer.name" }}
                  label="Name"
                  divClassName="mt-0"
                  placeholder={"Enter customer name"}
                  errorMessage={errors?.customer?.name?.message}
                  maxLength={200}
                />

                <InputCustomAntd
                  controller={{ control, name: "customer.email" }}
                  label="Email"
                  type="email"
                  divClassName="mt-1"
                  placeholder={"Enter customer email"}
                  errorMessage={errors?.customer?.email?.message}
                  maxLength={200}
                />

                <InputCustomAntd
                  controller={{ control, name: "customer.phoneNumber" }}
                  label="Phone Number"
                  divClassName="mt-1"
                  placeholder={"Enter customer phone number"}
                  errorMessage={errors?.customer?.phoneNumber?.message}
                  maxLength={200}
                />
              </Col>

              <Col xs={24} md={10}>
                <InputCustomAntd
                  controller={{ control, name: "customer.birthDate" }}
                  label="Birth Date"
                  divClassName="mt-0 ml-3"
                  type="date"
                  placeholder={"Enter customer birthDate"}
                  errorMessage={errors?.customer?.birthDate?.message}
                  maxLength={200}
                />

                <SelectCustomAntd
                  controller={{ control, name: "customer.gender" }}
                  label="Gender"
                  divClassName="mt-1 ml-3"
                  errorMessage={errors.customer?.gender?.message}
                >
                  {Object.keys(UsersEnum.Gender).map((gender: string) => (
                    <Select.Option key={gender} value={gender}>
                      {UsersEnum.GenderLabels[gender as UsersEnum.Gender]}
                    </Select.Option>
                  ))}
                </SelectCustomAntd>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Customer Address */}
        <Col xs={24} md={12}>
          <Card
            title={
              <div className="flex justify-between">
                <div className="flex">
                  <label className="mr-2">
                    {selectedCustomer
                      ? "Shipping Address: "
                      : "Shipping Address"}{" "}
                  </label>

                  {selectedCustomer && (
                    <Select
                      style={{ width: 250 }}
                      onChange={handleSelectAddress}
                      defaultValue={null}
                      value={selectedAddressUid}
                    >
                      <Select.Option key={"NEW_ADDRESS"} value={null}>
                        New Address
                      </Select.Option>

                      {selectedCustomer?.addresses.map((address: IAddress) => (
                        <Select.Option key={address.uid} value={address.uid}>
                          <Tooltip title={createAddressName(address)}>
                            {createAddressName(address)}
                          </Tooltip>
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </div>

                <div className="flex">
                  <label className="mr-2">Delivery Type:</label>

                  <SelectCustomAntd
                    controller={{
                      control,
                      name: `deliveryType`,
                    }}
                    divClassName="mt-0"
                    errorMessage={errors?.deliveryType?.message}
                    placeholder={"Select delivery type"}
                    style={{ width: 150 }}
                  >
                    {Object.keys(SalesEnum.DeliveryType).map((type: string) => (
                      <Select.Option key={type} value={type}>
                        <Tooltip title={createAddressName(type)}>
                          {
                            SalesEnum.DeliveryTypeLabels[
                              type as SalesEnum.DeliveryType
                            ]
                          }
                        </Tooltip>
                      </Select.Option>
                    ))}
                  </SelectCustomAntd>
                </div>
              </div>
            }
            className="h-min-80"
          >
            <Row>
              <Col xs={24} md={8}>
                <SelectCustomAntd
                  controller={{
                    control,
                    name: `customer.address.countryCode`,
                  }}
                  divClassName="mt-0"
                  errorMessage={errors?.customer?.address?.countryCode?.message}
                  label="Country"
                  placeholder={"Select country"}
                >
                  {countries.map((country: ICountryMockData) => (
                    <Select.Option key={country.code} value={country.code}>
                      {country.name}
                    </Select.Option>
                  ))}
                </SelectCustomAntd>

                <SelectCustomAntd
                  controller={{ control, name: `customer.address.stateCode` }}
                  errorMessage={errors?.customer?.address?.stateCode?.message}
                  label="State"
                  divClassName="mt-1"
                  placeholder={"Select state"}
                >
                  {states.map((state: IStateMockData) => (
                    <Select.Option key={state.code} value={state.code}>
                      {state.name}
                    </Select.Option>
                  ))}
                </SelectCustomAntd>

                <SelectCustomAntd
                  controller={{ control, name: `customer.address.city` }}
                  errorMessage={errors?.customer?.address?.city?.message}
                  label="City"
                  divClassName="mt-1"
                  placeholder={"Select city"}
                >
                  {stateCities
                    .find(
                      (stateCity: ICityMockData) =>
                        stateCity.stateCode ===
                        formValues?.customer?.address.stateCode
                    )
                    ?.cities.map((city: string) => (
                      <Select.Option key={city} value={city}>
                        {city}
                      </Select.Option>
                    ))}
                </SelectCustomAntd>
              </Col>

              <Col xs={24} md={8}>
                <InputCustomAntd
                  controller={{ control, name: "customer.address.address1" }}
                  label="Address1"
                  divClassName="mt-0 ml-3"
                  placeholder={"Enter address1"}
                  errorMessage={errors?.customer?.address?.address1?.message}
                  maxLength={200}
                />

                <InputCustomAntd
                  controller={{ control, name: "customer.address.address2" }}
                  label="Address2"
                  divClassName="mt-1 ml-3"
                  placeholder={"Enter address2"}
                  errorMessage={errors?.customer?.address?.address2?.message}
                  maxLength={200}
                />

                <InputCustomAntd
                  controller={{ control, name: "customer.address.district" }}
                  label="District"
                  divClassName="mt-1 ml-3"
                  placeholder={"Enter district"}
                  errorMessage={errors?.customer?.address?.district?.message}
                  maxLength={200}
                />
              </Col>

              <Col xs={24} md={8}>
                <InputCustomAntd
                  controller={{ control, name: "customer.address.zip" }}
                  label="Zipcode"
                  divClassName="mt-0 ml-3"
                  placeholder={"Enter zip"}
                  errorMessage={errors?.customer?.address?.zip?.message}
                  maxLength={200}
                />

                <InputCustomAntd
                  controller={{ control, name: "customer.address.description" }}
                  label="Description"
                  divClassName="mt-1 ml-3"
                  placeholder={"Enter description"}
                  errorMessage={errors?.customer?.address?.description?.message}
                  maxLength={200}
                />

                <SelectCustomAntd
                  controller={{ control, name: `customer.address.types` }}
                  label="Types"
                  divClassName="mt-1 ml-3"
                  placeholder={"Select types"}
                  errorMessage={errors?.customer?.address?.types?.message?.toString()}
                  mode="multiple"
                >
                  {Object.keys(AddressEnum.Type).map((type: string) => (
                    <Select.Option key={type} value={type}>
                      {AddressEnum.TypesLabels[type as AddressEnum.Type]}
                    </Select.Option>
                  ))}
                </SelectCustomAntd>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Row gutter={[8, 8]} className="mt-2">
        {/* Select Products */}
        <Col xs={24} md={12}>
          <Card
            title={
              <div className="flex justify-between">
                <span>Select Products</span>

                <span className="flex">
                  <label className="mr-2">Select Stores: </label>
                  <SelectCustomAntd
                    controller={{ control, name: "selectedStoreIds" }}
                    errorMessage={errors.selectedStoreIds?.message}
                    placeholder={"Select stores"}
                    mode="multiple"
                    divClassName="mt-0"
                    style={{ width: 300 }}
                  >
                    {stores.map((store: IStore) => (
                      <Select.Option key={store._id} value={store._id}>
                        {store.name}
                      </Select.Option>
                    ))}
                  </SelectCustomAntd>
                </span>
              </div>
            }
          >
            <AddProductsTable
              selectedStoreIds={watch("selectedStoreIds")}
              stores={stores}
              onAddProductToSale={handleAddProductToSale}
            />
          </Card>
        </Col>

        {/* Selected Products */}
        <Col xs={24} md={12}>
          <Card
            title={
              <div className="flex justify-between">
                <label>Selected Products</label>

                {saleStores?.length > 1 ? (
                  <Tooltip title="Remove All Products">
                    <Button
                      type="danger"
                      icon={<DeleteOutlined />}
                      onClick={handleRemoveAllProduct}
                    />
                  </Tooltip>
                ) : null}
              </div>
            }
          >
            {renderStoresProducts()}
          </Card>
        </Col>
      </Row>
    </Layout>
  );
}
