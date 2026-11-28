"use client";

import { Card, Input, Switch } from "antd";

import useLanguageData from "../../../data/context/language/useLanguageData";
import {
  HOME_LABEL_MAX,
  IStoreSiteHeaderHome,
} from "../../../shared/business/store-sites/store-site-header";
import { IStoreSiteEditor } from "./useStoreSiteEditor";

interface Props {
  editor: IStoreSiteEditor;
}

/**
 * The "home" of the menu: whether it is there, and its own words. The same
 * choice wherever it is shown (the pages and the header), kept with the header.
 */
const HomeMenuFields = ({ editor }: Props) => {
  const { t } = useLanguageData();

  if (!editor.draft) {
    return null;
  }

  const { home } = editor.draft.header;

  // From the draft as it is when applied, like every change of the editor.
  const set = (patch: Partial<IStoreSiteHeaderHome>): void =>
    editor.update((draft) => ({
      header: { ...draft.header, home: { ...draft.header.home, ...patch } },
    }));

  return (
    <Card
      size="small"
      title={t("storeSite.editor.pages.homeMenu.title")}
      extra={
        <Switch
          size="small"
          checked={home.isInMenu}
          aria-label={t("storeSite.editor.pages.inMenu")}
          onChange={(isInMenu: boolean) => set({ isInMenu })}
        />
      }
    >
      <Input
        allowClear
        maxLength={HOME_LABEL_MAX}
        disabled={!home.isInMenu}
        placeholder={t("storeSite.pages.home")}
        value={home.label ?? ""}
        onChange={(event) => set({ label: event.target.value || null })}
      />
      <p className="mt-2 mb-0 text-xs opacity-70">
        {t("storeSite.editor.pages.homeMenu.hint")}
      </p>
    </Card>
  );
};

export default HomeMenuFields;
