"use client";

import { useMemo, useState } from "react";

import { App, Button, Checkbox, Popconfirm, Tag, Tooltip } from "antd";
import moment from "moment";

import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
} from "@ant-design/icons";

import handleClientError from "../../../components/common/HandleClientError/HandleClientError";
import TableCustomAntd2 from "../../../components/custom/antd/TableCustomAntd2/TableCustomAntd2";
import useLanguageData from "../../../data/context/language/useLanguageData";
import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import CategoriesEnum from "../../../shared/business/categories/categories.enum";
import { INote } from "../../../shared/business/notes/note.interface";
import NotesEnum from "../../../shared/business/notes/notes.enum";
import TagsEnum from "../../../shared/business/tags/tags.enum";
import DatesEnum from "../../../shared/utils/dates/dates.enum";
import { createTableState } from "../../../shared/utils/table/table-state";
import { ITableStateRequest } from "../../../shared/utils/table/table-state.interface";
import { useFindCategoriesByType } from "../../categories/useFindCategoriesByType";
import { NoteDetailDrawer } from "../../notes/components/NoteDetailDrawer/NoteDetailDrawer";
import { NoteViewDrawer } from "../../notes/components/NoteViewDrawer/NoteViewDrawer";
import { useFindNotesByUserTableState } from "../../notes/useFindNotesByUserTableState";
import { useFindStoresByUser } from "../../stores/useFindStoresByUser";
import { useFindTagsByType } from "../../tags/useFindTagsByType";

interface Props {
  customerId: string;
  customerName: string;
}

/**
 * The notes of one customer: the same notes of the notes page, only the ones
 * linked to this customer. A note added here starts linked to them.
 */
