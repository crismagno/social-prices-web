"use client";

import { useState } from "react";

import { Card, Col, Row } from "antd";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";

import LoadingFull from "../../../components/common/LoadingFull/LoadingFull";
import Layout from "../../../components/template/Layout/Layout";
import { useFindStoresByUser } from "../../stores/useFindStoresByUser";
import { SelectCustomer } from "./components/SelectCustomer/SelectCustomer";

const formSchema = z.object({
  customerId: z.string().nullable(),
});

type TFormSchema = z.infer<typeof formSchema>;

export default function CreateSalePage() {
  const [formValues, setFormValues] = useState<TFormSchema>();

  const { stores, isLoading: isLoadingStores } = useFindStoresByUser();

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

  return (
    <Layout subtitle="Create manual sale" title="Create Sale">
      <Card
        title={
          <div className="flex">
            <label className="mr-2">Customer: </label>
            <SelectCustomer control={control} errors={errors} />
          </div>
        }
        className="h-min-80 mt-5"
      >
        <Row>
          <Col xs={24} lg={4}></Col>
        </Row>
      </Card>
    </Layout>
  );
}
