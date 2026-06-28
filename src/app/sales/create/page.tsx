"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Alert,
  App,
  Button,
  Card,
  Col,
  Divider,
  Drawer,
  Modal,
  Row,
  Select,
  Tooltip,
  UploadFile,
} from "antd";
import { RcFile } from "antd/es/upload";
import {
  filter,
  find,
  flatMap,
  includes,
  isArray,
  map,
  reduce,
  some,
} from "lodash";
import moment from "moment";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import {
  ReadonlyURLSearchParams,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

import {
  CheckCircleOutlined,
  EnterOutlined,
  EyeOutlined,
  QuestionCircleTwoTone,
  ShoppingCartOutlined,
  TableOutlined,
} from "@ant-design/icons";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  addressFormSchema,
  countries,
  generateNewAddress,
  stateCities,
  states,
  TAddressFormSchema,
} from "../../../components/common/Addresses/Addresses";
import { DeliveryAddressMapButton } from "../../../components/common/DeliveryAddressMapButton/DeliveryAddressMapButton";
import handleClientError from "../../../components/common/HandleClientError/HandleClientError";
import { ImageOrDefault } from "../../../components/common/ImageOrDefault/ImageOrDefault";
import { LabelBadgeCustomAntd } from "../../../components/common/LabelBadgeCustomAntd/LabelBadgeCustomAntd";
import Loading from "../../../components/common/Loading/Loading";
import LoadingFull from "../../../components/common/LoadingFull/LoadingFull";
import { StoreNameStatus } from "../../../components/common/StoreNameStatus/StoreNameStatus";
import { TagCategoryCustomAntd } from "../../../components/common/TagCategoryCustomAntd/TagCategoryCustomAntd";
import { TagTagCustomAntd } from "../../../components/common/TagTagCustomAntd/TagTagCustomAntd";
import { CheckboxCustomAntd } from "../../../components/custom/antd/CheckboxCustomAntd/CheckboxCustomAntd";
import { InputCustomAntd } from "../../../components/custom/antd/InputCustomAntd/InputCustomAntd";
import { SelectCustomAntd } from "../../../components/custom/antd/SelectCustomAntd/SelectCustomAntd";
import { TextareaCustomAntd } from "../../../components/custom/antd/TextareaCustomAntd/TextareaCustomAntd";
import Layout from "../../../components/template/Layout/Layout";
import useAuthData from "../../../data/context/auth/useAuthData";
import useLanguageData from "../../../data/context/language/useLanguageData";
import CreateSaleDto, {
  SalePaymentDto,
  SaleStoreDto,
  SaleStoreProductDto,
} from "../../../services/social-prices-api/sales/dto/createSale.dto";
import UpdateSaleDto from "../../../services/social-prices-api/sales/dto/updateSale.dto";
import UpdateSaleFilesDto from "../../../services/social-prices-api/sales/dto/updateSaleFiles.dto";
import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import { ICustomer } from "../../../shared/business/customers/customer.interface";
import { IProductItem } from "../../../shared/business/product-items/product-items.interface";
import { IProduct } from "../../../shared/business/products/products.interface";
import {
  ISale,
  ISaleStore,
  ISaleStoreProduct,
} from "../../../shared/business/sales/sale.interface";
import SalesEnum from "../../../shared/business/sales/sales.enum";
import AddressEnum from "../../../shared/business/shared/address/address.enum";
import { IAddress } from "../../../shared/business/shared/address/address.interface";
import { CreateAddressDto } from "../../../shared/business/shared/address/CreateAddress.dto";
import PersonEnum from "../../../shared/business/shared/person/person.enum";
import PhoneNumberEnum from "../../../shared/business/shared/phone/phone-number.enum";
import { IStore } from "../../../shared/business/stores/stores.interface";
import CategoriesEnum from "../../../shared/business/categories/categories.enum";
import { ICategory } from "../../../shared/business/categories/categories.interface";
import TagsEnum from "../../../shared/business/tags/tags.enum";
import { ITag } from "../../../shared/business/tags/tags.interface";
import Urls from "../../../shared/common/routes-app/routes-app";
import { sortArray } from "../../../shared/utils/array/array-functions";
import DatesEnum from "../../../shared/utils/dates/dates.enum";
import {
  ICityMockData,
  ICountryMockData,
  IStateMockData,
} from "../../../shared/utils/mock-data/interfaces";
import {
  getPercentageByValue,
  getValueByPercentage,
} from "../../../shared/utils/numbers/numbers";
import { createAddressName } from "../../../shared/utils/strings/string";
import { useFindStoresByUser } from "../../stores/useFindStoresByUser";
import { useFindCategoriesByType } from "../../categories/useFindCategoriesByType";
import { useFindTagsByType } from "../../tags/useFindTagsByType";
import { SaleExtraInfo } from "../components/SaleExtraInfo/SaleExtraInfo";
import SalesTable from "../components/SalesTable/SalesTable";
import { useFindSaleById } from "../useFindSaleById";
import {
  AddProductsTable,
  IStoreProductToAddOnSale,
} from "./components/AddProductsTable/AddProductsTable";
import { AddSaleFiles } from "./components/AddSaleFiles/AddSaleFiles";
import {
  generateNewSalePayment,
  salePaymentFormSchema,
  SalePayments,
  TSalePaymentFormSchema,
} from "./components/SalePayments/SalePayments";
import { SaleSummaryByCreate } from "./components/SaleSummaryByCreate/SaleSummaryByCreate";
import { SelectCustomer } from "./components/SelectCustomer/SelectCustomer";
import { SelectedProductsList } from "./components/SelectedProductsList/SelectedProductsList";

export interface ISaleStoresProductsTotals {
  subtotal: number;
  quantity: number;
}

const customerFormSchema = z.object({
  customerId: z.string().nullable(),
  name: z.string().trim().nonempty(),
  email: z.string().trim().nonempty(),
  address: addressFormSchema,
  phoneNumber: z.string().trim().nullable(),
  about: z.string().trim().nullable(),
  birthDate: z.string().nullable(),
  gender: z.string().nullable(),
});

export type TCustomerFormSchema = z.infer<typeof customerFormSchema>;

