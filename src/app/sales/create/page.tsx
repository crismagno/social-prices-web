"use client";

import { useEffect, useState } from "react";

import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Image,
  Modal,
  Row,
  Select,
  Tag,
  Tooltip,
} from "antd";
import { filter, find, includes, map, reduce } from "lodash";
import moment from "moment";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

import { CheckCircleOutlined, QuestionCircleTwoTone } from "@ant-design/icons";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  addressFormSchema,
  countries,
  generateNewAddress,
  stateCities,
  states,
  TAddressFormSchema,
} from "../../../components/common/Addresses/Addresses";
import handleClientError from "../../../components/common/handleClientError/handleClientError";
import Loading from "../../../components/common/Loading/Loading";
import LoadingFull from "../../../components/common/LoadingFull/LoadingFull";
import { CheckboxCustomAntd } from "../../../components/custom/antd/CheckboxCustomAntd/CheckboxCustomAntd";
import { InputCustomAntd } from "../../../components/custom/antd/InputCustomAntd/InputCustomAntd";
import { SelectCustomAntd } from "../../../components/custom/antd/SelectCustomAntd/SelectCustomAntd";
import { TextareaCustomAntd } from "../../../components/custom/antd/TextareaCustomAntd/TextareaCustomAntd";
import Layout from "../../../components/template/Layout/Layout";
import useAuthData from "../../../data/context/auth/useAuthData";
import CreateSaleDto, {
  SalePaymentDto,
  SaleStoreDto,
} from "../../../services/social-prices-api/sales/dto/createSale.dto";
import { serviceMethodsInstance } from "../../../services/social-prices-api/ServiceMethods";
import { ICustomer } from "../../../shared/business/customers/customer.interface";
import AddressEnum from "../../../shared/business/enums/address.enum";
import PhoneNumberEnum from "../../../shared/business/enums/phone-number.enum";
import { IAddress } from "../../../shared/business/interfaces/address.interface";
import { ISale } from "../../../shared/business/sales/sale.interface";
import SalesEnum from "../../../shared/business/sales/sales.enum";
import { CreateAddressDto } from "../../../shared/business/shared/dtos/CreateAddress.dto";
import { IStore } from "../../../shared/business/stores/stores.interface";
import UsersEnum from "../../../shared/business/users/users.enum";
import Urls from "../../../shared/common/routes-app/routes-app";
import DatesEnum from "../../../shared/utils/dates/dates.enum";
import { defaultAvatarImage } from "../../../shared/utils/images/files-names";
import { getImageUrl } from "../../../shared/utils/images/url-images";
import {
  ICityMockData,
  ICountryMockData,
  IStateMockData,
} from "../../../shared/utils/mock-data/interfaces";
import { createAddressName } from "../../../shared/utils/string-extensions/string-extensions";
import { useFindStoresByUser } from "../../stores/useFindStoresByUser";
import {
  AddProductsTable,
  IStoreProductToAddOnSale,
} from "./components/AddProductsTable/AddProductsTable";
import {
  generateNewSalePayment,
  salePaymentFormSchema,
  SalePayments,
  TSalePaymentFormSchema,
} from "./components/SalePayments/SalePayments";
import { SelectCustomer } from "./components/SelectCustomer/SelectCustomer";
import { SelectedProductsList } from "./components/SelectedProductsList/SelectedProductsList";

export interface ISaleStoresProductsTotals {
  subtotal: number;
  quantity: number;
}

const customerFormSchema = z.object({
  customerId: z.string().nullable(),
  name: z.string().nonempty("Customer name is required"),
  email: z.string().nonempty("Customer email is required"),
  address: addressFormSchema,
  phoneNumber: z.string().nullable(),
  about: z.string().nullable(),
  birthDate: z.string().nullable(),
  gender: z.string().nullable(),
});

export type TCustomerFormSchema = z.infer<typeof customerFormSchema>;

const saleStoreProductFormSchema = z.object({
  productId: z.string(),
  barCode: z.string(),
  name: z.string(),
  note: z.string().nullable(),
  quantity: z.number(),
  price: z.number(),
  fileUrl: z.string().nullable(),
});

export type TSaleStoreProductFormSchema = z.infer<
  typeof saleStoreProductFormSchema
>;

const saleStoreFormSchema = z.object({
  storeId: z.string(),
  products: z.array(saleStoreProductFormSchema),
});

export type TSaleStoreFormSchema = z.infer<typeof saleStoreFormSchema>;

