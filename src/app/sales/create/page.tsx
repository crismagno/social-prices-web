"use client";

import { useState } from "react";

import { Card, Col, Divider, Image, Row, Select, Tooltip } from "antd";
import moment from "moment";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";

import { addressFormSchema } from "../../../components/common/Addresses/Addresses";
import LoadingFull from "../../../components/common/LoadingFull/LoadingFull";
import { phoneNumberFormSchema } from "../../../components/common/PhoneNumbers/PhoneNumbers";
import { InputCustomAntd } from "../../../components/custom/antd/InputCustomAntd/InputCustomAntd";
import { SelectCustomAntd } from "../../../components/custom/antd/SelectCustomAntd/SelectCustomAntd";
import Layout from "../../../components/template/Layout/Layout";
import { ICustomer } from "../../../shared/business/customers/customer.interface";
import { IAddress } from "../../../shared/business/interfaces/address.interface";
import UsersEnum from "../../../shared/business/users/users.enum";
import DatesEnum from "../../../shared/utils/dates/dates.enum";
import { defaultAvatarImage } from "../../../shared/utils/images/files-names";
import { getImageUrl } from "../../../shared/utils/images/url-images";
import { useFindStoresByUser } from "../../stores/useFindStoresByUser";
import { SelectCustomer } from "./components/SelectCustomer/SelectCustomer";

const customerFormSchema = z.object({
  customerId: z.string().nullable(),
  name: z.string(),
  email: z.string(),
  addresses: z.array(addressFormSchema),
  phoneNumbers: z.array(phoneNumberFormSchema),
  about: z.string().nullable(),
  birthDate: z.string().nullable(),
  gender: z.string().nullable(),
});

type TCustomerFormSchema = z.infer<typeof formSchema>;

const formSchema = z.object({
  customer: customerFormSchema,
  shippingAddress: z
    .object({
      address1: z.string().nonempty("Address1 is required"),
      address2: z.string().nullable(),
      city: z.string().nonempty("City is required"),
      isValid: z.boolean(),
      stateCode: z.string().nonempty("State is required"),
      uid: z.string(),
      zip: z.string().nonempty("Zipcode is required"),
      description: z.string().nullable(),
      countryCode: z.string().nonempty("Country is required"),
      district: z.string().nonempty("District is required"),
      isCollapsed: z.boolean(),
      types: z.array(z.string()),
    })
    .nullable(),
});

type TFormSchema = z.infer<typeof formSchema>;

export default function CreateSalePage() {
  const [formValues, setFormValues] = useState<TFormSchema>();

  const { stores, isLoading: isLoadingStores } = useFindStoresByUser();

  const [selectedCustomer, setSelectedCustomer] = useState<ICustomer | null>(
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

  if (isLoadingStores) {
    return <LoadingFull />;
  }

  const handleSelectCustomer = (customer: ICustomer | null) => {
    setFormValues({
      ...formValues,
      customer: {
        customerId: customer?._id ?? null,
        about: null,
        addresses: customer?.addresses ?? [],
        birthDate: customer?.birthDate
          ? moment(customer?.birthDate)
              .utc()
              .format(DatesEnum.Format.YYYYMMDD_DASHED)
          : null,
        email: customer?.email ?? "",
        gender: customer?.gender ?? UsersEnum.Gender.MALE,
        name: customer?.name ?? "",
        phoneNumbers: customer?.phoneNumbers ?? [],
      },
    });

    setSelectedCustomer(customer);
  };

  const renderShippingAddress = () => {
    let selectShippingAddress = null;
    if (formValues?.customer?.customerId) {
      selectShippingAddress = (
        <div className={`flex flex-col mt-4 mr-5`}>
          <label className={`text-sm`}>Select Address</label>

          <Select style={{ width: 300 }}>
            {formValues?.customer?.addresses.map((address: IAddress) => (
              <Select.Option key={address.uid} value={address.uid}>
                {address.address1}
              </Select.Option>
            ))}
          </Select>
        </div>
      );
    }

    return (
      <Row>
        <Divider type="vertical" />
        <Col xs={24} md={9}>
          {selectShippingAddress}
          <InputCustomAntd<ICustomer>
            controller={{ control, name: "customer.name" }}
            label="Name"
            divClassName="mt-0"
            placeholder={"Enter customer name"}
            errorMessage={errors?.customer?.name?.message}
            maxLength={200}
          />
        </Col>
      </Row>
    );
  };

  return (
    <Layout subtitle="Create manual sale" title="Create Sale">
      <Card
        title={
          <div className="flex">
            <label className="mr-2">Customer: </label>

            <SelectCustomer
              control={control}
              errors={errors}
              onSelectCustomer={handleSelectCustomer}
            />
          </div>
        }
        className="h-min-80 mt-5"
      >
        <Row>
          <Col xs={24} md={2}>
            <Tooltip title="See avatar">
              <Image
                width={70}
                height={70}
                src={
                  selectedCustomer?.avatar
                    ? getImageUrl(selectedCustomer.avatar)
                    : defaultAvatarImage
                }
                onError={() => (
                  <Image
                    width={70}
                    height={70}
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
            <Row>
              <Col xs={24} md={9}>
                <InputCustomAntd<ICustomer>
                  controller={{ control, name: "customer.name" }}
                  label="Name"
                  divClassName="mt-0"
                  placeholder={"Enter customer name"}
                  errorMessage={errors?.customer?.name?.message}
                  maxLength={200}
                />

                <InputCustomAntd<ICustomer>
                  controller={{ control, name: "customer.email" }}
                  label="Email"
                  type="email"
                  divClassName="mt-1"
                  placeholder={"Enter customer email"}
                  errorMessage={errors?.customer?.email?.message}
                  maxLength={200}
                />
              </Col>

              <Col xs={24} md={9}>
                <InputCustomAntd<ICustomer>
                  controller={{ control, name: "customer.birthDate" }}
                  label="Birth Date"
                  divClassName="mt-0 ml-3"
                  type="date"
                  placeholder={"Enter customer birthDate"}
                  errorMessage={errors?.customer?.birthDate?.message}
                  maxLength={200}
                />

                <SelectCustomAntd<ICustomer>
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
          </Col>

          <Col xs={24} md={12}>
            {renderShippingAddress()}
          </Col>
        </Row>
      </Card>
    </Layout>
  );
}
