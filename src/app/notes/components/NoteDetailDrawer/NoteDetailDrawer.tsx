"use client";

import { useEffect, useMemo, useState } from "react";

import { App, Button, Col, DatePicker, Drawer, Row, Select } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";

import handleClientError from "../../../../components/common/HandleClientError/HandleClientError";
import HrCustom from "../../../../components/common/HrCustom/HrCustom";
import { ColorPickerCustomAntd } from "../../../../components/custom/antd/ColorPickerCustomAntd/ColorPickerCustomAntd";
import { InputCustomAntd } from "../../../../components/custom/antd/InputCustomAntd/InputCustomAntd";
import { SelectCustomAntd } from "../../../../components/custom/antd/SelectCustomAntd/SelectCustomAntd";
import { TextareaCustomAntd } from "../../../../components/custom/antd/TextareaCustomAntd/TextareaCustomAntd";
import useLanguageData from "../../../../data/context/language/useLanguageData";
import CreateNoteDto from "../../../../services/social-prices-api/notes/dto/createNote.dto";
import { serviceMethodsInstance } from "../../../../services/social-prices-api/service-methods";
import { ICategory } from "../../../../shared/business/categories/categories.interface";
import { parseColorPickerToHexString } from "../../../../shared/utils/antd/color-picker/color-picker";
import { INote } from "../../../../shared/business/notes/note.interface";
import NotesEnum from "../../../../shared/business/notes/notes.enum";
import { ISale } from "../../../../shared/business/sales/sale.interface";
import { IStore } from "../../../../shared/business/stores/stores.interface";
import { ITag } from "../../../../shared/business/tags/tags.interface";
import { createTableState } from "../../../../shared/utils/table/table-state";
import { ITableStateRequest } from "../../../../shared/utils/table/table-state.interface";
import { useFindSalesByUserTableState } from "../../../sales/useFindSalesByUserTableState";
import { SelectCustomer } from "../../../sales/create/components/SelectCustomer/SelectCustomer";

const buildFormSchema = (t: (key: string) => string) =>
  z.object({
    title: z.string().trim().nonempty(t("notes.enterTitle")),
    text: z.string().trim().nonempty(t("notes.enterText")),
    color: z.any().nullable(),
    date: z.any().refine((value) => !!value, t("notes.date")),
    status: z.string().nonempty(),
    tagsIds: z.array(z.string()),
    categoriesIds: z.array(z.string()),
    customerIds: z.array(z.string()),
    saleIds: z.array(z.string()),
    storeIds: z.array(z.string()),
  });

type TFormSchema = z.infer<ReturnType<typeof buildFormSchema>>;

const initialValues = (note: INote | null): TFormSchema => ({
  title: note?.title ?? "",
  text: note?.text ?? "",
  color: note?.color ?? null,
  date: note ? dayjs(note.date) : null,
  status: note?.status ?? NotesEnum.Status.PENDING,
  tagsIds: note?.tagsIds ?? [],
  categoriesIds: note?.categoriesIds ?? [],
  customerIds: note?.customerIds ?? [],
  saleIds: note?.saleIds ?? [],
  storeIds: note?.storeIds ?? [],
});

interface Props {
  isOpen: boolean;
  note: INote | null;
  tags: ITag[];
  categories: ICategory[];
  stores: IStore[];
  onClose: () => void;
  onOk: (note: INote) => void;
}

