"use client";

import { useEffect, useMemo, useState } from "react";

import { App, Button, Col, DatePicker, Drawer, Row, Select } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";

import handleClientError from "../../../../components/common/HandleClientError/HandleClientError";
import HrCustom from "../../../../components/common/HrCustom/HrCustom";
import { InputCustomAntd } from "../../../../components/custom/antd/InputCustomAntd/InputCustomAntd";
import { InputNumberCustomAntd } from "../../../../components/custom/antd/InputNumberCustomAntd/InputNumberCustomAntd";
import { SelectCustomAntd } from "../../../../components/custom/antd/SelectCustomAntd/SelectCustomAntd";
import { TextareaCustomAntd } from "../../../../components/custom/antd/TextareaCustomAntd/TextareaCustomAntd";
import useLanguageData from "../../../../data/context/language/useLanguageData";
import { serviceMethodsInstance } from "../../../../services/social-prices-api/service-methods";
import CreateTransactionDto from "../../../../services/social-prices-api/transactions/dto/createTransaction.dto";
import { ICategory } from "../../../../shared/business/categories/categories.interface";
import { IStore } from "../../../../shared/business/stores/stores.interface";
import { ITag } from "../../../../shared/business/tags/tags.interface";
import { ITransaction } from "../../../../shared/business/transactions/transaction.interface";
import TransactionsEnum from "../../../../shared/business/transactions/transactions.enum";

const buildFormSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().trim().nonempty(t("transactions.errors.nameRequired")),
    type: z.string().nonempty(),
    status: z.string().nonempty(),
    value: z
      .number()
      .nullable()
      .refine((value) => value !== null, t("transactions.errors.valueRequired"))
      .refine(
        (value) => value === null || value > 0,
        t("transactions.errors.valuePositive"),
      ),
    createdDate: z.any().nullable(),
    note: z.string().trim().nullable(),
    categoriesIds: z.array(z.string()),
    tagsIds: z.array(z.string()),
    storeIds: z.array(z.string()),
  });

type TFormSchema = z.infer<ReturnType<typeof buildFormSchema>>;

const initialValues = (transaction: ITransaction | null): TFormSchema => ({
  name: transaction?.name ?? "",
  type: transaction?.type ?? TransactionsEnum.Type.EXPENSE,
  status: transaction?.status ?? TransactionsEnum.Status.PENDING,
  value: transaction?.value ?? null,
  createdDate: transaction ? dayjs(transaction.createdDate) : null,
  note: transaction?.note ?? null,
  categoriesIds: transaction?.categoriesIds ?? [],
  tagsIds: transaction?.tagsIds ?? [],
  storeIds: transaction?.storeIds ?? [],
});

interface Props {
  isOpen: boolean;
  transaction: ITransaction | null;
  tags: ITag[];
  categories: ICategory[];
  stores: IStore[];
  onClose: () => void;
  onOk: (transaction: ITransaction) => void;
}

