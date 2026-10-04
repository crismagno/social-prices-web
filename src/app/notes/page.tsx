"use client";

import {
  useMemo,
  useState,
} from 'react';

import {
  App,
  Button,
  Card,
  Checkbox,
  Popconfirm,
  Tag,
  Tooltip,
} from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import moment from 'moment';

import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';

import handleClientError
  from '../../components/common/HandleClientError/HandleClientError';
import {
  TagCategoriesCustomAntd,
} from '../../components/common/TagCategoriesCustomAntd/TagCategoriesCustomAntd';
import {
  TagStoresCustomAntd,
} from '../../components/common/TagStoresCustomAntd/TagStoresCustomAntd';
import {
  TagTagsCustomAntd,
} from '../../components/common/TagTagsCustomAntd/TagTagsCustomAntd';
import TableCustomAntd2
  from '../../components/custom/antd/TableCustomAntd2/TableCustomAntd2';
import Layout from '../../components/template/Layout/Layout';
import useLanguageData from '../../data/context/language/useLanguageData';
import {
  serviceMethodsInstance,
} from '../../services/social-prices-api/service-methods';
import CategoriesEnum from '../../shared/business/categories/categories.enum';
import {
  ICategory,
} from '../../shared/business/categories/categories.interface';
import { INote } from '../../shared/business/notes/note.interface';
import NotesEnum from '../../shared/business/notes/notes.enum';
import { INoteFilters } from '../../shared/business/notes/notes.types';
import { IStore } from '../../shared/business/stores/stores.interface';
import TagsEnum from '../../shared/business/tags/tags.enum';
import { ITag } from '../../shared/business/tags/tags.interface';
import DatesEnum from '../../shared/utils/dates/dates.enum';
import { createTableState } from '../../shared/utils/table/table-state';
import {
  ITableStateRequest,
} from '../../shared/utils/table/table-state.interface';
import { useFindCategoriesByType } from '../categories/useFindCategoriesByType';
import {
  SelectCustomer,
} from '../sales/create/components/SelectCustomer/SelectCustomer';
import { useFindStoresByUser } from '../stores/useFindStoresByUser';
import { useFindTagsByType } from '../tags/useFindTagsByType';
import {
  NoteDetailDrawer,
} from './components/NoteDetailDrawer/NoteDetailDrawer';
import { NotesCalendar } from './components/NotesCalendar/NotesCalendar';
import { NoteViewDrawer } from './components/NoteViewDrawer/NoteViewDrawer';
import { useCustomersByIds } from './useCustomersByIds';
import { useFindNotesByUserTableState } from './useFindNotesByUserTableState';
import { useNotesCalendarMarkers } from './useNotesCalendarMarkers';

