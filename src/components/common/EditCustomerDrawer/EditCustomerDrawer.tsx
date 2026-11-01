"use client";

import { useEffect, useState } from "react";

import {
  App,
  Button,
  Col,
  Divider,
  Drawer,
  Row,
  Select,
  Tooltip,
  UploadFile,
} from "antd";
import { RcFile } from "antd/es/upload";
import { isArray } from "class-validator";
import moment from "moment";
import { useForm } from "react-hook-form";
import z from "zod";

import { zodResolver } from "@hookform/resolvers/zod";

import { useFindCustomerById } from "../../../app/customers/detail/useFindCustomerById";
import { useFindTagsByType } from "../../../app/tags/useFindTagsByType";
import useLanguageData from "../../../data/context/language/useLanguageData";
import UpdateCustomerDto from "../../../services/social-prices-api/customers/dto/updateCustomer.dto";
import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import { ICustomer } from "../../../shared/business/customers/customer.interface";
import AddressEnum from "../../../shared/business/shared/address/address.enum";
import { IAddress } from "../../../shared/business/shared/address/address.interface";
import PersonEnum from "../../../shared/business/shared/person/person.enum";
import { IPhoneNumber } from "../../../shared/business/shared/phone/phone-number.interface";
import TagsEnum from "../../../shared/business/tags/tags.enum";
import { ITag } from "../../../shared/business/tags/tags.interface";
import { getFileUrl } from "../../../shared/utils/images/images-helper";
import { getImageUrl } from "../../../shared/utils/images/images-url";
import { sortArray } from "../../../shared/utils/array/array-functions";
import DatesEnum from "../../../shared/utils/dates/dates.enum";
import { InputCustomAntd } from "../../custom/antd/InputCustomAntd/InputCustomAntd";
import { SelectCustomAntd } from "../../custom/antd/SelectCustomAntd/SelectCustomAntd";
import { TextareaCustomAntd } from "../../custom/antd/TextareaCustomAntd/TextareaCustomAntd";
import Avatar from "../Avatar/Avatar";
import ImageModal from "../ImageModal/ImageModal";
import handleClientError from "../HandleClientError/HandleClientError";
import {
  Addresses,
  addressFormSchema,
  countries,
  states,
} from "../Addresses/Addresses";
import {
  generateNewPhoneNumber,
  phoneNumberFormSchema,
  PhoneNumbers,
} from "../PhoneNumbers/PhoneNumbers";
import { TagTagCustomAntd } from "../TagTagCustomAntd/TagTagCustomAntd";

// What a customer made from a chat has is a name; the rest gets filled in as the
// conversation goes, so e-mail and the other fields may stay empty.
const formSchema = z.object({
  name: z.string().trim().nonempty("Name is required"),
  email: z
    .string()
    .trim()
    .refine((value) => !value || z.string().email().safeParse(value).success, {
      message: "Invalid e-mail",
    }),
  // A blank line left in the list is dropped, not an error; a half-filled one is.
  phoneNumbers: z.preprocess(
    (lines) =>
      (lines as { number?: string }[]).filter((line) => line.number?.trim()),
    z.array(phoneNumberFormSchema),
  ),
  addresses: z.preprocess(
    (lines) =>
      (lines as Record<string, any>[]).filter((line) =>
        [line.address1, line.city, line.zip, line.district].some((value) =>
          String(value ?? "").trim(),
        ),
      ),
    z.array(addressFormSchema),
  ),
  uniqName: z
    .string()
    .transform((value) => value.replace(/\s+/g, ""))
    .nullable(),
  about: z.string().trim().nullable(),
  idNumber: z.string().trim(),
  cpf: z.string().trim(),
  cnpj: z.string().trim(),
  birthDate: z.string(),
  gender: z.string().nullable(),
  tagsIds: z.array(z.string()),
});

type TFormSchema =
  z.input<typeof formSchema> extends infer I
    ? Omit<z.output<typeof formSchema>, "phoneNumbers" | "addresses"> & {
        phoneNumbers: z.infer<typeof phoneNumberFormSchema>[];
        addresses: z.infer<typeof addressFormSchema>[];
      }
    : never;

interface Props {
  customerId: string;
  onClose: () => void;
  // The customer as saved, so the screen behind can show the new data.
  onSaved?: (customer: ICustomer) => void;
}

