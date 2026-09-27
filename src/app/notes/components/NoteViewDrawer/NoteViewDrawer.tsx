"use client";

import { Descriptions, Drawer, Tag } from "antd";
import moment from "moment";

import useLanguageData from "../../../../data/context/language/useLanguageData";
import { INote } from "../../../../shared/business/notes/note.interface";
import NotesEnum from "../../../../shared/business/notes/notes.enum";
import DatesEnum from "../../../../shared/utils/dates/dates.enum";

interface Props {
  note: INote | null;
  categoriesById: Record<string, string>;
  tagsById: Record<string, string>;
  storesById: Record<string, string>;
  customersById: Record<string, string>;
  onClose: () => void;
}

const idsAsTags = (
  ids: string[],
  byId: Record<string, string>,
): React.ReactNode => {
  if (!ids.length) {
    return "-";
  }

  return ids.map((id) => <Tag key={id}>{byId[id] ?? id}</Tag>);
};

export const NoteViewDrawer: React.FC<Props> = ({
  note,
  categoriesById,
  tagsById,
  storesById,
  customersById,
  onClose,
}) => {
  const { t } = useLanguageData();

  return (
    <Drawer
      open={!!note}
      onClose={onClose}
      width={700}
      title={t("notes.view")}
      destroyOnHidden
    >
      {note && (
        <>
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label={t("notes.titleLabel")}>
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full border border-black/10"
                  style={{ backgroundColor: note.color ?? "transparent" }}
                />

                {note.title}
              </div>
            </Descriptions.Item>

            <Descriptions.Item label={t("notes.status")}>
              <Tag color={NotesEnum.StatusColors[note.status]}>
                {t(NotesEnum.StatusLabels[note.status])}
              </Tag>
            </Descriptions.Item>

            <Descriptions.Item label={t("notes.date")}>
              {moment(note.date).format(DatesEnum.Format.DDMMYYYYhhmmss)}
            </Descriptions.Item>

            <Descriptions.Item label={t("notes.categories")}>
              {idsAsTags(note.categoriesIds, categoriesById)}
            </Descriptions.Item>

            <Descriptions.Item label={t("notes.tags")}>
              {idsAsTags(note.tagsIds, tagsById)}
            </Descriptions.Item>

            <Descriptions.Item label={t("notes.stores")}>
              {idsAsTags(note.storeIds, storesById)}
            </Descriptions.Item>

            <Descriptions.Item label={t("notes.customers")}>
              {idsAsTags(note.customerIds, customersById)}
            </Descriptions.Item>

            <Descriptions.Item label={t("notes.createdAt")}>
              {moment(note.createdAt).format(DatesEnum.Format.DDMMYYYYhhmmss)}
            </Descriptions.Item>
          </Descriptions>

          <h3 className="mt-5 mb-2 font-semibold">{t("notes.text")}</h3>

          <p className="whitespace-pre-wrap break-words">{note.text}</p>
        </>
      )}
    </Drawer>
  );
};
