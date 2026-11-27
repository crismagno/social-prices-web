"use client";

import { useCallback, useEffect, useState } from "react";

import {
  Alert,
  App,
  Button,
  Empty,
  Input,
  Popconfirm,
  Progress,
  Spin,
  Tag,
  Tooltip,
  Typography,
} from "antd";

import {
  CloudUploadOutlined,
  DeleteOutlined,
  FolderOpenOutlined,
  PlusOutlined,
} from "@ant-design/icons";

import handleClientError from "../../../components/common/HandleClientError/HandleClientError";
import { getTemplateEntry } from "../../../components/store-site/template-registry";
import useLanguageData from "../../../data/context/language/useLanguageData";
import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import {
  IStoreSiteMock,
  IStoreSiteMocksList,
  MOCK_NAME_MAX,
} from "../../../shared/business/store-sites/store-site-mock";
import { IStoreSiteEditor } from "./useStoreSiteEditor";

interface Props {
  editor: IStoreSiteEditor;
  storeId: string;
}

const DATE: Intl.DateTimeFormat = new Intl.DateTimeFormat(undefined, {
  dateStyle: "short",
  timeStyle: "short",
});

/**
 * Copies of the site the owner keeps aside: an example to open again in the
 * editor and go on changing, without touching the site that is online. How
 * many an account keeps is a limit a manager can raise.
 */