const valuesOf = (customer: ICustomer): TFormSchema => ({
  name: customer.name ?? "",
  email: customer.email ?? "",
  about: customer.about ?? null,
  idNumber: customer.idNumber ?? "",
  cpf: customer.cpf ?? "",
  cnpj: customer.cnpj ?? "",
  birthDate: customer.birthDate
    ? moment(customer.birthDate).utc().format(DatesEnum.Format.YYYYMMDD_DASHED)
    : "",
  gender: customer.gender ?? PersonEnum.Gender.OTHER,
  tagsIds: customer.tagsIds?.map(String) ?? [],
  uniqName: customer.uniqName ?? null,
  phoneNumbers: customer.phoneNumbers?.length
    ? customer.phoneNumbers.map((phoneNumber: IPhoneNumber, index: number) => ({
        ...phoneNumber,
        isCollapsed: index === 0,
      }))
    : [generateNewPhoneNumber(false)],
  addresses: (customer.addresses ?? []).map(
    (address: IAddress, index: number) => ({
      ...address,
      countryCode: address.country?.code,
      stateCode: address.state?.code ?? "",
      isCollapsed: index === 0,
    }),
  ) as TFormSchema["addresses"],
});

// Edits the customer without leaving the page: the name, contact, documents,
// unique name, birth date, gender, tags, photo, addresses and phones.
export default function EditCustomerDrawer({
  customerId,
  onClose,
  onSaved,
}: Props) {
  const { t } = useLanguageData();

  const { message } = App.useApp();

  const { customer } = useFindCustomerById(customerId);

  const { tags } = useFindTagsByType(TagsEnum.Type.CUSTOMER);

  const [isSaving, setIsSaving] = useState<boolean>(false);

  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState<boolean>(false);

  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const {
    handleSubmit,
    formState: { errors },
    control,
    watch,
    reset,
  } = useForm<TFormSchema>({ resolver: zodResolver(formSchema) });

  useEffect(() => {
    if (customer) {
      reset(valuesOf(customer));

      setAvatarUrl(customer.avatar ? getImageUrl(customer.avatar) : null);
    }
  }, [customer, reset]);

  const onAvatarPicked = async (
    _: unknown,
    picked: UploadFile<any>[],
  ): Promise<void> => {
    setIsAvatarModalOpen(false);
    setFileList(picked);

    setAvatarUrl(
      picked.length
        ? await getFileUrl(picked[0])
        : customer?.avatar
          ? getImageUrl(customer.avatar)
          : null,
    );
  };

  const save = async (data: TFormSchema): Promise<void> => {
    if (!customer) {
      return;
    }

    try {
      setIsSaving(true);

      // The API replaces the whole customer, so what is not edited here goes back as it was.
      const dto: Partial<UpdateCustomerDto> & Record<string, any> = {
        customerId: customer._id,
        name: data.name,
        email: data.email,
        about: data.about ?? "",
        idNumber: data.idNumber,
        cpf: data.cpf,
        cnpj: data.cnpj,
        gender: data.gender as PersonEnum.Gender | null,
        phoneNumbers: data.phoneNumbers,
        tagsIds: data.tagsIds,
        addresses: data.addresses.map((address): IAddress => ({
          ...address,
          country: {
            code: address.countryCode,
            name:
              countries.find((country) => country.code === address.countryCode)
                ?.name ?? "",
          },
          state: {
            code: address.stateCode ?? "",
            name:
              states.find((state) => state.code === address.stateCode)?.name ??
              "",
          },
          types: address.types as AddressEnum.Type[],
        })),
        uniqName: data.uniqName || customer.uniqName,
        ...(data.birthDate
          ? { birthDate: moment(data.birthDate).toDate() }
          : {}),
      };

      const formData = new FormData();

      if (fileList.length) {
        formData.append("avatar", fileList[0].originFileObj as RcFile);
      }

      for (const property of Object.keys(dto)) {
        let value: any = dto[property];

        if (value === null || value === undefined) {
          continue;
        }

        if (isArray(value)) {
          value = JSON.stringify(value);
        }

        formData.append(property, value);
      }

      const saved: ICustomer =
        await serviceMethodsInstance.customersServiceMethods.update(formData);

      message.success(t("customers.customerUpdatedSuccessfully"));

      onSaved?.(saved);

      onClose();
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Drawer
      open
      onClose={onClose}
      width={720}
      title={t("customers.editCustomer")}
      loading={!customer}
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={onClose} disabled={isSaving}>
            {t("common.cancel")}
          </Button>

          <Button
            type="primary"
            loading={isSaving}
            onClick={handleSubmit(save)}
          >
            {t("common.save")}
          </Button>
        </div>
      }
    >
      <div className="flex w-full justify-center">
        <Tooltip title={t("profile.editAvatar")} placement="bottom">
          <div className="cursor-pointer">
            <Avatar
              src={avatarUrl}
              width={120}
              className="shadow-lg border-none"
              onClick={() => setIsAvatarModalOpen(true)}
              noUseAwsS3
            />
          </div>
        </Tooltip>

        <ImageModal
          isVisible={isAvatarModalOpen}
          onCancel={() => setIsAvatarModalOpen(false)}
          onOk={onAvatarPicked}
          url={avatarUrl}
        />
      </div>

      <Row>
        <Col xs={24} md={12}>
          <InputCustomAntd
            controller={{ control, name: "name" }}
            label={t("common.name")}
            placeholder={t("placeholders.enterName")}
            errorMessage={errors.name?.message}
            maxLength={200}
          />
        </Col>

        <Col xs={24} md={12}>
          <InputCustomAntd
            controller={{ control, name: "uniqName" }}
            label={t("customers.uniqName")}
            placeholder={t("customers.enterUniqName")}
            errorMessage={errors.uniqName?.message}
            maxLength={200}
          />
        </Col>

        <Col xs={24} md={12}>
          <InputCustomAntd
            controller={{ control, name: "email" }}
            label={t("common.email")}
            placeholder={t("placeholders.enterEmail")}
            errorMessage={errors.email?.message}
            maxLength={200}
            type="email"
          />
        </Col>

        <Col xs={24} md={12}>
          <InputCustomAntd
            controller={{ control, name: "birthDate" }}
            label={t("customers.birthDate")}
            type="date"
            placeholder={t("placeholders.enterBirthDate")}
            errorMessage={errors.birthDate?.message}
          />
        </Col>

        <Col xs={24} md={12}>
          <SelectCustomAntd<ICustomer>
            controller={{ control, name: "gender" }}
            label={t("customers.gender")}
            errorMessage={errors.gender?.message}
          >
            {Object.keys(PersonEnum.Gender).map((gender: string) => (
              <Select.Option key={gender} value={gender}>
                {t(PersonEnum.GenderLabels[gender as PersonEnum.Gender])}
              </Select.Option>
            ))}
          </SelectCustomAntd>
        </Col>

        <Col xs={24}>
          <SelectCustomAntd<ICustomer>
            controller={{ control, name: "tagsIds" }}
            label={t("tags.title")}
            errorMessage={errors.tagsIds?.message}
            placeholder={t("tags.selectTags")}
            mode="multiple"
          >
            {sortArray(tags, "name").map((tag: ITag) => (
              <Select.Option key={tag._id} value={tag._id}>
                <TagTagCustomAntd tag={tag} useTag={false} />
              </Select.Option>
            ))}
          </SelectCustomAntd>
        </Col>

        <Col xs={24} md={8}>
          <InputCustomAntd
            controller={{ control, name: "idNumber" }}
            label={t("common.idNumber")}
            errorMessage={errors.idNumber?.message}
            maxLength={50}
          />
        </Col>

        <Col xs={24} md={8}>
          <InputCustomAntd
            controller={{ control, name: "cpf" }}
            label={t("common.cpf")}
            errorMessage={errors.cpf?.message}
            maxLength={20}
          />
        </Col>

        <Col xs={24} md={8}>
          <InputCustomAntd
            controller={{ control, name: "cnpj" }}
            label={t("common.cnpj")}
            errorMessage={errors.cnpj?.message}
            maxLength={20}
          />
        </Col>

        <Col xs={24}>
          <TextareaCustomAntd
            label={t("customers.about")}
            controller={{ control, name: "about" }}
            placeholder={t("placeholders.enterAbout")}
            rows={2}
          />
        </Col>
      </Row>

      <Addresses control={control} errors={errors} watch={watch} />

      <PhoneNumbers control={control} errors={errors} watch={watch} />
    </Drawer>
  );
}