export const TransactionDetailDrawer: React.FC<Props> = ({
  isOpen,
  transaction,
  tags,
  categories,
  stores,
  onClose,
  onOk,
}) => {
  const { message } = App.useApp();

  const { t } = useLanguageData();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const formSchema = useMemo(() => buildFormSchema(t), [t]);

  const isEditMode: boolean = !!transaction;

  const {
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm<TFormSchema>({
    defaultValues: initialValues(null),
    resolver: zodResolver(formSchema),
  });

  // Every time the drawer opens (for a new or another transaction) the form
  // starts from that record, so a previous edit never leaks into the next one.
  useEffect(() => {
    if (isOpen) {
      reset(initialValues(transaction));
    }
  }, [isOpen, transaction, reset]);

  const onSubmit: SubmitHandler<TFormSchema> = async (data) => {
    try {
      setIsSubmitting(true);

      const dto: CreateTransactionDto = {
        name: data.name,
        type: data.type as TransactionsEnum.Type,
        status: data.status as TransactionsEnum.Status,
        value: data.value as number,
        note: data.note?.trim() ? data.note.trim() : null,
        categoriesIds: data.categoriesIds,
        tagsIds: data.tagsIds,
        storeIds: data.storeIds,
        // Empty ⇒ the server fills it with the creation time.
        createdDate: data.createdDate
          ? (data.createdDate as Dayjs).toISOString()
          : null,
      };

      const saved: ITransaction = transaction
        ? await serviceMethodsInstance.transactionsServiceMethods.update(
            transaction._id,
            dto,
          )
        : await serviceMethodsInstance.transactionsServiceMethods.create(dto);

      message.success(
        transaction ? t("transactions.updated") : t("transactions.created"),
      );

      onOk(saved);
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer
      title={
        transaction
          ? `${t("transactions.edit")}: ${transaction.name}`
          : t("transactions.new")
      }
      onClose={onClose}
      open={isOpen}
      destroyOnHidden
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Row gutter={[16, 16]} className="mt-2">
          <Col xs={24}>
            <InputCustomAntd
              controller={{ control, name: "name" }}
              label={t("transactions.name")}
              placeholder={t("transactions.enterName")}
              errorMessage={errors.name?.message}
              maxLength={200}
            />
          </Col>

          <Col xs={12}>
            <SelectCustomAntd
              controller={{ control, name: "type" }}
              label={t("transactions.type")}
            >
              {Object.keys(TransactionsEnum.Type).map((type: string) => (
                <Select.Option key={type} value={type}>
                  {t(
                    TransactionsEnum.TypeLabels[type as TransactionsEnum.Type],
                  )}
                </Select.Option>
              ))}
            </SelectCustomAntd>
          </Col>

          <Col xs={12}>
            <SelectCustomAntd
              controller={{ control, name: "status" }}
              label={t("transactions.status")}
            >
              {Object.keys(TransactionsEnum.Status).map((status: string) => (
                <Select.Option key={status} value={status}>
                  {t(
                    TransactionsEnum.StatusLabels[
                      status as TransactionsEnum.Status
                    ],
                  )}
                </Select.Option>
              ))}
            </SelectCustomAntd>
          </Col>

          <Col xs={12}>
            <InputNumberCustomAntd
              controller={{ control, name: "value" }}
              label={t("transactions.value")}
              errorMessage={errors.value?.message}
              min={0}
              precision={2}
              prefix="R$"
              divClassName="flex flex-col"
            />
          </Col>

          <Col xs={12}>
            <div className="flex flex-col">
              <label className="text-sm">{t("transactions.date")}</label>

              <Controller
                control={control}
                name="createdDate"
                render={({ field }) => (
                  <DatePicker
                    className="w-full"
                    format="DD/MM/YYYY"
                    value={field.value}
                    onChange={(date) => field.onChange(date)}
                    placeholder={t("transactions.dateHint")}
                    allowClear
                  />
                )}
              />
            </div>
          </Col>

          <Col xs={24}>
            <SelectCustomAntd
              controller={{ control, name: "categoriesIds" }}
              label={t("transactions.categories")}
              mode="multiple"
              allowClear
              optionFilterProp="children"
            >
              {categories.map((category: ICategory) => (
                <Select.Option key={category._id} value={category._id}>
                  {category.name}
                </Select.Option>
              ))}
            </SelectCustomAntd>
          </Col>

          <Col xs={24}>
            <SelectCustomAntd
              controller={{ control, name: "tagsIds" }}
              label={t("transactions.tags")}
              mode="multiple"
              allowClear
              optionFilterProp="children"
            >
              {tags.map((tag: ITag) => (
                <Select.Option key={tag._id} value={tag._id}>
                  {tag.name}
                </Select.Option>
              ))}
            </SelectCustomAntd>
          </Col>

          <Col xs={24}>
            <SelectCustomAntd
              controller={{ control, name: "storeIds" }}
              label={t("transactions.stores")}
              mode="multiple"
              allowClear
              optionFilterProp="children"
            >
              {stores.map((store: IStore) => (
                <Select.Option key={store._id} value={store._id}>
                  {store.name}
                </Select.Option>
              ))}
            </SelectCustomAntd>
          </Col>

          <Col xs={24}>
            <TextareaCustomAntd
              controller={{ control, name: "note" }}
              label={t("transactions.note")}
              placeholder={t("transactions.enterNote")}
              rows={3}
              maxLength={2000}
            />
          </Col>
        </Row>

        <HrCustom className="my-7" />

        <div className="flex justify-center my-5">
          <Button
            type="default"
            className="mr-2"
            onClick={onClose}
            disabled={isSubmitting}
          >
            {t("common.cancel")}
          </Button>

          <Button
            type="primary"
            onClick={handleSubmit(onSubmit)}
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isEditMode ? t("common.save") : t("common.create")}
          </Button>
        </div>
      </form>
    </Drawer>
  );
};