const saleStoreProductFormSchema = z.object({
  productId: z.string(),
  barcode: z.string(),
  name: z.string(),
  note: z.string().nullable(),
  quantity: z.number(),
  price: z.number(),
  fileUrl: z.string().nullable(),
  isValid: z.boolean(),
  isCompleted: z.boolean(),
  sku: z.string().nullable(),
  productItemId: z.string(),
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
  deliveryType: z.string().nonempty(),
  selectedStoreIds: z.array(z.string()),
  saleStores: z.array(saleStoreFormSchema),
  discount: showValueNoteFormSchema,
  tax: showValueNoteFormSchema,
  shipping: showValueNoteFormSchema,
  payments: z.array(salePaymentFormSchema),
  note: z.string().trim().nullable(),
  status: z.string().nonempty(),
  isCreateQuote: z.boolean(),
  paymentStatus: z.string().nonempty(),
  tagsIds: z.array(z.string()),
  categoriesIds: z.array(z.string()),
  deliveryAt: z.string().nullable(),
  createdDate: z.string().nullable(),
  numberManual: z.string().nullable(),
  noteToCustomer: z.string().nullable(),
  isSendCustomerNotifications: z.boolean(),
});

export type TFormSchema = z.infer<typeof formSchema>;

const generateShowAmountNote = (): TShowValueNoteFormSchema => ({
  show: false,
  note: null,
  amount: 0,
});

const generateFormSchemaDefault = (): TFormSchema => {
  const showValueNote: TShowValueNoteFormSchema = generateShowAmountNote();

  return {
    customer: {
      about: null,
      address: generateNewAddress(),
      birthDate: null,
      customerId: null,
      email: "",
      gender: PersonEnum.Gender.MALE,
      name: "",
      phoneNumber: null,
    },
    deliveryType: SalesEnum.DeliveryType.DELIVERY,
    selectedStoreIds: [],
    saleStores: [],
    discount: showValueNote,
    shipping: showValueNote,
    tax: showValueNote,
    payments: [generateNewSalePayment()],
    note: null,
    status: SalesEnum.Status.STARTED,
    isCreateQuote: false,
    isSendCustomerNotifications: false,
    paymentStatus: SalesEnum.PaymentStatus.PENDING,
    tagsIds: [],
    categoriesIds: [],
    deliveryAt: null,
    createdDate: null,
    numberManual: null,
    noteToCustomer: null,
  };
};