export default function CustomerNotesTab({ customerId, customerName }: Props) {
  const { t } = useLanguageData();

  const { message } = App.useApp();

  const { tags } = useFindTagsByType(TagsEnum.Type.NOTE);
  const { categories } = useFindCategoriesByType(CategoriesEnum.Type.NOTE);
  const { stores } = useFindStoresByUser();

  const [tableStateRequest, setTableStateRequest] = useState<
    ITableStateRequest<INote> | undefined
  >(createTableState({ sort: { field: "date", order: "descend" } }));

  // Whatever the grid filters by, always within this customer's notes.
  const request = useMemo(
    () => ({
      ...tableStateRequest,
      filters: {
        ...Object.fromEntries(
          Object.entries(tableStateRequest?.filters ?? {}).filter(
            ([, value]) => value != null,
          ),
        ),
        customerIds: [customerId],
      },
    }),
    [tableStateRequest, customerId],
  );

  const { isLoading, notes, total, refetch } = useFindNotesByUserTableState(
    request as ITableStateRequest<INote>,
  );

  const [drawer, setDrawer] = useState<{ isOpen: boolean; note: INote | null }>(
    { isOpen: false, note: null },
  );

  const [viewedNote, setViewedNote] = useState<INote | null>(null);

  const namesById = (list: { _id: string; name: string }[]) =>
    Object.fromEntries(list.map((each) => [each._id, each.name]));

  const toggleCompleted = async (
    note: INote,
    isCompleted: boolean,
  ): Promise<void> => {
    try {
      await serviceMethodsInstance.notesServiceMethods.updateStatus(
        note._id,
        isCompleted ? NotesEnum.Status.COMPLETED : NotesEnum.Status.PENDING,
      );

      message.success(t("notes.statusUpdated"));

      await refetch();
    } catch (error: any) {
      handleClientError(error);
    }
  };

  const remove = async (note: INote): Promise<void> => {
    try {
      await serviceMethodsInstance.notesServiceMethods.remove(note._id);

      message.success(t("notes.removed"));

      await refetch();
    } catch (error: any) {
      handleClientError(error);
    }
  };

  return (
    <>
      <div className="mb-3 flex justify-end">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setDrawer({ isOpen: true, note: null })}
        >
          {t("notes.new")}
        </Button>
      </div>

      <TableCustomAntd2<INote>
        rowKey={"_id"}
        dataSource={notes}
        columns={[
          {
            title: t("notes.statusCompleted"),
            key: "completed",
            align: "center",
            render: (_: unknown, note: INote) => (
              <Checkbox
                checked={note.status === NotesEnum.Status.COMPLETED}
                disabled={note.status === NotesEnum.Status.CANCELLED}
                onChange={(event) =>
                  toggleCompleted(note, event.target.checked)
                }
              />
            ),
          },
          {
            title: t("notes.titleLabel"),
            dataIndex: "title",
            key: "title",
            render: (title: string, note: INote) => (
              <div className="flex items-start gap-2">
                <span
                  className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full border border-black/10"
                  style={{ backgroundColor: note.color ?? "transparent" }}
                  title={note.color ?? undefined}
                />

                <div className="flex flex-col">
                  <span>{title}</span>

                  <span className="text-[11px] leading-tight italic text-gray-400 dark:text-gray-500 truncate max-w-xs">
                    {note.text}
                  </span>
                </div>
              </div>
            ),
          },
          {
            title: t("notes.date"),
            dataIndex: "date",
            key: "date",
            align: "center",
            sorter: true,
            render: (date: Date) =>
              moment(date).format(DatesEnum.Format.DDMMYYYYhhmmss),
          },
          {
            title: t("notes.status"),
            dataIndex: "status",
            key: "status",
            align: "center",
            filters: Object.values(NotesEnum.Status).map((status) => ({
              text: t(NotesEnum.StatusLabels[status]),
              value: status,
            })),
            render: (status: NotesEnum.Status) => (
              <Tag color={NotesEnum.StatusColors[status]}>
                {t(NotesEnum.StatusLabels[status])}
              </Tag>
            ),
          },
          {
            title: t("common.actions"),
            key: "actions",
            align: "center",
            render: (_: unknown, note: INote) => (
              <div className="flex items-center justify-center gap-2">
                <Tooltip title={t("notes.view")}>
                  <Button
                    icon={<EyeOutlined />}
                    aria-label={t("notes.view")}
                    onClick={() => setViewedNote(note)}
                  />
                </Tooltip>

                <Tooltip title={t("common.edit")}>
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    aria-label={t("common.edit")}
                    onClick={() => setDrawer({ isOpen: true, note })}
                  />
                </Tooltip>

                <Popconfirm
                  title={t("notes.deleteTitle")}
                  description={t("notes.deleteDescription")}
                  okText={t("common.yes")}
                  cancelText={t("common.no")}
                  okButtonProps={{ danger: true }}
                  onConfirm={() => remove(note)}
                >
                  <Button
                    danger
                    type="primary"
                    icon={<DeleteOutlined />}
                    aria-label={t("common.delete")}
                  />
                </Popconfirm>
              </div>
            ),
          },
        ]}
        search={{ placeholder: t("notes.searchNotes") }}
        loading={isLoading}
        tableStateRequest={tableStateRequest}
        setTableStateRequest={setTableStateRequest}
        total={total}
      />

      <NoteDetailDrawer
        isOpen={drawer.isOpen}
        note={drawer.note}
        tags={tags}
        categories={categories}
        stores={stores}
        // A new note starts with this customer; they can still be taken out.
        defaultCustomerIds={[customerId]}
        onClose={() => setDrawer({ isOpen: false, note: null })}
        onOk={async () => {
          setDrawer({ isOpen: false, note: null });

          await refetch();
        }}
      />

      <NoteViewDrawer
        note={viewedNote}
        categoriesById={namesById(categories)}
        tagsById={namesById(tags)}
        storesById={namesById(stores)}
        // Other customers of the note show as they do when unknown here.
        customersById={{ [customerId]: customerName }}
        onClose={() => setViewedNote(null)}
      />
    </>
  );
}