export const NoteDetailDrawer: React.FC<Props> = ({
  isOpen,
  note,
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

  const isEditMode: boolean = !!note;

  const {
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm<TFormSchema>({
    defaultValues: initialValues(null),
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (isOpen) {
      reset(initialValues(note));
    }
  }, [isOpen, note, reset]);

  // Customers reuse the same SelectCustomer used on the sale creation screen
  // (remote search, avatars). Sales don't have a shared component yet, so
  // this one keeps its own remote-search select.
  const [saleSearch, setSaleSearch] = useState<
    ITableStateRequest<ISale> | undefined
  >(createTableState({ sort: { field: "createdAt", order: "descend" } }));

  const { sales } = useFindSalesByUserTableState(saleSearch);

  const onSubmit: SubmitHandler<TFormSchema> = async (data) => {
    try {
      setIsSubmitting(true);

      const dto: CreateNoteDto = {
        title: data.title,
        text: data.text,
        color: parseColorPickerToHexString(data.color) || null,
        date: (data.date as Dayjs).toISOString(),
        status: data.status as NotesEnum.Status,
        tagsIds: data.tagsIds,
        categoriesIds: data.categoriesIds,
        customerIds: data.customerIds,
        saleIds: data.saleIds,
        storeIds: data.storeIds,
      };

      const saved: INote = note
        ? await serviceMethodsInstance.notesServiceMethods.update(note._id, dto)
        : await serviceMethodsInstance.notesServiceMethods.create(dto);

      message.success(note ? t("notes.updated") : t("notes.created"));

      onOk(saved);
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer
      title={note ? `${t("notes.edit")}: ${note.title}` : t("notes.new")}
      onClose={onClose}
      open={isOpen}
      destroyOnHidden
      width={700}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Row gutter={[16, 16]} className="mt-2">
          <Col xs={24}>
            <InputCustomAntd
              controller={{ control, name: "title" }}
              label={t("notes.titleLabel")}
              placeholder={t("notes.enterTitle")}
              errorMessage={errors.title?.message}
              maxLength={200}
            />
          </Col>

          <Col xs={24}>
            <TextareaCustomAntd
              controller={{ control, name: "text" }}
              label={t("notes.text")}
              placeholder={t("notes.enterText")}
              rows={4}
              maxLength={4000}
              errorMessage={errors.text?.message}
            />
          </Col>

          <Col xs={8}>
            <div className="flex flex-col">
              <label className="text-sm">{t("notes.date")}</label>

              <Controller
                control={control}
                name="date"
                render={({ field }) => (
                  <DatePicker
                    className="w-full"
                    showTime
                    format="DD/MM/YYYY HH:mm"
                    value={field.value}
                    onChange={(date) => field.onChange(date)}
                  />
                )}
              />

              {errors.date?.message && (
                <span className="text-red-500 text-xs mt-1">
                  {String(errors.date.message)}
                </span>
              )}
            </div>
          </Col>

          <Col xs={8}>
            <SelectCustomAntd
              controller={{ control, name: "status" }}
              label={t("notes.status")}
              divClassName="flex flex-col"
            >
              {Object.keys(NotesEnum.Status).map((status: string) => (
                <Select.Option key={status} value={status}>
                  {t(NotesEnum.StatusLabels[status as NotesEnum.Status])}
                </Select.Option>
              ))}
            </SelectCustomAntd>
          </Col>

          <Col xs={8}>
            <ColorPickerCustomAntd
              controller={{ control, name: "color" }}
              label={t("notes.color")}
              divClassName="flex flex-col"
              defaultValue="#1677ff"
              showText
              allowClear
            />
          </Col>

          <Col xs={24}>
            <SelectCustomAntd
              controller={{ control, name: "categoriesIds" }}
              label={t("notes.categories")}
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
              label={t("notes.tags")}
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
              label={t("notes.stores")}
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
            <div className="flex flex-col">
              <label className="text-sm">{t("notes.customers")}</label>

              <Controller
                control={control}
                name="customerIds"
                render={({ field }) => (
                  <SelectCustomer
                    mode="multiple"
                    value={field.value}
                    onSelectCustomerIds={field.onChange}
                    style={{ width: "100%" }}
                  />
                )}
              />
            </div>
          </Col>

          <Col xs={24}>
            <SelectCustomAntd
              controller={{ control, name: "saleIds" }}
              label={t("notes.sales")}
              mode="multiple"
              allowClear
              showSearch
              filterOption={false}
              onSearch={(value: string) =>
                setSaleSearch({ ...saleSearch, search: value?.trim() })
              }
            >
              {sales.map((sale: ISale) => (
                <Select.Option key={sale._id} value={sale._id}>
                  #{sale.number}
                </Select.Option>
              ))}
            </SelectCustomAntd>
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