export default function CreateSalePage() {
  const { modal } = App.useApp();

  const { user, employee } = useAuthData();

  const { t } = useLanguageData();

  const validatedCustomerSchema = useMemo(
    () =>
      z.object({
        customerId: z.string().nullable(),
        name: z.string().trim().nonempty(t("errors.customerNameRequired")),
        email: z.string().trim().nonempty(t("errors.customerEmailRequired")),
        address: addressFormSchema,
        phoneNumber: z.string().trim().nullable(),
        about: z.string().trim().nullable(),
        birthDate: z.string().nullable(),
        gender: z.string().nullable(),
      }),
    [t],
  );

  const validatedFormSchema = useMemo(
    () =>
      z.object({
        customer: validatedCustomerSchema,
        deliveryType: z.string().nonempty(t("errors.deliveryTypeRequired")),
        selectedStoreIds: z.array(z.string()),
        saleStores: z.array(saleStoreFormSchema),
        discount: showValueNoteFormSchema,
        tax: showValueNoteFormSchema,
        shipping: showValueNoteFormSchema,
        payments: z.array(salePaymentFormSchema),
        note: z.string().trim().nullable(),
        status: z.string().nonempty(t("errors.statusRequired")),
        isCreateQuote: z.boolean(),
        paymentStatus: z.string().nonempty(t("errors.paymentStatusRequired")),
        tagsIds: z.array(z.string()),
        categoriesIds: z.array(z.string()),
        deliveryAt: z.string().nullable(),
        createdDate: z.string().nullable(),
        numberManual: z.string().nullable(),
        noteToCustomer: z.string().nullable(),
        isSendCustomerNotifications: z.boolean(),
      }),
    [validatedCustomerSchema, t],
  );

  const router: AppRouterInstance = useRouter();

  const searchParams: ReadonlyURLSearchParams = useSearchParams();

  const [saleIdByParam, setSaleIdByParam] = useState<string | null>(
    searchParams.get("said"),
  );

  const customerIdByParam: string | null = searchParams.get("cid");

  const storeIdByParam: string | null = searchParams.get("sid");

  const productIdByParam: string | null = searchParams.get("pid");

  const productItemIdByParam: string | null = searchParams.get("piid");

  const { sale: saleById, isLoading: isLoadingSaleById } =
    useFindSaleById(saleIdByParam);

  const { stores, isLoading: isLoadingStores } = useFindStoresByUser();

  const { tags, isLoading: isLoadingTags } = useFindTagsByType(
    TagsEnum.Type.SALE,
  );

  const { categories, isLoading: isLoadingCategories } =
    useFindCategoriesByType(CategoriesEnum.Type.SALE);

  const isEditMode: boolean = !!saleIdByParam && !!saleById;

  const [formValues, setFormValues] = useState<TFormSchema>(
    generateFormSchemaDefault(),
  );

  const [selectedCustomer, setSelectedCustomer] = useState<ICustomer | null>(
    null,
  );

  const [selectedAddressUid, setSelectedAddressUid] = useState<string | null>(
    null,
  );

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [isOpenSaleSuccessfullyModal, setIsOpenSaleSuccessfullyModal] =
    useState<boolean>(false);

  const [isOpenSaleSummaryModal, setIsOpenSaleSummaryModal] =
    useState<boolean>(false);

  const [isOpenSalesTable, setIsOpenSalesTable] = useState<boolean>(false);

  const [sale, setSale] = useState<ISale | null>(null);

  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const {
    handleSubmit,
    formState: { errors },
    setValue,
    control,
    watch,
  } = useForm<TFormSchema>({
    values: formValues,
    resolver: zodResolver(validatedFormSchema),
  });

  const handleSelectCustomer = (customer: ICustomer | null) => {
    let firstAddress: IAddress | undefined = find(
      customer?.addresses,
      (customerAddress: IAddress) =>
        includes(customerAddress.types, AddressEnum.Type.SHIPPING),
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
      gender: customer?.gender ?? PersonEnum.Gender.MALE,
      name: customer?.name ?? "",
      phoneNumber: customer?.phoneNumbers?.[0]?.number ?? null,
    });

    setValue("customer.address.types", address.types);

    setSelectedCustomer(customer);

    setSelectedAddressUid(firstAddress?.uid ?? null);
  };

  useEffect(() => {
    const showValueNote: TShowValueNoteFormSchema = generateShowAmountNote();

    if (saleById) {
      const componentWillMountBySaleId = async () => {
        const customerId: string | null =
          saleById.stores?.[0].customerId ?? null;

        const customerBySale: ICustomer | null = customerId
          ? await serviceMethodsInstance.customersServiceMethods.findById(
              customerId,
            )
          : null;

        setSelectedCustomer(customerBySale);

        const saleByIdStoreIds: string[] = map(saleById?.stores, "storeId");

        const saleByIdProductIds: string[] = flatMap(
          saleById.stores,
          (saleByIdStore: ISaleStore) =>
            map(saleByIdStore.products, "productId"),
        );

        const saleByIdProductItemIds: string[] = flatMap(
          saleById.stores,
          (saleByIdStore: ISaleStore) =>
            map(saleByIdStore.products, "productItemId"),
        );

        const products: IProduct[] =
          await serviceMethodsInstance.productsServiceMethods.findByIds(
            saleByIdProductIds,
          );

        const productItems: IProductItem[] =
          await serviceMethodsInstance.productItemsServiceMethods.findByIds(
            saleByIdProductItemIds,
          );

        const saleByIdSaleStores = map(
          saleById?.stores,
          (store: ISaleStore): TSaleStoreFormSchema => ({
            storeId: store.storeId,
            products: map(
              store.products,
              (
                storeProduct: ISaleStoreProduct,
              ): TSaleStoreProductFormSchema => {
                const productItemId =
                  storeProduct.productItem?._id ?? storeProduct.productItemId;

                const productItem: IProductItem | undefined = find(
                  productItems,
                  {
                    _id: productItemId,
                  },
                );

                const product: IProduct | undefined = find(products, {
                  _id: storeProduct.productId,
                });

                const name = productItem?.name ?? product?.name ?? "";
                const fileUrl =
                  productItem?.mainUrl ?? product?.mainUrl ?? null;

                return {
                  barcode: storeProduct.barcode,
                  fileUrl,
                  name,
                  note: storeProduct.note,
                  price: storeProduct.price,
                  productId: storeProduct.productId,
                  quantity: storeProduct.quantity,
                  isCompleted: storeProduct.isCompleted,
                  isValid: storeProduct.isValid,
                  sku: storeProduct.sku,
                  productItemId,
                };
              },
            ),
          }),
        );

        setFormValues({
          customer: {
            about: null,
            address: saleById?.buyer?.address
              ? {
                  address1: saleById.buyer.address.address1,
                  address2: saleById.buyer.address.address2,
                  city: saleById.buyer.address.city,
                  countryCode: saleById.buyer.address.country.code,
                  description: saleById.buyer.address.description,
                  district: saleById.buyer.address.district,
                  isCollapsed: false,
                  isValid: saleById.buyer.address.isValid,
                  stateCode: saleById.buyer.address.state!.code,
                  types: saleById.buyer.address.types,
                  uid: saleById.buyer.address.uid,
                  zip: saleById.buyer.address.zip,
                }
              : generateNewAddress(),
            birthDate: saleById?.buyer?.birthDate
              ? moment(saleById.buyer.birthDate)
                  .utc()
                  .format(DatesEnum.Format.YYYYMMDD_DASHED)
              : null,
            customerId,
            email: saleById?.buyer?.email ?? "",
            gender: saleById?.buyer?.gender ?? PersonEnum.Gender.MALE,
            name: saleById?.buyer?.name ?? "",
            phoneNumber: saleById?.buyer?.phoneNumber?.number ?? null,
          },
          deliveryType:
            saleById?.header?.deliveryType ?? SalesEnum.DeliveryType.DELIVERY,
          selectedStoreIds: saleById
            ? saleByIdStoreIds
            : stores.length > 1
              ? [stores[0]._id]
              : [],
          saleStores: saleByIdSaleStores,
          discount: saleById?.totals.discount
            ? {
                amount: saleById.totals.discount.distributed.amount,
                note: saleById.totals.discount.distributed.note,
                show: false,
              }
            : showValueNote,
          shipping: saleById?.totals.shipping
            ? {
                amount: saleById.totals.shipping.amount,
                note: saleById.totals.shipping.note,
                show: false,
              }
            : showValueNote,
          tax: saleById?.totals.tax
            ? {
                amount: saleById.totals.tax.amount,
                note: saleById.totals.tax.note,
                show: false,
              }
            : showValueNote,
          payments: saleById ? saleById.payments : [generateNewSalePayment()],
          note: saleById?.note ?? null,
          status: saleById?.status ?? SalesEnum.Status.STARTED,
          isCreateQuote: false,
          isSendCustomerNotifications: !!saleById?.isSendCustomerNotifications,
          paymentStatus:
            saleById?.paymentStatus ?? SalesEnum.PaymentStatus.PENDING,
          tagsIds: saleById?.tagsIds ?? [],
          categoriesIds: saleById?.categoriesIds ?? [],
          deliveryAt: saleById?.deliveryAt
            ? moment(saleById.deliveryAt).format(DatesEnum.Format.YYYYMMDD_DASHED)
            : null,
          createdDate: saleById?.createdDate
            ? moment(saleById.createdDate).format(DatesEnum.Format.YYYYMMDD_DASHED)
            : null,
          numberManual: saleById?.numberManual ?? null,
          noteToCustomer: saleById?.noteToCustomer ?? null,
        });
      };

      componentWillMountBySaleId();
      return;
    }

    const initialSelectedStoreIdFromParam: string =
      storeIdByParam ?? stores?.[0]?._id;

    if (productItemIdByParam) {
      const componentWillMountByProductItemIdParam = async () => {
        const productItem: IProductItem | null =
          await serviceMethodsInstance.productItemsServiceMethods.findById(
            productItemIdByParam,
          );

        if (productItem) {
          const firstStoreIdByProduct: string = productItem.storeIds[0];

          const selectedStoreIdFromParam: string =
            initialSelectedStoreIdFromParam ?? firstStoreIdByProduct;

          setValue("saleStores", [
            {
              storeId: selectedStoreIdFromParam,
              products: [
                {
                  barcode: productItem.barcode!,
                  fileUrl: productItem.mainUrl!,
                  name: productItem.name,
                  note: null,
                  price: productItem.price,
                  productId: productItem.productId,
                  quantity: 1,
                  isCompleted: false,
                  isValid: true,
                  sku: productItem.sku,
                  productItemId: productItem._id,
                },
              ],
            },
          ]);
          setValue("selectedStoreIds", [selectedStoreIdFromParam]);
        } else {
          setValue("selectedStoreIds", [initialSelectedStoreIdFromParam]);
        }
      };

      componentWillMountByProductItemIdParam();
    } else if (productIdByParam) {
      const componentWillMountByProductIdParam = async () => {
        const product: IProduct | null =
          await serviceMethodsInstance.productsServiceMethods.findById(
            productIdByParam,
          );

        const productItemDefault: IProductItem | undefined =
          product?.productItemDefault;

        if (product && productItemDefault) {
          const firstStoreIdByProduct: string = product.storeIds[0];

          const selectedStoreIdFromParam: string =
            initialSelectedStoreIdFromParam ?? firstStoreIdByProduct;

          setValue("saleStores", [
            {
              storeId: selectedStoreIdFromParam,
              products: [
                {
                  barcode: productItemDefault.barcode!,
                  fileUrl: productItemDefault.mainUrl!,
                  name: productItemDefault.name,
                  note: null,
                  price: productItemDefault.price,
                  productId: product._id,
                  quantity: 1,
                  isCompleted: false,
                  isValid: true,
                  sku: productItemDefault.sku,
                  productItemId: productItemDefault._id,
                },
              ],
            },
          ]);
          setValue("selectedStoreIds", [selectedStoreIdFromParam]);
        } else {
          setValue("selectedStoreIds", [initialSelectedStoreIdFromParam]);
        }
      };

      componentWillMountByProductIdParam();
    } else {
      setValue("selectedStoreIds", [initialSelectedStoreIdFromParam]);
    }

    if (customerIdByParam) {
      const componentWillMountByCustomerIdParam = async () => {
        const customer: ICustomer | null =
          await serviceMethodsInstance.customersServiceMethods.findById(
            customerIdByParam,
          );

        handleSelectCustomer(customer);
      };

      componentWillMountByCustomerIdParam();
    }
  }, [saleById, customerIdByParam, stores]);

  if (isLoadingStores || isLoadingSaleById || isLoadingTags) {
    return <LoadingFull />;
  }

  // Variables Part

  let saleStores: TSaleStoreFormSchema[] = watch("saleStores");

  let deliveryType: string = watch("deliveryType");

  let payments: TSalePaymentFormSchema[] = watch("payments");

  let customerAddress: TAddressFormSchema | null = watch("customer.address");

  // Handle Events Part

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
    productToAddOnSale: IStoreProductToAddOnSale,
  ) => {
    const storeProduct: TSaleStoreFormSchema | undefined = find(saleStores, {
      storeId: productToAddOnSale.storeId,
    });

    if (!storeProduct) {
      saleStores.push({
        storeId: productToAddOnSale.storeId,
        products: [
          {
            barcode: productToAddOnSale.product.barcode,
            note: null,
            price: productToAddOnSale.product.price,
            productId: productToAddOnSale.product.productId,
            quantity: productToAddOnSale.product.quantity,
            name: productToAddOnSale.product.name,
            fileUrl: productToAddOnSale.product.fileUrl,
            isCompleted: false,
            isValid: true,
            sku: productToAddOnSale.product.sku,
            productItemId: productToAddOnSale.product.productItemId,
          },
        ],
      });
    } else {
      storeProduct.products.push({
        barcode: productToAddOnSale.product.barcode,
        note: null,
        price: productToAddOnSale.product.price,
        productId: productToAddOnSale.product.productId,
        quantity: productToAddOnSale.product.quantity,
        name: productToAddOnSale.product.name,
        fileUrl: productToAddOnSale.product.fileUrl,
        isCompleted: false,
        isValid: true,
        sku: productToAddOnSale.product.sku,
        productItemId: productToAddOnSale.product.productItemId,
      });
    }

    setValue("saleStores", saleStores);
  };

  const handleRemoveAllProduct = () => {
    setValue("saleStores", []);
  };

  const handleRemoveAllProductByStore = (storeId: string) => {
    saleStores = filter(
      saleStores,
      (saleStore: TSaleStoreFormSchema) => saleStore.storeId !== storeId,
    );

    setValue("saleStores", saleStores);
  };

  const handleRemoveProduct = (storeId: string, indexToRemove: number) => {
    const saleStore: TSaleStoreFormSchema | undefined = find(saleStores, {
      storeId,
    });

    if (saleStore?.products?.length && saleStore?.products?.length > 1) {
      saleStore.products = filter(
        saleStore.products,
        (_, indexSaleStoreProduct: number) =>
          indexSaleStoreProduct !== indexToRemove,
      );
    } else {
      saleStores = filter(
        saleStores,
        (saleStore: TSaleStoreFormSchema) => saleStore.storeId !== storeId,
      );
    }

    setValue("saleStores", saleStores);
  };

  // Calculation Part

  const getSaleStoresProductsTotals = (): ISaleStoresProductsTotals => {
    const totals: ISaleStoresProductsTotals = reduce(
      saleStores,
      (
        accSaleStore: ISaleStoresProductsTotals,
        saleStore: TSaleStoreFormSchema,
      ) => {
        const productsQuantityPrice = reduce(
          saleStore.products,
          (
            accSaleStoreProduct: ISaleStoresProductsTotals,
            saleStoreProduct: TSaleStoreProductFormSchema,
          ) => {
            if (!saleStoreProduct.isValid) {
              return accSaleStoreProduct;
            }

            accSaleStoreProduct.quantity += saleStoreProduct.quantity;
            accSaleStoreProduct.subtotal +=
              saleStoreProduct.price * saleStoreProduct.quantity;
            return accSaleStoreProduct;
          },
          {
            quantity: 0,
            subtotal: 0,
          },
        );

        accSaleStore.quantity += productsQuantityPrice.quantity;
        accSaleStore.subtotal += productsQuantityPrice.subtotal;

        return accSaleStore;
      },
      {
        quantity: 0,
        subtotal: 0,
      },
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
        ? (watch("shipping.amount") ?? 0)
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
      0,
    );

    return total > 0 ? total : 0;
  };

  const totalPayment: number = getTotalPayment();

  const totalAfterPayment: number = totalFinal - totalPayment;

  const isEnableCreateSale: boolean = saleStores?.length > 0;

  const validatePayment = () => {
    if (totalAfterPayment !== 0) {
      modal.confirm({
        title: t("sales.confirmPayment"),
        icon: <QuestionCircleTwoTone />,
        content: (
          <Alert
            message={`${t("sales.paymentDifference")}: $${totalAfterPayment.toFixed(2)}`}
            description={t("sales.confirmPaymentMessage")}
            type="warning"
            showIcon
          />
        ),
        okText: t("common.confirm"),
        cancelText: t("common.cancel"),
        onOk: () => {
          callHandleSubmit(false);
        },
        onCancel: () => {},
      });

      return false;
    }

    return true;
  };

  const callHandleSubmit = (shouldValidatePayment: boolean = true) => {
    if (shouldValidatePayment) {
      const isValid = validatePayment();
      if (!isValid) {
        return;
      }
    }

    handleSubmit(onSubmit)();
  };

  const updateSaleFiles = async (
    fileListToUpload: UploadFile[],
    updateSaleFilesDto: UpdateSaleFilesDto,
    defaultSale: ISale,
  ): Promise<ISale> => {
    try {
      if (
        fileListToUpload.length === 0 &&
        updateSaleFilesDto.deletedFilesUrl.length === 0
      ) {
        return defaultSale;
      }

      const formData = new FormData();

      for (var i = 0; i < fileListToUpload.length; i++) {
        formData.append("files", fileListToUpload[i].originFileObj as RcFile);
      }

      for (const property of Object.keys(updateSaleFilesDto)) {
        let value: any = (updateSaleFilesDto as any)[property];

        if (isArray(value)) {
          value = JSON.stringify(value);
        }

        formData.append(property, value);
      }

      return serviceMethodsInstance.salesServiceMethods.updateSaleFiles(
        formData,
      );
    } catch {
      return defaultSale;
    }
  };

  const create = async (createSaleDto: CreateSaleDto): Promise<ISale> => {
    const createdSale: ISale =
      await serviceMethodsInstance.salesServiceMethods.createManual(
        createSaleDto,
      );

    return await updateSaleFiles(
      fileList,
      {
        deletedFilesUrl: [],
        saleId: createdSale._id,
      },
      createdSale,
    );
  };

  const update = async (updateSaleDto: UpdateSaleDto): Promise<ISale> => {
    const updatedSale: ISale =
      await serviceMethodsInstance.salesServiceMethods.updateManual(
        updateSaleDto,
      );

    const fileListToUpload: UploadFile<any>[] = fileList.filter(
      (file) => file.originFileObj,
    );

    const deletedFilesUrl: string[] = filter(
      saleById!.filesUrl,
      (fileUrl: string) => {
        return !fileList.find(
          (file) => file.name === fileUrl && !file.originFileObj,
        );
      },
    );

    return await updateSaleFiles(
      fileListToUpload,
      {
        deletedFilesUrl,
        saleId: updatedSale._id,
      },
      updatedSale,
    );
  };

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

      const dataSaleStoresLength: number =
        filter(data.saleStores, (saleStore) => {
          return some(saleStore.products, { isValid: true });
        })?.length ?? 0;

      const dataDiscountAmount: number = data.discount.amount ?? 0;
      const dataDiscountNote: string | null = data.discount.note;

      const dataShippingAmount: number = data.shipping.amount ?? 0;
      const dataShippingNote: string | null = data.shipping.note;

      const dataTaxAmount: number = data.tax.amount ?? 0;
      const dataTaxNote: string | null = data.tax.note;

      const dataDiscountAmountByStore: number =
        dataDiscountAmount / dataSaleStoresLength;

      const dataShippingAmountByStore: number =
        dataShippingAmount / dataSaleStoresLength;

      const dataTaxAmountByStore: number = dataTaxAmount / dataSaleStoresLength;

      const customerId: string | null = data.customer?.customerId ?? null;

      const createSaleDto: CreateSaleDto = {
        buyer: {
          address,
          birthDate: data.customer.birthDate
            ? moment(data.customer.birthDate).startOf("day").toDate()
            : null,
          email: data.customer.email,
          gender: data.customer.gender as PersonEnum.Gender,
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
        createdByEmployeeId: employee?._id!,
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
        isSendCustomerNotifications: data.isSendCustomerNotifications,
        note: data.note,
        payments: map(
          data.payments,
          (payment: TSalePaymentFormSchema): SalePaymentDto => ({
            amount: payment.amount,
            provider: null,
            status: data.paymentStatus as SalesEnum.PaymentStatus,
            type: payment.type as SalesEnum.PaymentType,
            note: payment.note ?? null,
          }),
        ),
        paymentStatus: data.paymentStatus as SalesEnum.PaymentStatus,
        status: data.status as SalesEnum.Status,
        type: SalesEnum.Type.MANUAL,
        totals: {
          discount: dataDiscountAmount
            ? {
                distributed: {
                  amount: dataDiscountAmount,
                  note: dataDiscountNote,
                },
              }
            : null,
          shipping: { amount: dataShippingAmount, note: dataShippingNote },
          tax: { amount: dataTaxAmount, note: dataTaxNote },
          subtotalAmount: saleStoresProductsTotals.subtotal,
          totalFinalAmount: totalFinal,
        },
        tagsIds: data.tagsIds,
        categoriesIds: data.categoriesIds,
        stores: map(
          data.saleStores,
          (saleStore: TSaleStoreFormSchema): SaleStoreDto => {
            const productsQuantityPrice: ISaleStoresProductsTotals = reduce(
              saleStore.products,
              (
                accSaleStoreProduct: ISaleStoresProductsTotals,
                saleStoreProduct: TSaleStoreProductFormSchema,
              ) => {
                if (!saleStoreProduct.isValid) {
                  return accSaleStoreProduct;
                }

                accSaleStoreProduct.quantity += saleStoreProduct.quantity;
                accSaleStoreProduct.subtotal +=
                  saleStoreProduct.price * saleStoreProduct.quantity;
                return accSaleStoreProduct;
              },
              {
                quantity: 0,
                subtotal: 0,
              },
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
              customerId,
              products: map(
                saleStore.products,
                (saleStoreProduct): SaleStoreProductDto => {
                  const saleStoreProductPercentage: number =
                    getPercentageByValue(
                      saleStoreProduct.price * saleStoreProduct.quantity,
                      productsQuantityPrice.subtotal,
                    );

                  const discountByPercentage: number = getValueByPercentage(
                    saleStoreProductPercentage,
                    dataDiscountAmountByStore,
                  );

                  return {
                    ...saleStoreProduct,
                    discount:
                      saleStoreProduct.isValid && discountByPercentage
                        ? {
                            distributedAmount: +discountByPercentage.toFixed(2),
                          }
                        : null,
                  };
                },
              ),
              storeId: saleStore.storeId,
              totals: {
                discount: dataDiscountAmountByStore
                  ? {
                      distributedAmount: dataDiscountAmountByStore,
                    }
                  : null,
                shipping: {
                  amount: dataShippingAmountByStore,
                  note: dataShippingNote,
                },
                subtotalAmount: productsQuantityPrice.subtotal,
                tax: { amount: dataTaxAmountByStore, note: dataTaxNote },
                totalFinalAmount: totalFinalAmountByStore,
              },
            };
          },
        ),
        deliveryAt: data.deliveryAt ? moment(data.deliveryAt).toDate() : null,
        createdDate: data.createdDate
          ? moment(data.createdDate).toDate()
          : null,
        numberManual: data.numberManual?.trim() ?? null,
        noteToCustomer: data.noteToCustomer?.trim() ?? null,
      };

      let response: ISale | null = null;

      if (isEditMode) {
        const updateSaleDto: UpdateSaleDto = {
          ...createSaleDto,
          updatedByUserId: user!._id,
          updatedByEmployeeId: employee?._id!,
          saleId: saleById!._id,
        };

        response = await update(updateSaleDto);
      } else {
        response = await create(createSaleDto);
      }

      setSale(response);

      setIsOpenSaleSuccessfullyModal(true);
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderGoToSaleButton = (): JSX.Element | null => {
    const saleId: string | undefined = sale?._id ?? saleById?._id;

    if (saleId) {
      return (
        <Tooltip title={t("sales.goToSale")}>
          <Button
            type="primary"
            onClick={() => router.push(Urls.SALE.replace(":saleId", saleId))}
            className="px-3 shadow-lg"
            icon={<EnterOutlined />}
          >
            {t("sales.sale")}
          </Button>
        </Tooltip>
      );
    }

    return null;
  };

  const handleNewSaleAfterSubmit = () => {
    setIsOpenSaleSuccessfullyModal(false);
    router.push(Urls.SALES_CREATE);
    setFormValues(generateFormSchemaDefault());
    setSelectedCustomer(null);
    setSelectedAddressUid(null);
    setFileList([]);
    setSale(null);
    setSaleIdByParam(null);
  };

  return (
    <Layout
      subtitle={
        isEditMode
          ? t("sales.updateManualSaleSubtitle")
          : t("sales.createManualSaleSubtitle")
      }
      title={isEditMode ? t("sales.updateSale") : t("sales.createSale")}
      hasBackButton
    >
      {isSubmitting && (
        <div className="h-full w-full fixed flex justify-center items-center bg-gray-500/30 top-0 left-0 z-50">
          <Loading />
        </div>
      )}

      <Row gutter={[16, 16]} className="mt-5" justify={"end"}>
        <Col xs={24}>
          <div className="bg-white w-full py-3 px-5 rounded-md">
            <div className="flex justify-between w-full">
              <div>
                <span className="text-lg mr-2">
                  {t("sales.saleNumberLabel")}
                </span>
                {saleById?.number ? (
                  <label className="font-bold text-lg">
                    {saleById?.number}
                  </label>
                ) : null}
              </div>

              <div>
                {renderGoToSaleButton()}

                <Tooltip title={t("sales.seeSummaryTooltip")}>
                  <Button
                    type="primary"
                    className="ml-2"
                    onClick={() => setIsOpenSaleSummaryModal(true)}
                    icon={<EyeOutlined />}
                  >
                    {t("sales.seeSummary")}
                  </Button>
                </Tooltip>

                <Tooltip title={t("sales.openCreateSaleTooltip")}>
                  <Button
                    type="primary"
                    href={Urls.SALES_CREATE}
                    target="_blank"
                    icon={<ShoppingCartOutlined />}
                    className="mx-2"
                  >
                    {t("sales.createSale")}
                  </Button>
                </Tooltip>

                <Tooltip title={t("sales.openSalesTooltip")}>
                  <Button
                    type="primary"
                    onClick={() => setIsOpenSalesTable(true)}
                    icon={<TableOutlined />}
                    className="mr-2"
                  >
                    {t("sales.openSales")}
                  </Button>
                </Tooltip>

                <Tooltip title={t("sales.goToSalesTooltip")}>
                  <Button
                    type="primary"
                    onClick={() => router.push(Urls.SALES)}
                    icon={<TableOutlined />}
                  >
                    {t("sales.goToSales")}
                  </Button>
                </Tooltip>
              </div>
            </div>

            {saleById && (
              <>
                <Divider className="my-2" />

                <SaleExtraInfo sale={saleById} />
              </>
            )}
          </div>
        </Col>
      </Row>

      <Row gutter={[8, 8]} className="mt-2">
        {/* Customer Info */}
        <Col xs={24} md={12}>
          <Card
            title={
              <div className="flex">
                <label className="mr-2">{t("sales.customer") + " "}</label>
                {!isEditMode && (
                  <SelectCustomer onSelectCustomer={handleSelectCustomer} />
                )}
              </div>
            }
            className="h-min-80"
          >
            <Row gutter={[8, 8]}>
              <Col xs={24} md={4}>
                <Tooltip title={t("profile.seeAvatar")}>
                  <ImageOrDefault width={110} src={selectedCustomer?.avatar} />
                </Tooltip>
              </Col>

              <Col xs={24} md={10}>
                <InputCustomAntd
                  controller={{ control, name: "customer.name" }}
                  label={t("common.name")}
                  divClassName="mt-0"
                  placeholder={t("sales.enterCustomerName")}
                  errorMessage={errors?.customer?.name?.message}
                  maxLength={200}
                />

                <InputCustomAntd
                  controller={{ control, name: "customer.email" }}
                  label={t("common.email")}
                  type="email"
                  divClassName="mt-1"
                  placeholder={t("sales.enterCustomerEmail")}
                  errorMessage={errors?.customer?.email?.message}
                  maxLength={200}
                />

                <InputCustomAntd
                  controller={{ control, name: "customer.phoneNumber" }}
                  label={t("sales.phoneNumber")}
                  divClassName="mt-1"
                  placeholder={t("sales.enterCustomerPhone")}
                  errorMessage={errors?.customer?.phoneNumber?.message}
                  maxLength={200}
                />
              </Col>

              <Col xs={24} md={10}>
                <InputCustomAntd
                  controller={{ control, name: "customer.birthDate" }}
                  label={t("sales.birthDate")}
                  divClassName="mt-0"
                  type="date"
                  placeholder={t("sales.enterCustomerBirthDate")}
                  errorMessage={errors?.customer?.birthDate?.message}
                  maxLength={200}
                />

                <SelectCustomAntd
                  controller={{ control, name: "customer.gender" }}
                  label={t("sales.gender")}
                  divClassName="mt-1"
                  errorMessage={errors.customer?.gender?.message}
                >
                  {Object.keys(PersonEnum.Gender).map((gender: string) => (
                    <Select.Option key={gender} value={gender}>
                      {t(PersonEnum.GenderLabels[gender as PersonEnum.Gender])}
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
                    <span className="mr-2">{t("address.shippingAddress")}</span>

                    {customerAddress && (
                      <DeliveryAddressMapButton
                        address={{
                          ...customerAddress,
                          country: {
                            code: customerAddress.countryCode,
                            name: customerAddress.countryCode,
                          },
                          state: {
                            code: customerAddress.stateCode,
                            name: customerAddress.stateCode,
                          },
                          types: customerAddress.types as AddressEnum.Type[],
                        }}
                      />
                    )}
                  </label>

                  {selectedCustomer && !isEditMode && (
                    <Select
                      style={{ width: 250 }}
                      onChange={handleSelectAddress}
                      defaultValue={null}
                      value={selectedAddressUid}
                    >
                      <Select.Option key={"NEW_ADDRESS"} value={null}>
                        {t("address.newAddress")}
                      </Select.Option>

                      {selectedCustomer?.addresses.map((address: IAddress) => (
                        <Select.Option key={address.uid} value={address.uid}>
                          <Tooltip title={createAddressName(address, t)}>
                            {createAddressName(address, t)}
                          </Tooltip>
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </div>

                <div className="flex">
                  <label className="mr-2">{t("sales.deliveryType")}</label>

                  <SelectCustomAntd
                    controller={{
                      control,
                      name: `deliveryType`,
                    }}
                    divClassName="mt-0"
                    errorMessage={errors?.deliveryType?.message}
                    placeholder={t("sales.selectDeliveryType")}
                    style={{ width: 150 }}
                  >
                    {Object.keys(SalesEnum.DeliveryType).map((type: string) => (
                      <Select.Option key={type} value={type}>
                        <Tooltip title={createAddressName(type, t)}>
                          {t(
                            SalesEnum.DeliveryTypeLabels[
                              type as SalesEnum.DeliveryType
                            ],
                          )}
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
                  label={t("sales.country")}
                  placeholder={t("address.selectCountry")}
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
                  label={t("sales.state")}
                  divClassName="mt-1"
                  placeholder={t("address.selectState")}
                  showSearch
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
                  label={t("sales.city")}
                  divClassName="mt-1"
                  placeholder={t("address.selectCity")}
                  showSearch
                >
                  {stateCities
                    .find(
                      (stateCity: ICityMockData) =>
                        stateCity.stateCode ===
                        watch("customer.address.stateCode"),
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
                  label={t("sales.address1")}
                  divClassName="mt-0"
                  placeholder={t("address.enterAddress1")}
                  errorMessage={errors?.customer?.address?.address1?.message}
                  maxLength={200}
                />

                <InputCustomAntd
                  controller={{ control, name: "customer.address.address2" }}
                  label={t("sales.address2")}
                  divClassName="mt-1"
                  placeholder={t("address.enterAddress2")}
                  errorMessage={errors?.customer?.address?.address2?.message}
                  maxLength={200}
                />

                <InputCustomAntd
                  controller={{ control, name: "customer.address.district" }}
                  label={t("sales.district")}
                  divClassName="mt-1"
                  placeholder={t("address.enterDistrict")}
                  errorMessage={errors?.customer?.address?.district?.message}
                  maxLength={200}
                />
              </Col>

              <Col xs={24} md={8}>
                <InputCustomAntd
                  controller={{ control, name: "customer.address.zip" }}
                  label={t("sales.zipcode")}
                  divClassName="mt-0"
                  placeholder={t("address.enterZipcode")}
                  errorMessage={errors?.customer?.address?.zip?.message}
                  maxLength={200}
                />

                <InputCustomAntd
                  controller={{ control, name: "customer.address.description" }}
                  label={t("common.description")}
                  divClassName="mt-1"
                  placeholder={t("placeholders.enterDescription")}
                  errorMessage={errors?.customer?.address?.description?.message}
                  maxLength={200}
                />

                <SelectCustomAntd
                  controller={{ control, name: `customer.address.types` }}
                  label={t("sales.types")}
                  divClassName="mt-1"
                  placeholder={t("sales.selectTypes")}
                  errorMessage={errors?.customer?.address?.types?.message?.toString()}
                  mode="multiple"
                >
                  {Object.keys(AddressEnum.Type).map((type: string) => (
                    <Select.Option key={type} value={type}>
                      {t(AddressEnum.TypesLabels[type as AddressEnum.Type])}
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
                  <label className="mr-2">{t("sales.selectProducts")}</label>

                  <Tooltip title={t("sales.selectProductsTooltip")}>
                    <QuestionCircleTwoTone />
                  </Tooltip>
                </div>

                <span className="flex">
                  <label className="mr-2">{t("stores.selectStores")}</label>
                  <SelectCustomAntd
                    allowClear
                    controller={{ control, name: "selectedStoreIds" }}
                    errorMessage={errors.selectedStoreIds?.message}
                    placeholder={t("sales.selectStores")}
                    onClear={handleRemoveAllProduct}
                    onDeselect={(value: any) =>
                      handleRemoveAllProductByStore(value as string)
                    }
                    mode="multiple"
                    divClassName="mt-0"
                    style={{ width: 300 }}
                  >
                    {stores.map((store: IStore) => (
                      <Select.Option key={store._id} value={store._id}>
                        <StoreNameStatus store={store} />
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
                <span>{t("sales.confirmation")}</span>
              </div>
            }
          >
            <Row>
              <Col xs={24}>
                <AddSaleFiles sale={saleById} onSetFileList={setFileList} />
              </Col>
            </Row>

            <Row className="mt-2">
              <Col xs={24}>
                <TextareaCustomAntd
                  controller={{ control, name: "note" }}
                  label={t("common.note")}
                  divClassName="mt-0"
                  placeholder={t("placeholders.enterNote")}
                  errorMessage={errors?.note?.message}
                  maxLength={1000}
                />
              </Col>
            </Row>

            <Row className="mt-2">
              <Col xs={24}>
                <TextareaCustomAntd
                  controller={{ control, name: "noteToCustomer" }}
                  label={t("sales.noteToCustomer")}
                  divClassName="mt-0"
                  placeholder={t("placeholders.enterNote")}
                  errorMessage={errors?.noteToCustomer?.message}
                  maxLength={1000}
                />
              </Col>
            </Row>

            <Row>
              <Col xs={24}>
                <SelectCustomAntd<ICustomer>
                  controller={{ control, name: "tagsIds" }}
                  label={t("sales.tags")}
                  divClassName="mt-3"
                  errorMessage={errors.tagsIds?.message}
                  placeholder={t("sales.selectTags")}
                  mode="multiple"
                >
                  {sortArray(tags, "name").map((tag: ITag) => (
                    <Select.Option key={tag._id} value={tag._id}>
                      <TagTagCustomAntd tag={tag} useTag={false} />
                    </Select.Option>
                  ))}
                </SelectCustomAntd>
              </Col>
            </Row>

            <Row>
              <Col xs={24}>
                <SelectCustomAntd<ICategory>
                  controller={{ control, name: "categoriesIds" }}
                  label={t("sales.categories")}
                  divClassName="mt-3"
                  errorMessage={errors.categoriesIds?.message}
                  placeholder={t("sales.selectCategories")}
                  mode="multiple"
                  loading={isLoadingCategories}
                >
                  {sortArray(categories, "name").map((category: ICategory) => (
                    <Select.Option key={category._id} value={category._id}>
                      <TagCategoryCustomAntd category={category} useTag={false} />
                    </Select.Option>
                  ))}
                </SelectCustomAntd>
              </Col>
            </Row>

            <Row>
              <Col xs={24} md={8}>
                <SelectCustomAntd
                  controller={{
                    control,
                    name: `status`,
                  }}
                  label={t("sales.saleStatus")}
                  errorMessage={errors?.status?.message}
                  placeholder={t("sales.selectSaleStatus")}
                  style={{ width: "100%" }}
                >
                  {Object.keys(SalesEnum.Status).map((status: string) => (
                    <Select.Option key={status} value={status}>
                      <LabelBadgeCustomAntd
                        label={t(
                          SalesEnum.StatusLabels[status as SalesEnum.Status],
                        )}
                        color={
                          SalesEnum.StatusColors[status as SalesEnum.Status]
                        }
                      />
                    </Select.Option>
                  ))}
                </SelectCustomAntd>

                {saleById?.completedAt && (
                  <Tooltip title={t("sales.completedAt")}>
                    <small className="ml-1 italic">
                      {moment(saleById.completedAt).format(
                        DatesEnum.Format.DDMMYYYYhhmmss,
                      )}
                    </small>
                  </Tooltip>
                )}
              </Col>

              <Col xs={24} md={8}>
                <SelectCustomAntd
                  controller={{
                    control,
                    name: `paymentStatus`,
                  }}
                  label={t("sales.paymentStatus")}
                  errorMessage={errors?.status?.message}
                  placeholder={t("sales.selectPaymentStatus")}
                  style={{ width: "100%" }}
                >
                  {Object.keys(SalesEnum.PaymentStatus).map(
                    (paymentStatus: string) => (
                      <Select.Option key={paymentStatus} value={paymentStatus}>
                        <LabelBadgeCustomAntd
                          label={t(
                            SalesEnum.PaymentStatusLabels[
                              paymentStatus as SalesEnum.PaymentStatus
                            ],
                          )}
                          color={
                            SalesEnum.PaymentStatusColors[
                              paymentStatus as SalesEnum.PaymentStatus
                            ]
                          }
                        />
                      </Select.Option>
                    ),
                  )}
                </SelectCustomAntd>
              </Col>

              {!isEditMode && false && (
                <Col xs={24} md={8}>
                  <CheckboxCustomAntd
                    controller={{ control, name: "isCreateQuote" }}
                    label={t("sales.createQuote")}
                  />
                </Col>
              )}
            </Row>

            <Row className="mt-3">
              <Col xs={24} md={8} className="pr-5">
                <InputCustomAntd
                  controller={{ control, name: "deliveryAt" }}
                  label={t("sales.deliveryDate")}
                  divClassName="mt-0"
                  type="date"
                  placeholder={t("sales.enterDeliveryAt")}
                  errorMessage={errors?.deliveryAt?.message}
                />
              </Col>

              <Col xs={24} md={8} className="pr-5">
                <InputCustomAntd
                  controller={{ control, name: "createdDate" }}
                  label={t("sales.createdDate")}
                  divClassName="mt-0"
                  type="date"
                  placeholder={t("sales.enterCreatedDate")}
                  errorMessage={errors?.createdDate?.message}
                />
              </Col>
              <Col xs={24} md={8} className="pr-5">
                <InputCustomAntd
                  controller={{ control, name: "numberManual" }}
                  label={t("sales.saleNumberManual")}
                  divClassName="mt-0"
                  placeholder={t("sales.enterSaleNumberManual")}
                  errorMessage={errors?.numberManual?.message}
                />
              </Col>
            </Row>

            <Row>
              <Col xs={24}>
                <CheckboxCustomAntd
                  controller={{ control, name: "isSendCustomerNotifications" }}
                  label={t("sales.sendCustomerNotifications")}
                  className="ml-1"
                />
              </Col>
            </Row>

            <Row>
              <Col xs={24}>
                <Button
                  type="success"
                  disabled={!isEnableCreateSale}
                  className="w-full text-center mt-5 h-10 font-bold text-lg bg-green-600 hover:bg-green-700"
                  onClick={() => callHandleSubmit(true)}
                  loading={isSubmitting}
                >
                  {isEditMode ? t("sales.saveSale") : t("sales.createSaleBtn")}
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Modal
        title={t("sales.sale")}
        closable={false}
        open={isOpenSaleSuccessfullyModal}
        cancelButtonProps={{ hidden: true }}
        footer={
          <div className="flex justify-end">
            <Button
              type="primary"
              className="mr-2"
              onClick={handleNewSaleAfterSubmit}
              icon={<ShoppingCartOutlined />}
            >
              {t("sales.newSale")}
            </Button>

            {renderGoToSaleButton()}

            <Button
              type="primary"
              className="ml-2"
              onClick={() => router.push(Urls.SALES)}
            >
              {t("sales.goToSales")}
            </Button>
          </div>
        }
      >
        <Alert
          type="success"
          icon={<CheckCircleOutlined />}
          message={
            <div>
              <div>
                {isEditMode
                  ? t("sales.saleUpdatedSuccessfully")
                  : t("sales.saleCreatedSuccessfully")}
              </div>
              <div>
                {t("sales.saleNumberLabel")} <b>{sale?.number}</b>
              </div>
            </div>
          }
        />
      </Modal>

      <Modal
        title={t("sales.saleSummary")}
        open={isOpenSaleSummaryModal}
        cancelButtonProps={{ hidden: true }}
        onOk={() => setIsOpenSaleSummaryModal(false)}
        onCancel={() => setIsOpenSaleSummaryModal(false)}
        width={700}
      >
        <SaleSummaryByCreate
          formSchema={watch()}
          selectedCustomer={selectedCustomer}
          stores={stores}
          tags={tags}
          subtotal={saleStoresProductsTotals.subtotal}
          quantity={saleStoresProductsTotals.quantity}
          totalFinal={totalFinal}
          totalAfterDiscount={totalAfterDiscount}
          totalPayment={totalPayment}
          totalAfterPayment={totalAfterPayment}
        />
      </Modal>

      <Drawer
        open={isOpenSalesTable}
        onClose={() => setIsOpenSalesTable(false)}
        placement="right"
        width={"90%"}
      >
        <SalesTable />
      </Drawer>
    </Layout>
  );
}
