"use client";

import { Key, useMemo, useState } from "react";

import { useSearchParams } from "next/navigation";

import {
  Alert,
  App,
  Button,
  Card,
  Empty,
  Input,
  Popconfirm,
  Space,
  Spin,
  Table,
  Tag,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

import { SaveOutlined, SyncOutlined } from "@ant-design/icons";

import GoogleColorIcon from "../../../components/common/GoogleColorIcon/GoogleColorIcon";
import handleClientError from "../../../components/common/HandleClientError/HandleClientError";
import Layout from "../../../components/template/Layout/Layout";
import useAppData from "../../../data/context/app/useAppData";
import useAuthData from "../../../data/context/auth/useAuthData";
import useLanguageData from "../../../data/context/language/useLanguageData";
import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import AppsEnum from "../../../shared/business/apps/apps.enum";
import {
  IAppCatalogItem,
  IAppContactRow,
  IAppImportResult,
  IAppSyncPreview,
} from "../../../shared/business/apps/apps.types";
import EmployeesEnum from "../../../shared/business/employees/employees.enum";

type Busy = "connect" | "sync" | "save" | "disconnect" | null;

const APP_ID: AppsEnum.App = AppsEnum.App.GOOGLE_CONTACTS;

export default function GoogleContactsAppPage() {
  const { t } = useLanguageData();

  const { message } = App.useApp();

  const { employee } = useAuthData();

  const {
    apps: { catalog, isLoadingApps, fetchApps },
  } = useAppData();

  const errorCode: string | null = useSearchParams().get("error");

  const [busy, setBusy] = useState<Busy>(null);

  const [preview, setPreview] = useState<IAppSyncPreview | null>(null);

  const [selectedKeys, setSelectedKeys] = useState<Key[]>([]);

  const [search, setSearch] = useState<string>("");

  const [lastResult, setLastResult] = useState<IAppImportResult | null>(null);

  const item: IAppCatalogItem | undefined = catalog.find(
    (app: IAppCatalogItem) => app.id === APP_ID,
  );

  // The API enforces this too; the buttons are disabled so nobody hits a 403.
  const canManage: boolean = employee?.level !== EmployeesEnum.Level.EMPLOYEE;

  const isExpired: boolean = item?.status === AppsEnum.ConnectionStatus.EXPIRED;

  const summary: IAppImportResult | null =
    lastResult ?? item?.lastSyncSummary ?? null;

  const filteredContacts: IAppContactRow[] = useMemo(() => {
    const term: string = search.trim().toLowerCase();

    if (!preview || !term) {
      return preview?.contacts ?? [];
    }

    return preview.contacts.filter((contact: IAppContactRow) =>
      [contact.name, contact.email, contact.phone].some((value) =>
        value?.toLowerCase().includes(term),
      ),
    );
  }, [preview, search]);

  const formatResult = (result: IAppImportResult): string =>
    t("apps.google.importResult")
      .replace("{created}", String(result.created))
      .replace("{linked}", String(result.linked))
      .replace("{skipped}", String(result.skipped))
      .replace("{failed}", String(result.failed));

  const loadContacts = async (): Promise<void> => {
    const response =
      await serviceMethodsInstance.appsServiceMethods.sync(APP_ID);

    setPreview(response);
  };

  const handleConnect = async (): Promise<void> => {
    try {
      setBusy("connect");

      const { url } =
        await serviceMethodsInstance.appsServiceMethods.connect(APP_ID);

      window.location.href = url;
    } catch (error: any) {
      handleClientError(error);
      setBusy(null);
    }
  };

  const handleSync = async (): Promise<void> => {
    try {
      setBusy("sync");

      setSelectedKeys([]);

      await loadContacts();
    } catch (error: any) {
      handleClientError(error);
    } finally {
      // Also refreshes the status after an APP_CONNECTION_EXPIRED answer.
      await fetchApps();
      setBusy(null);
    }
  };

  const handleSave = async (): Promise<void> => {
    try {
      setBusy("save");

      const result =
        await serviceMethodsInstance.appsServiceMethods.importContacts(
          APP_ID,
          selectedKeys.map(String),
        );

      setLastResult(result);

      setSelectedKeys([]);

      message.success(`${t("apps.google.grid.saved")} ${formatResult(result)}`);

      // What was just saved is now "already a customer".
      await loadContacts();

      await fetchApps();
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setBusy(null);
    }
  };

  const handleDisconnect = async (): Promise<void> => {
    try {
      setBusy("disconnect");

      await serviceMethodsInstance.appsServiceMethods.disconnect(APP_ID);

      setLastResult(null);

      setPreview(null);

      setSelectedKeys([]);

      message.success(t("apps.google.disconnected"));

      await fetchApps();
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setBusy(null);
    }
  };

  const columns: ColumnsType<IAppContactRow> = [
    {
      title: t("apps.google.grid.name"),
      dataIndex: "name",
      sorter: (a: IAppContactRow, b: IAppContactRow) =>
        a.name.localeCompare(b.name),
    },
    {
      title: t("apps.google.grid.email"),
      dataIndex: "email",
      render: (value: string | null) => value ?? "-",
    },
    {
      title: t("apps.google.grid.phone"),
      dataIndex: "phone",
      render: (value: string | null) => value ?? "-",
    },
    {
      title: t("apps.google.grid.status"),
      dataIndex: "status",
      width: 180,
      render: (status: AppsEnum.ContactStatus) => {
        if (status === AppsEnum.ContactStatus.NEW) {
          return <Tag color="green">{t("apps.google.grid.new")}</Tag>;
        }

        if (status === AppsEnum.ContactStatus.EXISTING) {
          return <Tag color="blue">{t("apps.google.grid.existing")}</Tag>;
        }

        return <Tag>{t("apps.google.grid.linked")}</Tag>;
      },
    },
  ];

  const renderContacts = () => {
    if (!preview) {
      return null;
    }

    if (preview.contacts.length === 0) {
      return (
        <Card>
          <Empty description={t("apps.google.grid.empty")} />
        </Card>
      );
    }

    return (
      <Card>
        <Space direction="vertical" size="middle" className="w-full">
          <span>{t("apps.google.listHint")}</span>

          {preview.hasMore && (
            <Alert
              type="info"
              showIcon
              message={t("apps.google.hasMore").replace(
                "{count}",
                String(preview.contacts.length),
              )}
            />
          )}

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={busy === "save"}
              disabled={
                !canManage || busy !== null || selectedKeys.length === 0
              }
              onClick={handleSave}
            >
              {t("apps.google.grid.save")}
            </Button>

            <span>
              {t("apps.google.grid.selected").replace(
                "{count}",
                String(selectedKeys.length),
              )}
            </span>

            <Button
              disabled={busy !== null}
              onClick={() =>
                setSelectedKeys(
                  filteredContacts
                    .filter(
                      (contact: IAppContactRow) =>
                        contact.status !== AppsEnum.ContactStatus.LINKED,
                    )
                    .map((contact: IAppContactRow) => contact.externalId),
                )
              }
            >
              {t("apps.google.grid.selectAll")}
            </Button>

            <Button
              disabled={busy !== null || selectedKeys.length === 0}
              onClick={() => setSelectedKeys([])}
            >
              {t("apps.google.grid.clear")}
            </Button>

            <Input
              allowClear
              className="max-w-xs"
              placeholder={t("apps.google.grid.search")}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <Table<IAppContactRow>
            rowKey="externalId"
            size="middle"
            columns={columns}
            dataSource={filteredContacts}
            rowSelection={{
              selectedRowKeys: selectedKeys,
              preserveSelectedRowKeys: true,
              onChange: (keys: Key[]) => setSelectedKeys(keys),
              getCheckboxProps: (contact: IAppContactRow) => ({
                disabled:
                  !canManage ||
                  contact.status === AppsEnum.ContactStatus.LINKED,
              }),
            }}
            pagination={{ defaultPageSize: 20, showSizeChanger: true }}
            scroll={{ x: "max-content" }}
          />
        </Space>
      </Card>
    );
  };

  const renderBody = () => {
    if (isLoadingApps && !item) {
      return <Spin />;
    }

    if (!item?.enabled) {
      return <Empty description={t("apps.notEnabled")} />;
    }

    return (
      <Space direction="vertical" size="middle" className="w-full">
        {errorCode && (
          <Alert
            type="error"
            showIcon
            message={t(`apps.errors.${errorCode}`)}
          />
        )}

        {!canManage && (
          <Alert type="info" showIcon message={t("apps.google.managersOnly")} />
        )}

        <Card>
          {item.connected ? (
            <Space direction="vertical" size="middle">
              <Space>
                <Tag color="green">{t("apps.status.connected")}</Tag>

                {item.accountLabel && (
                  <span>
                    {t("apps.google.connectedAs").replace(
                      "{account}",
                      item.accountLabel,
                    )}
                  </span>
                )}
              </Space>

              <span>
                {t("apps.google.lastSync")}:{" "}
                {item.lastSyncAt
                  ? dayjs(item.lastSyncAt).format("DD/MM/YYYY HH:mm")
                  : t("apps.google.never")}
              </span>

              {summary && (
                <Alert
                  type={summary.failed > 0 ? "warning" : "success"}
                  showIcon
                  message={formatResult(summary)}
                  description={
                    summary.limitReached ? (
                      <div>{t("apps.google.limitReached")}</div>
                    ) : undefined
                  }
                />
              )}

              <Space>
                <Button
                  type="primary"
                  icon={<SyncOutlined />}
                  loading={busy === "sync"}
                  disabled={!canManage || busy !== null}
                  onClick={handleSync}
                >
                  {t("apps.google.sync")}
                </Button>

                <Popconfirm
                  title={t("apps.google.disconnectConfirm")}
                  onConfirm={handleDisconnect}
                  disabled={!canManage}
                >
                  <Button
                    type="primary"
                    danger
                    loading={busy === "disconnect"}
                    disabled={!canManage || busy !== null}
                  >
                    {t("apps.google.disconnect")}
                  </Button>
                </Popconfirm>
              </Space>
            </Space>
          ) : (
            <Space direction="vertical" size="middle">
              <span>
                {isExpired
                  ? t("apps.google.expiredHint")
                  : t("apps.google.intro")}
              </span>

              <Button
                type="primary"
                icon={<GoogleColorIcon />}
                loading={busy === "connect"}
                disabled={!canManage || busy !== null}
                onClick={handleConnect}
              >
                {isExpired
                  ? t("apps.google.reconnect")
                  : t("apps.google.signIn")}
              </Button>
            </Space>
          )}
        </Card>

        {item.connected && renderContacts()}
      </Space>
    );
  };

  return (
    <Layout title={t("apps.google.title")} hasBackButton>
      {renderBody()}
    </Layout>
  );
}