const showValueNoteFormSchema = z.object({
  show: z.boolean(),
  amount: z.number().nullable(),
  note: z.string().nullable(),
});

export type TShowValueNoteFormSchema = z.infer<typeof showValueNoteFormSchema>;

const formSchema = z.object({
  customer: customerFormSchema,
  deliveryType: z.string(),
  selectedStoreIds: z.array(z.string()),
  saleStores: z.array(saleStoreFormSchema),
  discount: showValueNoteFormSchema,
  tax: showValueNoteFormSchema,
  shipping: showValueNoteFormSchema,
  payments: z.array(salePaymentFormSchema),
  note: z.string().nullable(),
  status: z.string(),
  isCreateQuote: z.boolean(),
  paymentStatus: z.string(),
});

export type TFormSchema = z.infer<typeof formSchema>;

const generateShowAmountNote = (): TShowValueNoteFormSchema => ({
  show: false,
  note: null,
  amount: 0,
});

export default function CreateSalePage() {
  const router: AppRouterInstance = useRouter();

  const { user } = useAuthData();

  const [formValues, setFormValues] = useState<TFormSchema>();

  const { stores, isLoading: isLoadingStores } = useFindStoresByUser();

  const [selectedCustomer, setSelectedCustomer] = useState<ICustomer | null>(
    null
  );

  const [selectedAddressUid, setSelectedAddressUid] = useState<string | null>(
    null
  );

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [isOpenSaleSuccessfullyModal, setIsOpenSaleSuccessfullyModal] =
    useState<boolean>(false);

  const [sale, setSale] = useState<ISale | null>(null);

  const {
    handleSubmit,
    formState: { errors },
    setValue,
    control,
    watch,
  } = useForm<TFormSchema>({
    values: formValues,
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    const showValueNote: TShowValueNoteFormSchema = generateShowAmountNote();

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
      selectedStoreIds: stores.length > 1 ? [stores[0]._id] : [],
      saleStores: [],
      discount: showValueNote,
      shipping: showValueNote,
      tax: showValueNote,
      payments: [generateNewSalePayment()],
      note: null,
      status: SalesEnum.Status.STARTED,
      isCreateQuote: false,
      paymentStatus: SalesEnum.PaymentStatus.PENDING,
    });
  }, []);

  if (isLoadingStores) {
    return <LoadingFull />;
  }

  // Variables Part

  let saleStores: TSaleStoreFormSchema[] = watch("saleStores");

  let deliveryType: string = watch("deliveryType");

  let payments: TSalePaymentFormSchema[] = watch("payments");

  // Handle Events Part

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

  const handleSeeSaleResume = () => {};

  // Calculation Part

  const getSaleStoresProductsTotals = (): ISaleStoresProductsTotals => {
    const totals: ISaleStoresProductsTotals = reduce(
      saleStores,
      (
        accSaleStore: ISaleStoresProductsTotals,
        saleStore: TSaleStoreFormSchema
      ) => {
        const productsQuantityPrice = reduce(
          saleStore.products,
          (
            accSaleStoreProduct: ISaleStoresProductsTotals,
            saleStoreProduct: TSaleStoreProductFormSchema
          ) => {
            accSaleStoreProduct.quantity += saleStoreProduct.quantity;
            accSaleStoreProduct.subtotal += saleStoreProduct.price;
            return accSaleStoreProduct;
          },
          {
            quantity: 0,
            subtotal: 0,
          }
        );

        accSaleStore.quantity += productsQuantityPrice.quantity;
        accSaleStore.subtotal += productsQuantityPrice.subtotal;

        return accSaleStore;
      },
      {
        quantity: 0,
        subtotal: 0,
      }
    );

    return {
      quantity: totals.quantity,
      subtotal: totals.subtotal > 0 ? totals.subtotal : 0,
    };
  };

  const saleStoresProductsTotals: ISaleStoresProductsTotals =
    getSaleStoresProductsTotals();

  const getTotalAfterDiscount = (): number => {
    const discountAmount: number = watch("discount.amount") ?? 0;

    const totalAfterDiscount: number =
      saleStoresProductsTotals.subtotal - discountAmount;

    return totalAfterDiscount > 0 ? totalAfterDiscount : 0;
  };

  const totalAfterDiscount: number = getTotalAfterDiscount();

  const getTotalFinal = (): number => {
    const shippingAmount: number =
      deliveryType === SalesEnum.DeliveryType.DELIVERY
        ? watch("shipping.amount") ?? 0
        : 0;

    const taxAmount: number = watch("tax.amount") ?? 0;

    const totalFinal: number = totalAfterDiscount + shippingAmount + taxAmount;

    return totalFinal > 0 ? totalFinal : 0;
  };

  const totalFinal: number = getTotalFinal();

  const getTotalPayment = (): number => {
    const total: number = reduce(
      payments,
      (acc: number, payment: TSalePaymentFormSchema) => {
        acc += payment.amount;

        return acc;
      },
      0
    );

    return total > 0 ? total : 0;
  };

  const totalPayment: number = getTotalPayment();

  const totalAfterPayment: number = totalFinal - totalPayment;

  const isEnableCreateSale: boolean = saleStores?.length > 0;

  const onSubmit: SubmitHandler<TFormSchema> = async (data: TFormSchema) => {
    try {
      setIsSubmitting(true);

      const address: CreateAddressDto = {
        address1: data.customer.address.address1,
        address2: data.customer.address.address2,
        city: data.customer.address.city,
        country: {
          code: data.customer.address.countryCode,
          name:
            find(countries, { code: data.customer.address.countryCode })
              ?.name ?? "",
        },
        description: data.customer.address.description,
        district: data.customer.address.district,
        state: {
          code: data.customer.address.stateCode,
          name:
            find(states, { code: data.customer.address.stateCode })?.name ?? "",
        },
        types: data.customer.address.types as AddressEnum.Type[],
        uid: data.customer.address.uid,
        zip: data.customer.address.zip,
      };

      const dataSaleStoresLength: number = data.saleStores?.length ?? 0;

      const dataDiscountAmount: number = data.discount.amount ?? 0;

      const dataShippingAmount: number = data.shipping.amount ?? 0;

      const dataTaxAmount: number = data.tax.amount ?? 0;

      const dataDiscountAmountByStore: number =
        dataDiscountAmount / dataSaleStoresLength;

      const dataShippingAmountByStore: number =
        dataShippingAmount / dataSaleStoresLength;

      const dataTaxAmountByStore: number = dataTaxAmount / dataSaleStoresLength;

      const createSaleDto: CreateSaleDto = {
        buyer: {
          address,
          birthDate: data.customer.birthDate
            ? moment(data.customer.birthDate).startOf("day").toDate()
            : null,
          email: data.customer.email,
          gender: data.customer.gender as UsersEnum.Gender,
          name: data.customer.name,
          phoneNumber: {
            messengers: [],
            number: data.customer.phoneNumber ?? "",
            type: PhoneNumberEnum.Type.OTHER,
            uid: `${Date.now()}`,
          },
          userId: selectedCustomer?.userId ?? null,
        },
        createdByUserId: user?._id!,
        header: {
          shipping: {
            address,
          },
          billing: {
            address,
          },
          deliveryType: data.deliveryType as SalesEnum.DeliveryType,
        },
        isCreateQuote: data.isCreateQuote,
        note: data.note,
        payments: map(
          data.payments,
          (payment: TSalePaymentFormSchema): SalePaymentDto => ({
            amount: payment.amount,
            provider: null,
            status: data.paymentStatus as SalesEnum.PaymentStatus,
            type: payment.type as SalesEnum.PaymentType,
          })
        ),
        paymentStatus: data.paymentStatus as SalesEnum.PaymentStatus,
        status: data.status as SalesEnum.Status,
        type: SalesEnum.Type.MANUAL,
        totals: {
          discount: dataDiscountAmount
            ? {
                normal: dataDiscountAmount,
              }
            : null,
          shippingAmount: dataShippingAmount,
          taxAmount: dataTaxAmount,
          subtotalAmount: saleStoresProductsTotals.subtotal,
          totalFinalAmount: totalFinal,
        },
        stores: map(
          data.saleStores,
          (saleStore: TSaleStoreFormSchema): SaleStoreDto => {
            const productsQuantityPrice = reduce(
              saleStore.products,
              (
                accSaleStoreProduct: ISaleStoresProductsTotals,
                saleStoreProduct: TSaleStoreProductFormSchema
              ) => {
                accSaleStoreProduct.quantity += saleStoreProduct.quantity;
                accSaleStoreProduct.subtotal += saleStoreProduct.price;
                return accSaleStoreProduct;
              },
              {
                quantity: 0,
                subtotal: 0,
              }
            );

            const getTotalAfterDiscountByStore = (): number => {
              const totalAfterDiscount: number =
                productsQuantityPrice.subtotal - dataDiscountAmountByStore;

              return totalAfterDiscount > 0 ? totalAfterDiscount : 0;
            };

            const totalAfterDiscountByStore: number =
              getTotalAfterDiscountByStore();

            const getTotalFinalByStore = (): number => {
              const shippingAmount: number =
                deliveryType === SalesEnum.DeliveryType.DELIVERY
                  ? dataShippingAmountByStore
                  : 0;

              const totalFinal: number =
                totalAfterDiscountByStore +
                shippingAmount +
                dataTaxAmountByStore;

              return totalFinal > 0 ? totalFinal : 0;
            };

            const totalFinalAmountByStore: number = getTotalFinalByStore();

            return {
              customerId: data.customer?.customerId ?? null,
              products: saleStore.products,
              storeId: saleStore.storeId,
              totals: {
                discount: dataDiscountAmountByStore
                  ? {
                      normal: dataDiscountAmountByStore,
                    }
                  : null,
                shippingAmount: dataShippingAmountByStore,
                subtotalAmount: productsQuantityPrice.subtotal,
                taxAmount: dataTaxAmountByStore,
                totalFinalAmount: totalFinalAmountByStore,
              },
            };
          }
        ),
      };

      const response: ISale =
        await serviceMethodsInstance.salesServiceMethods.createManual(
          createSaleDto
        );

      setSale(response);

      setIsOpenSaleSuccessfullyModal(true);
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout subtitle="Create manual sale" title="Create Sale" hasBackButton>
      {isSubmitting && (
        <div className="h-full w-full absolute flex justify-center items-center bg-gray-500/30 top-0 left-0 z-50">
          <Loading />
        </div>
      )}

      <Row gutter={[16, 16]} className="mt-5">
        <Col xs={24}>
          <div className="bg-white w-full py-3 px-5 rounded-md">
            <span className="text-lg mr-2">Sale Number: </span>
            {sale?.number ? <Tag>{sale?.number}</Tag> : null}
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
            <Row gutter={[8, 8]}>
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
                  divClassName="mt-0"
                  type="date"
                  placeholder={"Enter customer birthDate"}
                  errorMessage={errors?.customer?.birthDate?.message}
                  maxLength={200}
                />

                <SelectCustomAntd
                  controller={{ control, name: "customer.gender" }}
                  label="Gender"
                  divClassName="mt-1"
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
            <Row gutter={[8, 8]}>
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
                        watch("customer.address.stateCode")
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
                  divClassName="mt-0"
                  placeholder={"Enter address1"}
                  errorMessage={errors?.customer?.address?.address1?.message}
                  maxLength={200}
                />

                <InputCustomAntd
                  controller={{ control, name: "customer.address.address2" }}
                  label="Address2"
                  divClassName="mt-1"
                  placeholder={"Enter address2"}
                  errorMessage={errors?.customer?.address?.address2?.message}
                  maxLength={200}
                />

                <InputCustomAntd
                  controller={{ control, name: "customer.address.district" }}
                  label="District"
                  divClassName="mt-1"
                  placeholder={"Enter district"}
                  errorMessage={errors?.customer?.address?.district?.message}
                  maxLength={200}
                />
              </Col>

              <Col xs={24} md={8}>
                <InputCustomAntd
                  controller={{ control, name: "customer.address.zip" }}
                  label="Zipcode"
                  divClassName="mt-0"
                  placeholder={"Enter zip"}
                  errorMessage={errors?.customer?.address?.zip?.message}
                  maxLength={200}
                />

                <InputCustomAntd
                  controller={{ control, name: "customer.address.description" }}
                  label="Description"
                  divClassName="mt-1"
                  placeholder={"Enter description"}
                  errorMessage={errors?.customer?.address?.description?.message}
                  maxLength={200}
                />

                <SelectCustomAntd
                  controller={{ control, name: `customer.address.types` }}
                  label="Types"
                  divClassName="mt-1"
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
                <div className="flex items-center">
                  <label className="mr-2">Select Products</label>

                  <Tooltip
                    title="Here you can select what stores and products will be on sale, note: only will 
                  show products available in stores selected"
                  >
                    <QuestionCircleTwoTone />
                  </Tooltip>
                </div>

                <span className="flex">
                  <label className="mr-2">Select Stores: </label>
                  <SelectCustomAntd
                    allowClear
                    controller={{ control, name: "selectedStoreIds" }}
                    errorMessage={errors.selectedStoreIds?.message}
                    placeholder={"Select stores"}
                    onClear={handleRemoveAllProduct}
                    onDeselect={handleRemoveAllProductByStore}
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
          <SelectedProductsList
            stores={stores}
            control={control}
            watch={watch}
            setValue={setValue}
            handleRemoveAllProduct={handleRemoveAllProduct}
            handleRemoveAllProductByStore={handleRemoveAllProductByStore}
            handleRemoveProduct={handleRemoveProduct}
            subtotal={saleStoresProductsTotals.subtotal}
            quantity={saleStoresProductsTotals.quantity}
            totalFinal={totalFinal}
            totalAfterDiscount={totalAfterDiscount}
          />
        </Col>
      </Row>

      <Row gutter={[8, 8]} className="mt-2">
        {/* Payment */}
        <Col xs={24} md={12}>
          <SalePayments
            control={control}
            errors={errors}
            totalFinal={totalFinal}
            totalPayment={totalPayment}
            totalAfterPayment={totalAfterPayment}
          />
        </Col>

        {/* Confirmation */}
        <Col xs={24} md={12}>
          <Card
            title={
              <div className="flex justify-between">
                <span>Confirmation</span>
              </div>
            }
          >
            <Row>
              <Col xs={24}>
                <TextareaCustomAntd
                  controller={{ control, name: "note" }}
                  label="Note"
                  divClassName="mt-0"
                  placeholder={"Enter any note if you need"}
                  errorMessage={errors?.note?.message}
                  maxLength={1000}
                />
              </Col>
            </Row>

            <Row>
              <Col xs={24} md={8}>
                <SelectCustomAntd
                  controller={{
                    control,
                    name: `status`,
                  }}
                  label="Sale Status"
                  errorMessage={errors?.status?.message}
                  placeholder={"Select sale status"}
                  style={{ width: 200 }}
                >
                  {Object.keys(SalesEnum.Status).map((status: string) => (
                    <Select.Option key={status} value={status}>
                      <span className="mr-1">
                        {SalesEnum.StatusLabels[status as SalesEnum.Status]}
                      </span>

                      <Badge
                        color={
                          SalesEnum.StatusColors[status as SalesEnum.Status]
                        }
                      />
                    </Select.Option>
                  ))}
                </SelectCustomAntd>
              </Col>

              <Col xs={24} md={8}>
                <SelectCustomAntd
                  controller={{
                    control,
                    name: `paymentStatus`,
                  }}
                  label="Payment Status"
                  errorMessage={errors?.status?.message}
                  placeholder={"Select payment status"}
                  style={{ width: 200 }}
                >
                  {Object.keys(SalesEnum.PaymentStatus).map(
                    (paymentStatus: string) => (
                      <Select.Option key={paymentStatus} value={paymentStatus}>
                        <span className="mr-1">
                          {
                            SalesEnum.PaymentStatusLabels[
                              paymentStatus as SalesEnum.PaymentStatus
                            ]
                          }
                        </span>

                        <Badge
                          color={
                            SalesEnum.PaymentStatusColors[
                              paymentStatus as SalesEnum.PaymentStatus
                            ]
                          }
                        />
                      </Select.Option>
                    )
                  )}
                </SelectCustomAntd>
              </Col>

              <Col xs={24} md={8}>
                <CheckboxCustomAntd
                  controller={{ control, name: "isCreateQuote" }}
                  label="Create Quote"
                />
              </Col>
            </Row>
            <Row>
              <Col xs={24} md={8}>
                <Tooltip title="See sale resume">
                  <Button
                    disabled
                    type="primary"
                    className="mt-4"
                    onClick={handleSeeSaleResume}
                  >
                    See Resume
                  </Button>
                </Tooltip>
              </Col>
            </Row>

            <Row>
              <Col xs={24}>
                <Button
                  type="success"
                  disabled={!isEnableCreateSale}
                  className="w-full text-center mt-5 h-10 font-bold text-lg"
                  onClick={handleSubmit(onSubmit)}
                  loading={isSubmitting}
                >
                  CREATE SALE
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Modal
        title="Sale"
        closable={false}
        open={isOpenSaleSuccessfullyModal}
        cancelButtonProps={{ hidden: true }}
        onOk={() => router.push(Urls.SALES)}
      >
        <Alert
          type="success"
          icon={<CheckCircleOutlined />}
          message={
            <div>
              <div>Sale has been created successfully!</div>
              <div>
                Sale Number: <b>{sale?.number}</b>
              </div>
            </div>
          }
        />
      </Modal>
    </Layout>
  );
}
