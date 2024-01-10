"use client";

import { useState } from "react";

import { Button, Card, Col, message, Row, Tooltip } from "antd";
import moment from "moment";
import { SubmitHandler, useForm } from "react-hook-form";
import z from "zod";

import { zodResolver } from "@hookform/resolvers/zod";

import Avatar from "../../../components/common/Avatar/Avatar";
import EditStoreLogoModal from "../../../components/common/EditStoreLogoModal/EditStoreLogoModal";
import FormInput from "../../../components/common/FormInput/FormInput";
import handleClientError from "../../../components/common/handleClientError/handleClientError";
import HrCustom from "../../../components/common/HrCustom/HrCustom";
import Layout from "../../../components/template/Layout/Layout";
import { serviceMethodsInstance } from "../../../services/social-prices-api/ServiceMethods";

const formSchema = z.object({
  name: z.string().nonempty("Name is required"),
  email: z.string().email().nonempty("Email is required"),
  startedAt: z.string().nonempty("Started At is required"),
  description: z.string().nullable(),
});

type TFormSchema = z.infer<typeof formSchema>;

export default function NewStore() {
  const defaultValues: TFormSchema = {
    name: "",
    email: "",
    description: null,
    startedAt: "",
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TFormSchema>({
    defaultValues,
    resolver: zodResolver(formSchema),
  });

  const [isVisibleEditAvatarModal, setIsVisibleAvatarModal] =
    useState<boolean>(false);

  const [isSubmitting, setIsSUbmitting] = useState<boolean>(false);

  const logoUrl: string =
    "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png";

  const onSubmit: SubmitHandler<TFormSchema> = async (data: TFormSchema) => {
    try {
      setIsSUbmitting(true);

      const response: any =
        await serviceMethodsInstance.storesServiceMethods.create({
          description: data.description,
          email: data.email,
          logo: null,
          name: data.name,
          startedAt: moment(data.startedAt).toDate(),
        });

      message.success("Your store has been created successfully!");
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsSUbmitting(false);
    }
  };

  return (
    <Layout subtitle="New store" title="New store" hasBackButton>
      <Card className="h-min-80 mt-2">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex justify-center w-full">
            <div className="cursor-pointer z-10">
              <Tooltip title="Edit logo" placement="bottom">
                <Avatar
                  src={logoUrl}
                  width={150}
                  className="shadow-lg border-none"
                  onClick={() => setIsVisibleAvatarModal(true)}
                />

                <EditStoreLogoModal
                  isVisible={isVisibleEditAvatarModal}
                  onCancel={() => setIsVisibleAvatarModal(false)}
                  onOk={() => setIsVisibleAvatarModal(false)}
                />
              </Tooltip>
            </div>
          </div>

          <Row gutter={[16, 16]} className="mt-10">
            <Col xs={24} md={12}>
              <FormInput
                label="Name"
                placeholder={"Enter name"}
                defaultValue={""}
                register={register}
                registerName="name"
                registerOptions={{ required: true }}
                errorMessage={errors.name?.message}
                maxLength={200}
              />
            </Col>

            <Col xs={24} md={12}>
              <FormInput
                label="Email"
                placeholder={"Enter email"}
                defaultValue={""}
                register={register}
                registerName="email"
                registerOptions={{ required: true }}
                errorMessage={errors.email?.message}
                maxLength={200}
                type="email"
                divClassName="pl-0"
              />
            </Col>
          </Row>

          <Row>
            <Col xs={24} md={12}>
              <FormInput
                label="Started At"
                type="date"
                placeholder={"Enter started at"}
                defaultValue={null}
                register={register}
                registerName="startedAt"
                registerOptions={{ required: true }}
                errorMessage={errors.startedAt?.message}
              />
            </Col>

            <Col xs={24} md={12}>
              <FormInput
                label="Description"
                placeholder={"Enter description"}
                defaultValue={""}
                register={register}
                registerName="description"
                errorMessage={errors.description?.message}
                maxLength={200}
              />
            </Col>
          </Row>

          <HrCustom className="my-7" />

          <div className="flex justify-center my-5">
            <Button type="primary" onClick={handleSubmit(onSubmit)}>
              Create
            </Button>
          </div>
        </form>
      </Card>
    </Layout>
  );
}
