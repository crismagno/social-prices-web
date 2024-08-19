"use client";

import { useEffect, useState } from "react";

import {
  Button,
  Card,
  Col,
  message,
  Row,
  Select,
  Tag,
  Tooltip,
  UploadFile,
} from "antd";
import { RcFile } from "antd/es/upload";
import { isArray } from "class-validator";
import moment from "moment";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context";
import {
  ReadonlyURLSearchParams,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import z from "zod";

import { zodResolver } from "@hookform/resolvers/zod";

import {
  Addresses,
  addressFormSchema,
  countries,
  generateNewAddress,
  states,
} from "../../../components/common/Addresses/Addresses";
import Avatar from "../../../components/common/Avatar/Avatar";
import handleClientError from "../../../components/common/handleClientError/handleClientError";
import HrCustom from "../../../components/common/HrCustom/HrCustom";
import ImageModal from "../../../components/common/ImageModal/ImageModal";
import LoadingFull from "../../../components/common/LoadingFull/LoadingFull";
import {
  generateNewPhoneNumber,
  phoneNumberFormSchema,
  PhoneNumbers,
} from "../../../components/common/PhoneNumbers/PhoneNumbers";
import { TagTagCustomAntd } from "../../../components/common/TagTagCustomAntd/TagTagCustomAntd";
import { InputCustomAntd } from "../../../components/custom/antd/InputCustomAntd/InputCustomAntd";
import { SelectCustomAntd } from "../../../components/custom/antd/SelectCustomAntd/SelectCustomAntd";
import { TextareaCustomAntd } from "../../../components/custom/antd/TextareaCustomAntd/TextareaCustomAntd";
import Layout from "../../../components/template/Layout/Layout";
import CreateEmployeeDto from "../../../services/social-prices-api/employees/dto/createEmployee.dto";
import UpdateEmployeeDto from "../../../services/social-prices-api/employees/dto/updateEmployee.dto";
import { serviceMethodsInstance } from "../../../services/social-prices-api/ServiceMethods";
import { IEmployee } from "../../../shared/business/employees/employee.interface";
import EmployeesEnum from "../../../shared/business/employees/employees.enum";
import AddressEnum from "../../../shared/business/enums/address.enum";
import PersonEnum from "../../../shared/business/enums/person.enum";
import { IAddress } from "../../../shared/business/interfaces/address.interface";
import { IPhoneNumber } from "../../../shared/business/interfaces/phone-number";
import TagsEnum from "../../../shared/business/tags/tags.enum";
import { ITag } from "../../../shared/business/tags/tags.interface";
import { sortArray } from "../../../shared/utils/array/functions";
import DatesEnum from "../../../shared/utils/dates/dates.enum";
import { getFileUrl } from "../../../shared/utils/images/helper";
import { getImageUrl } from "../../../shared/utils/images/url-images";
import { useFindTagsByType } from "../../tags/useFindTagsByType";
import { useFindEmployeeById } from "./useFindEmployeeById";

const formSchema = z.object({
  name: z.string().trim().nonempty("Name is required"),
  email: z.string().trim().email().nonempty("Email is required"),
  password: z.string().nullable(),
  birthDate: z.string().nullable(),
  gender: z.string().nullable(),
  addresses: z.array(addressFormSchema),
  phoneNumbers: z.array(phoneNumberFormSchema),
  tagsIds: z.array(z.string()),
  about: z.string().trim().nullable(),
  level: z.string().trim().nonempty("Level is required"),
});

type TFormSchema = z.infer<typeof formSchema>;

export default function EmployeeDetailPage() {
  const router: AppRouterInstance = useRouter();

  const searchParams: ReadonlyURLSearchParams = useSearchParams();

  const employeeId: string | null = searchParams.get("empid");

  const { employee, isLoading } = useFindEmployeeById(employeeId);

  const { tags, isLoading: isLoadingTags } = useFindTagsByType(
    TagsEnum.Type.EMPLOYEE
  );

  const [formValues, setFormValues] = useState<TFormSchema>();

  const isEditMode: boolean = !!employeeId && !!employee;

  const {
    handleSubmit,
    formState: { errors },
    control,
    watch,
  } = useForm<TFormSchema>({
    values: formValues,
    resolver: zodResolver(formSchema),
  });

  const [isVisibleEditAvatarModal, setIsVisibleAvatarModal] =
    useState<boolean>(false);

  const [isSubmitting, setIsSUbmitting] = useState<boolean>(false);

  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const [avatarUrl, setAvatarUrl] = useState<string | null>();

  useEffect(() => {
    if (employee?.avatar) {
      const url: string = getImageUrl(employee.avatar);
      setAvatarUrl(url);
    }

    const values: TFormSchema = {
      about: employee?.about ?? null,
      name: employee?.name ?? "",
      email: employee?.email ?? "",
      password: "",
      birthDate: moment(employee?.birthDate)
        .utc()
        .format(DatesEnum.Format.YYYYMMDD_DASHED),
      addresses: employee?.addresses.length
        ? employee.addresses.map((address: IAddress, index: number) => ({
            ...address,
            countryCode: address.country?.code,
            stateCode: address.state?.code ?? "",
            isCollapsed: index === 0,
          }))
        : [generateNewAddress(false)],
      phoneNumbers: employee?.phoneNumbers.length
        ? employee?.phoneNumbers.map(
            (phoneNumber: IPhoneNumber, index: number) => ({
              ...phoneNumber,
              isCollapsed: index === 0,
            })
          )
        : [generateNewPhoneNumber(false)],
      gender: employee?.gender ?? PersonEnum.Gender.OTHER,
      tagsIds: employee?.tagsIds ?? [],
      level: employee?.level ?? EmployeesEnum.Level.EMPLOYEE,
    };

    setFormValues(values);
  }, [employee]);

  if ((employeeId && isLoading) || isLoadingTags) {
    return <LoadingFull />;
  }

  const onSubmit: SubmitHandler<TFormSchema> = async (data: TFormSchema) => {
    if (isEditMode) {
      await handleUpdate(data);
    } else {
      await handleCreate(data);
    }
  };

  const handleCreate = async (data: TFormSchema) => {
    try {
      setIsSUbmitting(true);

      if (!data.password?.trim()) {
        message.warning("Password is required!");
        return;
      }

      const formData = new FormData();

      if (fileList.length) {
        formData.append("avatar", fileList[0].originFileObj as RcFile);
      }

      const addresses: IAddress[] = data.addresses.map(
        (address): IAddress => ({
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
        })
      );

      const createEmployeeDto: CreateEmployeeDto = {
        about: data.about ?? "",
        addresses,
        birthDate: moment(data.birthDate).toDate(),
        email: data.email,
        name: data.name,
        gender: data.gender as PersonEnum.Gender,
        phoneNumbers: data.phoneNumbers,
        tagsIds: data.tagsIds,
        level: data.level as EmployeesEnum.Level,
        password: data.password,
      };

      for (const property of Object.keys(createEmployeeDto)) {
        let value: any = createEmployeeDto[property];

        if (isArray(value)) {
          value = JSON.stringify(value);
        }

        formData.append([`${property}`], value);
      }

      await serviceMethodsInstance.employeesServiceMethods.create(formData);

      message.success("Your employee has been created successfully!");

      router.back();
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsSUbmitting(false);
    }
  };

  const handleUpdate = async (data: TFormSchema) => {
    try {
      if (!employee) {
        message.warning("Employee not found to update!");
        return;
      }

      setIsSUbmitting(true);

      const formData = new FormData();

      if (fileList.length) {
        formData.append("avatar", fileList[0].originFileObj as RcFile);
      }

      const addresses: IAddress[] = data.addresses.map(
        (address): IAddress => ({
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
        })
      );

      const updateEmployeeDto: UpdateEmployeeDto = {
        about: data.about ?? "",
        addresses,
        birthDate: moment(data.birthDate).toDate(),
        email: data.email,
        name: data.name,
        gender: data.gender as PersonEnum.Gender,
        phoneNumbers: data.phoneNumbers,
        tagsIds: data.tagsIds,
        employeeId: employee._id,
        level: data.level as EmployeesEnum.Level,
        password: data.password,
      };

      for (const property of Object.keys(updateEmployeeDto)) {
        let value: any = updateEmployeeDto[property];

        if (isArray(value)) {
          value = JSON.stringify(value);
        }

        formData.append([`${property}`], value);
      }

      await serviceMethodsInstance.employeesServiceMethods.update(formData);

      message.success("Your employee has been updated successfully!");

      router.back();
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsSUbmitting(false);
    }
  };

  const onImageModalOk = async (_: any, fileList: UploadFile<any>[]) => {
    setIsVisibleAvatarModal(false);
    setFileList(fileList);

    let url: string | null = employee?.avatar
      ? getImageUrl(employee.avatar)
      : null;

    if (fileList.length) {
      url = await getFileUrl(fileList?.[0]);
    }

    setAvatarUrl(url);
  };

  return (
    <Layout
      subtitle={isEditMode ? "Edit employee details" : "New employee details"}
      title={isEditMode ? `Edit employee: ${employee?.name}` : "New employee"}
      hasBackButton
    >
      <Card className="h-min-80 mt-2">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex justify-center w-full">
            <div className="cursor-pointer z-10">
              <Tooltip title="Edit avatar" placement="bottom">
                <Avatar
                  src={avatarUrl}
                  width={180}
                  className="shadow-lg border-none"
                  onClick={() => setIsVisibleAvatarModal(true)}
                  noUseAwsS3
                />

                <ImageModal
                  isVisible={isVisibleEditAvatarModal}
                  onCancel={() => setIsVisibleAvatarModal(false)}
                  onOk={onImageModalOk}
                  url={avatarUrl}
                />
              </Tooltip>
            </div>
          </div>

          <Row className="mt-10">
            <Col xs={24} md={8}>
              <InputCustomAntd
                controller={{ control, name: "name" }}
                label="Name"
                placeholder={"Enter name"}
                errorMessage={errors.name?.message}
                maxLength={200}
              />
            </Col>

            <Col xs={24} md={8}>
              <InputCustomAntd
                controller={{ control, name: "password" }}
                label="Password"
                placeholder={"Enter password"}
                type="password"
                errorMessage={errors.password?.message}
                maxLength={200}
              />
            </Col>

            <Col xs={24} md={8}>
              <InputCustomAntd
                controller={{ control, name: "email" }}
                label="Email"
                placeholder={"Enter email"}
                errorMessage={errors.email?.message}
                maxLength={200}
                type="email"
              />
            </Col>

            <Col xs={24} md={8}>
              <InputCustomAntd
                controller={{ control, name: "birthDate" }}
                label="Birth Date"
                type="date"
                placeholder={"Enter birth date"}
                errorMessage={errors.birthDate?.message}
              />
            </Col>

            <Col xs={24} md={8}>
              <SelectCustomAntd<IEmployee>
                controller={{ control, name: "gender" }}
                label="Gender"
                errorMessage={errors.gender?.message}
              >
                {Object.keys(PersonEnum.Gender).map((gender: string) => (
                  <Select.Option key={gender} value={gender}>
                    {PersonEnum.GenderLabels[gender as PersonEnum.Gender]}
                  </Select.Option>
                ))}
              </SelectCustomAntd>
            </Col>

            <Col xs={24} md={8}>
              <SelectCustomAntd<IEmployee>
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

            <Col xs={24} md={8}>
              <SelectCustomAntd<IEmployee>
                controller={{ control, name: "level" }}
                label="Level"
                errorMessage={errors.level?.message}
              >
                {Object.keys(EmployeesEnum.Level).map((level: string) => (
                  <Select.Option key={level} value={level}>
                    <Tag
                      color={
                        EmployeesEnum.LevelColors[level as EmployeesEnum.Level]
                      }
                    >
                      {EmployeesEnum.LevelLabels[level as EmployeesEnum.Level]}
                    </Tag>
                  </Select.Option>
                ))}
              </SelectCustomAntd>
            </Col>
          </Row>

          <Row>
            <Col xs={24}>
              <TextareaCustomAntd
                label="About"
                controller={{ control, name: "about" }}
                placeholder={"Enter about"}
                rows={2}
              />
            </Col>
          </Row>

          <Addresses control={control} errors={errors} watch={watch} />

          <PhoneNumbers control={control} errors={errors} watch={watch} />

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