const MocksTab = ({ editor, storeId }: Props) => {
  const { t } = useLanguageData();
  const { modal, message } = App.useApp();

  const [list, setList] = useState<IStoreSiteMocksList | null>(null);
  const [name, setName] = useState<string>("");
  // The mock an action is running on, or "new" while one is being kept.
  const [busyId, setBusyId] = useState<string | null>(null);

  const methods = serviceMethodsInstance.storeSitesServiceMethods;

  const load = useCallback(async (): Promise<void> => {
    try {
      setList(await methods.findMocks(storeId));
    } catch (error: any) {
      handleClientError(error);
    }
  }, [methods, storeId]);

  useEffect(() => {
    setList(null);
    load();
  }, [load]);

  const run = async (id: string, action: () => Promise<void>) => {
    try {
      setBusyId(id);
      await action();
      await load();
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setBusyId(null);
    }
  };

  if (!editor.draft) {
    return null;
  }

  const draft = editor.draft;

  const isFull: boolean =
    !!list && list.limit !== null && list.used >= list.limit;

  const suggestedName: string = t("storeSite.editor.mocks.defaultName").replace(
    "{number}",
    String((list?.used ?? 0) + 1),
  );

  const create = () =>
    run("new", async () => {
      await methods.createMock(storeId, name.trim() || suggestedName, draft);
      setName("");
      message.success(t("storeSite.editor.mocks.created"));
    });

  const open = (mock: IStoreSiteMock) => {
    const doOpen = () =>
      run(mock._id, async () => {
        const full: IStoreSiteMock = await methods.findMock(mock._id);

        editor.openContent(full.content ?? {});
        message.success(t("storeSite.editor.mocks.opened"));
      });

    // Changes not saved would be lost under the mock: asked first.
    if (editor.isDirty) {
      modal.confirm({
        title: t("storeSite.editor.mocks.openConfirm"),
        content: t("storeSite.editor.mocks.openConfirmHint"),
        okText: t("storeSite.editor.mocks.open"),
        cancelText: t("storeSite.editor.mocks.cancel"),
        onOk: doOpen,
      });
    } else {
      doOpen();
    }
  };

  const overwrite = (mock: IStoreSiteMock) =>
    run(mock._id, async () => {
      await methods.updateMock(mock._id, { content: draft });
      message.success(t("storeSite.editor.mocks.updated"));
    });

  const rename = (mock: IStoreSiteMock, next: string) => {
    const trimmed: string = next.trim();

    if (trimmed && trimmed !== mock.name) {
      run(mock._id, async () => {
        await methods.updateMock(mock._id, { name: trimmed });
      });
    }
  };

  const remove = (mock: IStoreSiteMock) =>
    run(mock._id, async () => {
      await methods.removeMock(mock._id);
    });

  if (!list) {
    return <Spin />;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* How many are kept, against how many the account may keep. */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">
            {t("storeSite.editor.mocks.usage")}
          </span>
          <span>
            {list.limit === null ? list.used : `${list.used} / ${list.limit}`}
          </span>
        </div>
        {list.limit !== null && (
          <Progress
            percent={Math.min(
              100,
              list.limit ? (list.used / list.limit) * 100 : 100,
            )}
            showInfo={false}
            size="small"
            status={isFull ? "exception" : "normal"}
          />
        )}
      </div>

      {isFull ? (
        <Alert
          type="info"
          showIcon
          message={t("storeSite.editor.mocks.full").replace(
            "{limit}",
            String(list.limit),
          )}
        />
      ) : (
        <div className="flex gap-2">
          <Input
            maxLength={MOCK_NAME_MAX}
            placeholder={suggestedName}
            value={name}
            onChange={(event) => setName(event.target.value)}
            onPressEnter={create}
            aria-label={t("storeSite.editor.mocks.name")}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            loading={busyId === "new"}
            disabled={!!busyId}
            onClick={create}
          >
            {t("storeSite.editor.mocks.save")}
          </Button>
        </div>
      )}

      {list.mocks.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t("storeSite.editor.mocks.empty")}
        />
      ) : (
        <div className="flex flex-col gap-2">
          {list.mocks.map((mock: IStoreSiteMock) => {
            const isBusy: boolean = busyId === mock._id;

            return (
              <div
                key={mock._id}
                className="rounded-lg border border-gray-200 dark:border-gray-700 p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Typography.Text
                      strong
                      editable={{
                        maxLength: MOCK_NAME_MAX,
                        tooltip: t("storeSite.editor.mocks.rename"),
                        onChange: (next: string) => rename(mock, next),
                      }}
                    >
                      {mock.name}
                    </Typography.Text>
                    <div className="text-xs opacity-70 mt-1 flex flex-wrap items-center gap-1">
                      <Tag className="m-0">
                        {t(getTemplateEntry(mock.templateId).labelKey)}
                      </Tag>
                      <span>
                        {t("storeSite.editor.mocks.updatedAt").replace(
                          "{date}",
                          DATE.format(new Date(mock.updatedAt)),
                        )}
                      </span>
                    </div>
                  </div>
                  <Popconfirm
                    title={t("storeSite.editor.mocks.removeConfirm")}
                    okText={t("storeSite.editor.mocks.remove")}
                    cancelText={t("storeSite.editor.mocks.cancel")}
                    okButtonProps={{ danger: true }}
                    onConfirm={() => remove(mock)}
                  >
                    <Button
                      type="text"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      aria-label={t("storeSite.editor.mocks.remove")}
                      disabled={!!busyId}
                    />
                  </Popconfirm>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Button
                    size="small"
                    icon={<FolderOpenOutlined />}
                    loading={isBusy}
                    disabled={!!busyId && !isBusy}
                    onClick={() => open(mock)}
                  >
                    {t("storeSite.editor.mocks.open")}
                  </Button>
                  <Popconfirm
                    title={t("storeSite.editor.mocks.overwriteConfirm")}
                    okText={t("storeSite.editor.mocks.overwrite")}
                    cancelText={t("storeSite.editor.mocks.cancel")}
                    onConfirm={() => overwrite(mock)}
                  >
                    <Tooltip title={t("storeSite.editor.mocks.overwriteHint")}>
                      <Button
                        size="small"
                        icon={<CloudUploadOutlined />}
                        disabled={!!busyId}
                      >
                        {t("storeSite.editor.mocks.overwrite")}
                      </Button>
                    </Tooltip>
                  </Popconfirm>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MocksTab;
