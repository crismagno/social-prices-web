import { useState } from 'react';

import {
  Alert,
  App,
  Avatar,
  Button,
  Checkbox,
  Collapse,
  Drawer,
  Empty,
  Image,
  Input,
  InputNumber,
  Segmented,
  Select,
  Tag,
} from 'antd';
import {
  groupBy,
  map,
  sumBy,
} from 'lodash';
import moment from 'moment';
import { useRouter } from 'next/navigation';

import {
  CheckCircleOutlined,
  DeleteOutlined,
  EnterOutlined,
  EyeOutlined,
  ShoppingCartOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';

import {
  SelectCustomer,
} from '../../../app/sales/create/components/SelectCustomer/SelectCustomer';
import { useFindStoresByUser } from '../../../app/stores/useFindStoresByUser';
import useAuthData from '../../../data/context/auth/useAuthData';
import useLanguageData from '../../../data/context/language/useLanguageData';
import CreateSaleDto, {
  SaleStoreDto,
  SaleStoreProductDto,
} from '../../../services/social-prices-api/sales/dto/createSale.dto';
import {
  serviceMethodsInstance,
} from '../../../services/social-prices-api/service-methods';
import {
  ICustomer,
} from '../../../shared/business/customers/customer.interface';
import { ISale } from '../../../shared/business/sales/sale.interface';
import SalesEnum from '../../../shared/business/sales/sales.enum';
import AddressEnum from '../../../shared/business/shared/address/address.enum';
import {
  IAddress,
} from '../../../shared/business/shared/address/address.interface';
import {
  CreateAddressDto,
} from '../../../shared/business/shared/address/CreateAddress.dto';
import PersonEnum from '../../../shared/business/shared/person/person.enum';
import PhoneNumberEnum
  from '../../../shared/business/shared/phone/phone-number.enum';
import { IStore } from '../../../shared/business/stores/stores.interface';
import Urls from '../../../shared/common/routes-app/routes-app';
import { getImageUrl } from '../../../shared/utils/images/images-url';
import ImagesEnum from '../../../shared/utils/images/images.enum';
import {
  formatterMoney,
  formatToMoneyDecimal,
  parserMoney,
} from '../../../shared/utils/strings/string';
import {
  countries,
  states,
} from '../Addresses/Addresses';
import handleClientError from '../HandleClientError/HandleClientError';
import {
  LabelBadgeCustomAntd,
} from '../LabelBadgeCustomAntd/LabelBadgeCustomAntd';
import { SendSaleSummary } from '../SendSaleSummary/SendSaleSummary';
import { TagStoreCustomAntd } from '../TagStoreCustomAntd/TagStoreCustomAntd';
import {
  emptyFastSaleDetails,
  FastSaleDetails,
  IFastSaleDetails,
} from './FastSaleDetails';
import {
  FastSaleProductPicker,
  IFastSaleItem,
} from './FastSaleProductPicker';
import { FastSaleSummaryModal } from './FastSaleSummaryModal';

interface Props {
  open: boolean;
  onClose: () => void;
}

const parseAddress = (
  address: IAddress | undefined,
): CreateAddressDto | null =>
  address
    ? {
        address1: address.address1,
        address2: address.address2,
        city: address.city,
        country: address.country,
        description: address.description,
        district: address.district,
        state: address.state ?? { code: "", name: "" },
        types: address.types,
        uid: address.uid,
        zip: address.zip,
      }
    : null;

interface IDeliveryAddress {
  address1: string;
  address2: string;
  district: string;
  city: string;
  stateCode: string;
  zip: string;
}

const emptyDeliveryAddress: IDeliveryAddress = {
  address1: "",
  address2: "",
  district: "",
  city: "",
  stateCode: "",
  zip: "",
};

interface INewCustomer {
  name: string;
  email: string;
  phone: string;
}

const Section: React.FC<{
  title: string;
  extra?: React.ReactNode;
  children?: React.ReactNode;
}> = ({ title, extra, children }) => (
  <section
    className="flex flex-col gap-2 rounded-lg border border-gray-200 p-3
      dark:border-gray-700"
  >
    <div className="flex items-center justify-between gap-3">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {title}
      </h4>

      {extra}
    </div>

    {children}
  </section>
);

const emptyNewCustomer: INewCustomer = { name: "", email: "", phone: "" };

export const FastSaleDrawer: React.FC<Props> = ({ open, onClose }) => {
  const { message } = App.useApp();
  const { t } = useLanguageData();
  const { user, employee } = useAuthData();
  const router = useRouter();

  const { stores } = useFindStoresByUser();
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  // Falls back to the first store until the user picks one.
  const storeId: string | null = selectedStoreId ?? stores[0]?._id ?? null;

  const [items, setItems] = useState<IFastSaleItem[]>([]);
  const [customer, setCustomer] = useState<ICustomer | null>(null);
  // "New customer" is the Select's initial option, so it starts active.
  const [isNewCustomer, setIsNewCustomer] = useState<boolean>(true);
  const [newCustomer, setNewCustomer] =
    useState<INewCustomer>(emptyNewCustomer);
  const [deliveryType, setDeliveryType] = useState<SalesEnum.DeliveryType>(
    SalesEnum.DeliveryType.PICKUP,
  );
  const [deliveryAddress, setDeliveryAddress] =
    useState<IDeliveryAddress>(emptyDeliveryAddress);
  const [customerAddressUid, setCustomerAddressUid] = useState<string | null>(
    null,
  );
  const [isDeliveryOpen, setIsDeliveryOpen] = useState<boolean>(false);
  const [details, setDetails] =
    useState<IFastSaleDetails>(emptyFastSaleDetails);
  const [isSendCustomerNotifications, setIsSendCustomerNotifications] =
    useState<boolean>(false);
  const [status, setStatus] = useState<SalesEnum.Status>(
    SalesEnum.Status.STARTED,
  );
  const [isSummaryOpen, setIsSummaryOpen] = useState<boolean>(false);
  const [discount, setDiscount] = useState<number>(0);
  const [paymentType, setPaymentType] = useState<SalesEnum.PaymentType>(
    SalesEnum.PaymentType.CASH,
  );
  const [isPaid, setIsPaid] = useState<boolean>(true);
  // Down payment informed when the sale is left pending.
  const [pendingAmount, setPendingAmount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createdSale, setCreatedSale] = useState<ISale | null>(null);
  // Bumped on reset so the uncontrolled customer Select remounts empty.
  const [formKey, setFormKey] = useState<number>(0);

  const isDelivery: boolean = deliveryType === SalesEnum.DeliveryType.DELIVERY;

  const customerAddresses: IAddress[] =
    !isNewCustomer && customer?.addresses?.length ? customer.addresses : [];

  // Typed address is used for new customers and for customers with none saved.
  const isTypingAddress: boolean = isDelivery && !customerAddresses.length;

  const selectedCustomerAddress: IAddress | undefined =
    customerAddresses.find((a) => a.uid === customerAddressUid) ??
    customerAddresses[0];

  const buildTypedAddress = (): CreateAddressDto => ({
    address1: deliveryAddress.address1.trim(),
    address2: deliveryAddress.address2.trim() || null,
    district: deliveryAddress.district.trim(),
    city: deliveryAddress.city.trim(),
    zip: deliveryAddress.zip.trim(),
    description: null,
    country: { code: countries[0].code, name: countries[0].name },
    state: {
      code: deliveryAddress.stateCode,
      name:
        states.find((state) => state.code === deliveryAddress.stateCode)
          ?.name ?? "",
    },
    types: [AddressEnum.Type.SHIPPING],
    uid: `${Date.now()}`,
  });

  const isCustomerValid: boolean = isNewCustomer
    ? !!newCustomer.name.trim() && !!newCustomer.email.trim()
    : !!customer;

  const isAddressValid: boolean =
    !isTypingAddress ||
    (!!deliveryAddress.address1.trim() &&
      !!deliveryAddress.city.trim() &&
      !!deliveryAddress.stateCode);

  const canSubmit: boolean =
    !!storeId && items.length > 0 && isCustomerValid && isAddressValid;

  const subtotal: number = sumBy(items, (i) => i.price * i.quantity);
  const discountApplied: number = Math.min(discount, subtotal);
  const total: number = subtotal - discountApplied;
  const paidAmount: number = isPaid ? total : Math.min(pendingAmount, total);

  const resetForm = () => {
    setItems([]);
    setSelectedStoreId(null);
    setCustomer(null);
    setIsNewCustomer(true);
    setNewCustomer(emptyNewCustomer);
    setDeliveryType(SalesEnum.DeliveryType.PICKUP);
    setIsDeliveryOpen(false);
    setDeliveryAddress(emptyDeliveryAddress);
    setCustomerAddressUid(null);
    setDetails(emptyFastSaleDetails);
    setIsSendCustomerNotifications(false);
    setStatus(SalesEnum.Status.STARTED);
    setIsSummaryOpen(false);
    setDiscount(0);
    setPaymentType(SalesEnum.PaymentType.CASH);
    setIsPaid(true);
    setPendingAmount(0);
    setCreatedSale(null);
    setFormKey((key) => key + 1);
  };

  const updateAddress = (patch: Partial<IDeliveryAddress>) =>
    setDeliveryAddress((prev) => ({ ...prev, ...patch }));

  const updateItem = (index: number, patch: Partial<IFastSaleItem>) =>
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );

  const buildCreateSaleDto = (
    selectedCustomer: ICustomer | null,
  ): CreateSaleDto => {
    const itemsByStore = groupBy(items, "storeId");
    const storesCount: number = Object.keys(itemsByStore).length;
    const discountByStore: number = discountApplied / storesCount;

    const address: CreateAddressDto | null = isDelivery
      ? isTypingAddress
        ? buildTypedAddress()
        : parseAddress(selectedCustomerAddress)
      : parseAddress(selectedCustomer?.addresses?.[0]);

    const paymentStatus: SalesEnum.PaymentStatus = isPaid
      ? SalesEnum.PaymentStatus.COMPLETED
      : paidAmount > 0
        ? SalesEnum.PaymentStatus.PARTIALLY
        : SalesEnum.PaymentStatus.PENDING;

    const stores: SaleStoreDto[] = map(
      itemsByStore,
      (storeItems: IFastSaleItem[], storeId: string): SaleStoreDto => {
        const storeSubtotal: number = sumBy(
          storeItems,
          (i) => i.price * i.quantity,
        );

        const products: SaleStoreProductDto[] = map(storeItems, (item) => {
          const lineTotal: number = item.price * item.quantity;
          const lineDiscount: number = storeSubtotal
            ? (lineTotal / storeSubtotal) * discountByStore
            : 0;

          return {
            productId: item.productId,
            productItemId: item.productItemId,
            price: item.price,
            quantity: item.quantity,
            barcode: item.barcode,
            sku: item.sku,
            note: null,
            isValid: true,
            isCompleted: false,
            discount: lineDiscount
              ? { distributedAmount: +lineDiscount.toFixed(2) }
              : null,
          };
        });

        return {
          storeId,
          customerId: selectedCustomer?._id ?? null,
          products,
          totals: {
            subtotalAmount: storeSubtotal,
            discount: discountByStore
              ? { distributedAmount: discountByStore }
              : null,
            shipping: { amount: 0, note: null },
            tax: { amount: 0, note: null },
            totalFinalAmount: Math.max(storeSubtotal - discountByStore, 0),
          },
        };
      },
    );

    return {
      createdByUserId: user?._id!,
      createdByEmployeeId: employee?._id!,
      isSendCustomerNotifications,
      isCreateQuote: false,
      type: SalesEnum.Type.MANUAL,
      status,
      paymentStatus,
      buyer: selectedCustomer
        ? {
            userId: selectedCustomer.userId ?? null,
            email: selectedCustomer.email ?? "",
            name: selectedCustomer.name ?? "",
            birthDate: selectedCustomer.birthDate
              ? new Date(selectedCustomer.birthDate)
              : null,
            gender:
              (selectedCustomer.gender as PersonEnum.Gender) ??
              PersonEnum.Gender.OTHER,
            phoneNumber: {
              uid: `${Date.now()}`,
              type: PhoneNumberEnum.Type.OTHER,
              messengers: [],
              number: selectedCustomer.phoneNumbers?.[0]?.number ?? "",
            },
            address,
            idNumber: selectedCustomer.idNumber || null,
            cpf: selectedCustomer.cpf || null,
            cnpj: selectedCustomer.cnpj || null,
          }
        : {
            userId: null,
            email: newCustomer.email.trim(),
            name: newCustomer.name.trim(),
            birthDate: null,
            gender: PersonEnum.Gender.OTHER,
            phoneNumber: {
              uid: `${Date.now()}`,
              type: PhoneNumberEnum.Type.OTHER,
              messengers: [],
              number: newCustomer.phone.trim(),
            },
            address: isDelivery ? address : null,
            idNumber: null,
            cpf: null,
            cnpj: null,
          },
      header: {
        billing: { address },
        shipping: { address, trackingNumber: null },
        deliveryType,
      },
      payments: [
        {
          type: paymentType,
          status: paymentStatus,
          amount: paidAmount,
          provider: null,
          note: null,
        },
      ],
      totals: {
        subtotalAmount: subtotal,
        discount: discountApplied
          ? { distributed: { amount: discountApplied, note: null } }
          : null,
        shipping: { amount: 0, note: null },
        tax: { amount: 0, note: null },
        totalFinalAmount: total,
      },
      stores,
      note: details.note.trim() || null,
      tagsIds: details.tagsIds,
      categoriesIds: details.categoriesIds,
      deliveryAt: details.deliveryAt
        ? moment(details.deliveryAt).toDate()
        : null,
      createdDate: details.createdDate
        ? moment(details.createdDate).toDate()
        : null,
      numberManual: details.numberManual.trim() || null,
      noteToCustomer: details.noteToCustomer.trim() || null,
    };
  };

  const handleSubmit = async () => {
    if (!items.length) {
      message.warning(t("sales.fastSaleNoItemsError"));
      return;
    }

    if (isNewCustomer) {
      if (!newCustomer.name.trim() || !newCustomer.email.trim()) {
        message.warning(t("sales.fastSaleNewCustomerRequired"));
        return;
      }
    } else if (!customer) {
      message.warning(t("sales.fastSaleCustomerRequired"));
      return;
    }

    if (
      isTypingAddress &&
      (!deliveryAddress.address1.trim() ||
        !deliveryAddress.city.trim() ||
        !deliveryAddress.stateCode)
    ) {
      setIsDeliveryOpen(true);
      message.warning(t("sales.fastSaleAddressRequired"));
      return;
    }

    try {
      setIsSubmitting(true);

      const created: ISale =
        await serviceMethodsInstance.salesServiceMethods.createManual(
          buildCreateSaleDto(isNewCustomer ? null : customer),
        );

      // Filled sale carries the customer/buyer data SendSaleSummary needs.
      const filled: ISale | null =
        await serviceMethodsInstance.salesServiceMethods.findFilledByIdOrFail(
          created._id,
        );

      setCreatedSale(filled ?? created);
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Closing keeps the form as-is (the Drawer stays mounted) so the user can
  // come back to it; only "New sale" resets it.
  const handleClose = () => {
    setIsSummaryOpen(false);
    onClose();
  };

  const renderSuccess = (sale: ISale) => (
    <div className="flex flex-col gap-4">
      <Alert
        type="success"
        icon={<CheckCircleOutlined />}
        showIcon
        message={
          <div>
            <div>{t("sales.saleCreatedSuccessfully")}</div>
            <div>
              {t("sales.saleNumberLabel")} <b>{sale.number}</b>
            </div>
          </div>
        }
      />

      <SendSaleSummary sale={sale} />

      <div className="flex flex-wrap justify-end gap-2">
        <Button
          type="primary"
          icon={<ShoppingCartOutlined />}
          onClick={resetForm}
        >
          {t("sales.newSale")}
        </Button>

        <Button
          icon={<EyeOutlined />}
          type="primary"
          onClick={() => setIsSummaryOpen(true)}
        >
          {t("sales.saleSummary")}
        </Button>

        <Button
          icon={<EnterOutlined />}
          type="primary"
          onClick={() => {
            router.push(Urls.SALE.replace(":saleId", sale._id));
            handleClose();
          }}
        >
          {t("sales.goToSale")}
        </Button>

        <Button onClick={handleClose}>{t("common.close")}</Button>
      </div>
    </div>
  );

  const renderForm = () => (
    <div className="flex flex-col gap-3">
      <Section
        title={t("stores.store")}
        extra={
          <Select
            value={storeId}
            onChange={setSelectedStoreId}
            placeholder={t("stores.store")}
            className="w-3/5"
            options={stores.map((store: IStore) => ({
              value: store._id,
              label: <TagStoreCustomAntd store={store} useTag={false} />,
            }))}
          />
        }
      />

      <Section
        title={t("sales.products")}
        extra={
          <div className="w-3/5">
            <FastSaleProductPicker
              storeId={storeId}
              onAddItem={(item) => setItems((prev) => [...prev, item])}
            />
          </div>
        }
      >
        {items.length ? (
          <div className="flex flex-col">
            {items.map((item, index) => (
              <div
                key={`${item.productItemId}-${index}`}
                className="flex items-center gap-2 py-1 border-b border-gray-100
                dark:border-gray-700"
              >
                <Image
                  width={32}
                  height={32}
                  className="rounded object-cover"
                  src={
                    item.fileUrl
                      ? getImageUrl(item.fileUrl)
                      : ImagesEnum.FilesNames.DefaultProductImage
                  }
                  alt={item.name}
                />

                <div className="flex-1 min-w-0 flex flex-col">
                  <span className="truncate text-sm">{item.name}</span>
                  <span className="truncate text-xs text-gray-400">
                    {t("products.barcode")}: {item.barcode || "-"}
                  </span>
                </div>

                <InputNumber
                  size="small"
                  min={1}
                  className="w-16"
                  value={item.quantity}
                  onChange={(v) => updateItem(index, { quantity: v ?? 1 })}
                />

                <InputNumber
                  size="small"
                  min={0}
                  className="w-24"
                  value={item.price}
                  formatter={formatterMoney}
                  parser={parserMoney}
                  onChange={(v) => updateItem(index, { price: v ?? 0 })}
                />

                <Button
                  size="small"
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() =>
                    setItems((prev) => prev.filter((_, i) => i !== index))
                  }
                />
              </div>
            ))}
          </div>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={t("sales.fastSaleNoItems")}
          />
        )}
      </Section>

      <Section
        title={t("sales.customer")}
        extra={
          <div className="w-3/5">
            <SelectCustomer
              key={formKey}
              onSelectCustomer={(selected) => {
                // The component emits null only for its "New customer" option.
                setCustomer(selected);
                setCustomerAddressUid(null);
                setIsNewCustomer(selected === null);
              }}
              style={{ width: "100%" }}
            />
          </div>
        }
      >
        {!isNewCustomer && customer && (
          <div className="flex items-center gap-3 rounded-md bg-gray-50 p-2 dark:bg-slate-800">
            <Avatar
              size={44}
              src={
                customer.avatar
                  ? getImageUrl(customer.avatar)
                  : ImagesEnum.FilesNames.DefaultAvatarImage
              }
            />

            <div className="flex min-w-0 flex-col text-xs">
              <span className="truncate text-sm font-semibold">
                {customer.name}
              </span>

              {customer.email && (
                <span className="truncate text-gray-500">{customer.email}</span>
              )}

              {customer.phoneNumbers?.[0]?.number && (
                <span className="text-gray-500">
                  {customer.phoneNumbers[0].number}
                </span>
              )}

              {(customer.cpf || customer.cnpj) && (
                <span className="text-gray-500">
                  {customer.cpf ? "CPF" : "CNPJ"}:{" "}
                  {customer.cpf || customer.cnpj}
                </span>
              )}

              {customer.addresses?.[0] && (
                <span className="truncate text-gray-500">
                  {customer.addresses[0].address1}, {customer.addresses[0].city}
                </span>
              )}
            </div>
          </div>
        )}

        {isNewCustomer && (
          <div className="grid grid-cols-3 gap-2">
            <Input
              placeholder={t("common.name")}
              value={newCustomer.name}
              onChange={(e) =>
                setNewCustomer((prev) => ({ ...prev, name: e.target.value }))
              }
            />
            <Input
              placeholder={t("common.email")}
              value={newCustomer.email}
              onChange={(e) =>
                setNewCustomer((prev) => ({ ...prev, email: e.target.value }))
              }
            />
            <Input
              placeholder={t("common.phone")}
              value={newCustomer.phone}
              onChange={(e) =>
                setNewCustomer((prev) => ({ ...prev, phone: e.target.value }))
              }
            />
          </div>
        )}

        <Collapse
          size="small"
          activeKey={isDeliveryOpen ? ["delivery"] : []}
          onChange={(keys) => setIsDeliveryOpen(keys.length > 0)}
          items={[
            {
              key: "delivery",
              label: t("sales.deliveryType"),
              extra: (
                <span className="text-xs text-gray-400">
                  {t(SalesEnum.DeliveryTypeLabels[deliveryType])}
                </span>
              ),
              children: (
                <div className="flex flex-col gap-3">
                  <Segmented
                    value={deliveryType}
                    onChange={setDeliveryType}
                    options={map(
                      SalesEnum.DeliveryTypeLabels,
                      (label, value) => ({
                        value: value as SalesEnum.DeliveryType,
                        label: t(label),
                      }),
                    )}
                  />

                  {isDelivery && !isTypingAddress && (
                    <Select
                      value={selectedCustomerAddress?.uid}
                      onChange={setCustomerAddressUid}
                      className="w-full"
                      options={customerAddresses.map((a: IAddress) => ({
                        value: a.uid,
                        label: `${a.address1}, ${a.city}`,
                      }))}
                    />
                  )}

                  {isTypingAddress && (
                    <div className="grid grid-cols-4 gap-2">
                      <Input
                        className="col-span-2"
                        placeholder={t("address.address1")}
                        value={deliveryAddress.address1}
                        onChange={(e) =>
                          updateAddress({ address1: e.target.value })
                        }
                      />
                      <Input
                        placeholder={t("address.address2")}
                        value={deliveryAddress.address2}
                        onChange={(e) =>
                          updateAddress({ address2: e.target.value })
                        }
                      />
                      <Input
                        placeholder={t("address.district")}
                        value={deliveryAddress.district}
                        onChange={(e) =>
                          updateAddress({ district: e.target.value })
                        }
                      />
                      <Input
                        placeholder={t("address.city")}
                        value={deliveryAddress.city}
                        onChange={(e) =>
                          updateAddress({ city: e.target.value })
                        }
                      />
                      <Select
                        className="col-span-2"
                        showSearch
                        optionFilterProp="label"
                        placeholder={t("address.state")}
                        value={deliveryAddress.stateCode || undefined}
                        onChange={(stateCode) => updateAddress({ stateCode })}
                        options={states.map((state) => ({
                          value: state.code,
                          label: state.name,
                        }))}
                      />
                      <Input
                        placeholder={t("address.zipcode")}
                        value={deliveryAddress.zip}
                        onChange={(e) => updateAddress({ zip: e.target.value })}
                      />
                    </div>
                  )}
                </div>
              ),
            },
          ]}
        />
      </Section>

      <Section title={t("sales.payment")}>
        <div className="flex items-center gap-2">
          <span className="w-24">{t("common.discount")}</span>
          <InputNumber
            min={0}
            className="flex-1"
            value={discount}
            formatter={formatterMoney}
            parser={parserMoney}
            onChange={(v) => setDiscount(v ?? 0)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Segmented
            value={isPaid}
            onChange={setIsPaid}
            options={[
              { label: t("sales.paymentCompleted"), value: true },
              { label: t("sales.paymentPending"), value: false },
            ]}
          />

          <Select
            className="flex-1"
            value={paymentType}
            onChange={setPaymentType}
            options={map(SalesEnum.PaymentTypeLabels, (label, value) => ({
              value: value as SalesEnum.PaymentType,
              label: (
                <Tag
                  color={
                    SalesEnum.PaymentTypeColors[value as SalesEnum.PaymentType]
                  }
                >
                  {t(label)}
                </Tag>
              ),
            }))}
          />

          {!isPaid && (
            <InputNumber
              min={0}
              max={total}
              className="w-40"
              placeholder={t("sales.amount")}
              value={pendingAmount}
              formatter={formatterMoney}
              parser={parserMoney}
              onChange={(v) => setPendingAmount(v ?? 0)}
            />
          )}
        </div>
      </Section>

      <FastSaleDetails value={details} onChange={setDetails} />

      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-2">
          <span>{t("sales.saleStatus")}</span>
          <Select
            className="flex-1"
            value={status}
            onChange={setStatus}
            options={Object.keys(SalesEnum.Status).map((key: string) => ({
              value: key as SalesEnum.Status,
              label: (
                <LabelBadgeCustomAntd
                  label={t(SalesEnum.StatusLabels[key as SalesEnum.Status])}
                  color={SalesEnum.StatusColors[key as SalesEnum.Status]}
                />
              ),
            }))}
          />
        </div>

        <Checkbox
          checked={isSendCustomerNotifications}
          onChange={(e) => setIsSendCustomerNotifications(e.target.checked)}
        >
          {t("sales.sendCustomerNotifications")}
        </Checkbox>
      </div>
    </div>
  );

  const renderFooter = () => (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between text-sm">
        <span>{t("common.subtotal")}</span>
        <span>{formatToMoneyDecimal(subtotal)}</span>
      </div>

      <div className="flex justify-between text-lg font-semibold">
        <span>{t("common.total")}</span>
        <span>{formatToMoneyDecimal(total)}</span>
      </div>

      <Button
        type="primary"
        size="large"
        icon={<CheckCircleOutlined />}
        loading={isSubmitting}
        disabled={isSubmitting || !canSubmit}
        className="font-bold shadow-lg !bg-green-600 hover:!bg-green-700
          disabled:!bg-gray-200 disabled:!text-gray-400 disabled:!shadow-none"
        onClick={handleSubmit}
      >
        {t("sales.createSaleBtn")}
      </Button>
    </div>
  );

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      title={t("sales.fastSale")}
      extra={
        <Button
          size="middle"
          icon={<UnorderedListOutlined />}
          onClick={() => {
            router.push(Urls.SALES);
            handleClose();
          }}
          type="primary"
        >
          {t("sales.goToSales")}
        </Button>
      }
      placement="right"
      width="min(760px, 100vw)"
      maskClosable={!isSubmitting}
      footer={createdSale ? null : renderFooter()}
    >
      {createdSale ? renderSuccess(createdSale) : renderForm()}

      {createdSale && isSummaryOpen && (
        <FastSaleSummaryModal
          sale={createdSale}
          stores={stores}
          onClose={() => setIsSummaryOpen(false)}
        />
      )}
    </Drawer>
  );
};