export default function NotesPage() {
  const { t } = useLanguageData();

  const { message } = App.useApp();

  const { tags } = useFindTagsByType(TagsEnum.Type.NOTE);
  const { categories } = useFindCategoriesByType(CategoriesEnum.Type.NOTE);
  const { stores } = useFindStoresByUser();

  const [tableStateRequest, setTableStateRequest] = useState<
    ITableStateRequest<INote> | undefined
  >(createTableState({ sort: { field: "date", order: "descend" } }));

  const [calendarMonth, setCalendarMonth] = useState<Dayjs>(dayjs());

  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);

  // Every filter lives in the grid's column headers (TableCustomAntd2), which
  // land in `tableStateRequest.filters`; cleared columns arrive as `null` and
  // are dropped. The calendar day selection is layered on top.
  const combinedFilters: INoteFilters = useMemo(() => {
    const dayFilter: INoteFilters = selectedDate
      ? {
          rangeDate: {
            startDate: selectedDate.startOf("day").toDate(),
            endDate: selectedDate.endOf("day").toDate(),
          },
        }
      : {};

    const columnFilters = Object.fromEntries(
      Object.entries(tableStateRequest?.filters ?? {}).filter(
        ([, value]) => value != null,
      ),
    ) as INoteFilters;

    return { ...columnFilters, ...dayFilter };
  }, [tableStateRequest?.filters, selectedDate]);

  const gridRequest = useMemo(
    () => ({ ...tableStateRequest, filters: combinedFilters }),
    [tableStateRequest, combinedFilters],
  );

  const calendarRequest = useMemo(
    () => ({
      search: tableStateRequest?.search,
      filters: combinedFilters,
      monthStart: calendarMonth.startOf("month").toISOString(),
      monthEnd: calendarMonth.endOf("month").toISOString(),
    }),
    [tableStateRequest?.search, combinedFilters, calendarMonth],
  );

  const {
    isLoading: isLoadingGrid,
    notes,
    total,
    refetch: refetchGrid,
  } = useFindNotesByUserTableState(gridRequest);

  const {
    isLoading: isLoadingCalendar,
    markers,
    refetch: refetchCalendar,
  } = useNotesCalendarMarkers(calendarRequest);

  const [drawer, setDrawer] = useState<{ isOpen: boolean; note: INote | null }>(
    { isOpen: false, note: null },
  );

  const [viewedNote, setViewedNote] = useState<INote | null>(null);

  const categoriesById: Record<string, string> = useMemo(
    () =>
      Object.fromEntries(
        categories.map((category) => [category._id, category.name]),
      ),
    [categories],
  );

  const tagsById: Record<string, string> = useMemo(
    () => Object.fromEntries(tags.map((tag) => [tag._id, tag.name])),
    [tags],
  );

  const storesById: Record<string, string> = useMemo(
    () => Object.fromEntries(stores.map((store) => [store._id, store.name])),
    [stores],
  );

  // Customers have no unpaged list to build a static map from, so names are
  // resolved on demand for whatever ids are currently on screen: the grid's
  // rows, the applied filter, and the note being viewed.
  const visibleCustomerIds: string[] = useMemo(
    () => [
      ...notes.flatMap((note) => note.customerIds),
      ...(combinedFilters.customerIds ?? []),
      ...(viewedNote?.customerIds ?? []),
    ],
    [notes, combinedFilters.customerIds, viewedNote],
  );

  const customersById: Record<string, string> =
    useCustomersByIds(visibleCustomerIds);

  const refreshAll = async (): Promise<void> => {
    await Promise.all([refetchGrid(), refetchCalendar()]);
  };

  const handleToggleCompleted = async (
    note: INote,
    checked: boolean,
  ): Promise<void> => {
    try {
      await serviceMethodsInstance.notesServiceMethods.updateStatus(
        note._id,
        checked ? NotesEnum.Status.COMPLETED : NotesEnum.Status.PENDING,
      );

      message.success(t("notes.statusUpdated"));

      await refreshAll();
    } catch (error: any) {
      handleClientError(error);
    }
  };

  const handleRemove = async (note: INote): Promise<void> => {
    try {
      await serviceMethodsInstance.notesServiceMethods.remove(note._id);

      message.success(t("notes.removed"));

      await refreshAll();
    } catch (error: any) {
      handleClientError(error);
    }
  };

  return (
    <Layout
      title={t("notes.title")}
      subtitle={t("notes.subtitle")}
      hasBackButton
    >
      <div className="mt-4">
        <NotesCalendar
          markers={markers}
          isLoading={isLoadingCalendar}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          onPanelChange={setCalendarMonth}
        />
      </div>

      <Card
        title={t("notes.title")}
        className="h-min-80"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setDrawer({ isOpen: true, note: null })}
          >
            {t("notes.new")}
          </Button>
        }
      >
        {selectedDate && (
          <div className="mb-4">
            <Tag closable onClose={() => setSelectedDate(null)} color="blue">
              {selectedDate.format("DD/MM/YYYY")}
            </Tag>
          </div>
        )}

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
                    handleToggleCompleted(note, event.target.checked)
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
                  {/* The user's own color, kept apart from the status tag so
                      it stays a free-form identification cue, not a state. */}
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
              title: t("notes.tags"),
              dataIndex: "tagsIds",
              key: "tagsIds",
              filters: tags?.map((tag: ITag) => ({
                text: tag.name,
                value: tag._id,
              })),
              align: "center",
              render: (tagsIds: string[]) => (
                <TagTagsCustomAntd tags={tags} tagsIds={tagsIds} />
              ),
            },
            {
              title: t("notes.categories"),
              dataIndex: "categoriesIds",
              key: "categoriesIds",
              filters: categories?.map((category: ICategory) => ({
                text: category.name,
                value: category._id,
              })),
              align: "center",
              render: (categoriesIds: string[]) => (
                <TagCategoriesCustomAntd
                  categories={categories}
                  categoriesIds={categoriesIds}
                />
              ),
            },
            {
              title: t("notes.stores"),
              dataIndex: "storeIds",
              key: "storeIds",
              align: "center",
              filterSearch: true,
              filters: stores?.map((store: IStore) => ({
                text: store.name,
                value: store._id,
              })),
              render: (storeIds: string[]) =>
                storeIds?.length ? (
                  <TagStoresCustomAntd stores={stores} storeIds={storeIds} />
                ) : (
                  "-"
                ),
            },
            {
              title: t("notes.customers"),
              dataIndex: "customerIds",
              key: "customerIds",
              filterDropdown: ({ selectedKeys, setSelectedKeys, confirm }) => (
                <div className="p-2 w-64">
                  <SelectCustomer
                    mode="multiple"
                    value={selectedKeys as string[]}
                    onSelectCustomerIds={(ids) => {
                      setSelectedKeys(ids);
                      confirm({ closeDropdown: false });
                    }}
                    style={{ width: "100%" }}
                  />
                </div>
              ),
              filterIcon: (filtered: boolean) => (
                <SearchOutlined
                  style={{ color: filtered ? "#1677ff" : undefined }}
                />
              ),
              render: (ids: string[]) =>
                ids?.length
                  ? ids.map((id) => (
                      <span key={id}>{customersById[id] ?? id}</span>
                    ))
                  : "-",
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
                    onConfirm={() => handleRemove(note)}
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
          loading={isLoadingGrid}
          tableStateRequest={tableStateRequest}
          setTableStateRequest={setTableStateRequest}
          total={total}
        />
      </Card>

      <NoteDetailDrawer
        isOpen={drawer.isOpen}
        note={drawer.note}
        tags={tags}
        categories={categories}
        stores={stores}
        onClose={() => setDrawer({ isOpen: false, note: null })}
        onOk={async () => {
          setDrawer({ isOpen: false, note: null });

          await refreshAll();
        }}
      />

      <NoteViewDrawer
        note={viewedNote}
        categoriesById={categoriesById}
        tagsById={tagsById}
        storesById={storesById}
        customersById={customersById}
        onClose={() => setViewedNote(null)}
      />
    </Layout>
  );
}
