"use client";

import { useEffect, useState } from "react";

import { Card, Col, Image, Row, Select, Tooltip } from "antd";
import { find, includes } from "lodash";
import moment from "moment";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
import { SelectCustomAntd } from "../../../components/custom/antd/SelectCustomAntd/SelectCustomAntd";
import Layout from "../../../components/template/Layout/Layout";
import { ICustomer } from "../../../shared/business/customers/customer.interface";
import AddressEnum from "../../../shared/business/enums/address.enum";
import { IAddress } from "../../../shared/business/interfaces/address.interface";
import SalesEnum from "../../../shared/business/sales/sales.enum";
import UsersEnum from "../../../shared/business/users/users.enum";
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

const formSchema = z.object({
  customer: customerFormSchema,
  deliveryType: z.string(),
});

type TFormSchema = z.infer<typeof formSchema>;

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
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
  } = useForm<TFormSchema>({
    values: formValues,
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
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

    setFormValues({
      ...formValues,
      customer: {
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
      },
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

    setFormValues({
      ...formValues,
      customer: {
        ...formValues!.customer,
        address,
      },
    });

    setSelectedAddressUid(addressUid);
  };

  return (
    <Layout subtitle="Create manual sale" title="Create Sale" hasBackButton>
      <Row gutter={[16, 16]}>
        {/* Customer Info */}
        <Col xs={24} md={12}>
          <Card
            title={
              <div className="flex">
                <label className="mr-2">Customer: </label>
                <SelectCustomer onSelectCustomer={handleSelectCustomer} />
              </div>
            }
            className="h-min-80 mt-5"
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
                          {address.address1}
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
            className="h-min-80 mt-5"
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

                <SelectCustomAntd<IAddress>
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

                <SelectCustomAntd<IAddress>
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
    </Layout>
  );
}
