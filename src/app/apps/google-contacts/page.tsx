"use client";

import { Key, useEffect, useMemo, useState } from "react";

import {
  Alert,
  App,
  Button,
  Card,
  Empty,
  Input,
  Space,
  Spin,
  Table,
  Tag,
  Tooltip,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useRouter, useSearchParams } from "next/navigation";

import { EnterOutlined, LinkOutlined, SaveOutlined } from "@ant-design/icons";

import { FeatureUsageBadge } from "../../../components/common/FeatureUsageBadge/FeatureUsageBadge";
import { useFeaturesUsage } from "../../../components/common/FeatureUsageBadge/useFeaturesUsage";
import handleClientError from "../../../components/common/HandleClientError/HandleClientError";
import Layout from "../../../components/template/Layout/Layout";
import useAppData from "../../../data/context/app/useAppData";
import useAuthData from "../../../data/context/auth/useAuthData";
import useLanguageData from "../../../data/context/language/useLanguageData";
import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import AppsEnum from "../../../shared/business/apps/apps.enum";
import { IAppCatalogItem } from "../../../shared/business/apps/apps.types";
import GoogleContactsEnum from "../../../shared/business/apps/google-contacts/google-contacts.enum";
import {
  IGoogleContactRow,
  IGoogleContactsImportResult,
  IGoogleContactsPreview,
} from "../../../shared/business/apps/google-contacts/google-contacts.types";
import { ICustomer } from "../../../shared/business/customers/customer.interface";
import EmployeesEnum from "../../../shared/business/employees/employees.enum";
import Urls from "../../../shared/common/routes-app/routes-app";
import {
  capSelectionToCapacity,
  countNewSelected,
} from "../../../shared/utils/google-contacts-cache/google-contacts-selection";
import {
  clearCachedContacts,
  getCooldownRemainingMs,
  readCachedContacts,
  writeCachedContacts,
} from "../../../shared/utils/google-contacts-cache/google-contacts-cache";
import LinkCustomerModal from "../telegram/LinkCustomerModal";
import GoogleContactsConnectCard from "./GoogleContactsConnectCard";
import GoogleContactsConnectedCard from "./GoogleContactsConnectedCard";
import { useGoogleContactsConnection } from "./useGoogleContactsConnection";

type Busy = "connect" | "sync" | "save" | "disconnect" | null;

const APP_ID: AppsEnum.App = AppsEnum.App.GOOGLE_CONTACTS;

export default function GoogleContactsAppPage() {
  const { t } = useLanguageData();

  const { message } = App.useApp();

  const router = useRouter();

  const { employee, user } = useAuthData();

  const {
    apps: { catalog, isLoadingApps, fetchApps },
  } = useAppData();

  const searchParams = useSearchParams();

  const errorCode: string | null = searchParams.get("error");

  // A link from a customer shows only that contact, until "show all" is pressed.
  const requestedContactId: string | null = searchParams.get("contact");

  const [isShowingAll, setIsShowingAll] = useState<boolean>(false);

  const focusedContactId: string | null = isShowingAll
    ? null
    : requestedContactId;

  const [busy, setBusy] = useState<Busy>(null);

  // The contact the user is picking a customer for.
  const [linkingContact, setLinkingContact] =
    useState<IGoogleContactRow | null>(null);

  const [preview, setPreview] = useState<IGoogleContactsPreview | null>(null);

  const [selectedKeys, setSelectedKeys] = useState<Key[]>([]);

  const { usage, refetch: refetchUsage } = useFeaturesUsage();

  const [search, setSearch] = useState<string>("");

  const [lastResult, setLastResult] =
    useState<IGoogleContactsImportResult | null>(null);

  // When the list came from the provider; the same list is reused from the
  // browser until 20 minutes pass.
  const [fetchedAt, setFetchedAt] = useState<number | null>(null);

  const [now, setNow] = useState<number>(() => Date.now());

  const userId: string | undefined = user?._id;

  const cooldownRemainingMs: number = getCooldownRemainingMs(fetchedAt, now);

  // Show the saved list right away instead of asking the provider again.
  useEffect(() => {
    if (!userId) {
      return;
    }

    let isCancelled: boolean = false;

    readCachedContacts(userId, APP_ID).then((cached) => {
      if (cached && !isCancelled) {
        setPreview(cached.preview);
        setFetchedAt(cached.fetchedAt);
        setNow(Date.now());
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [userId]);

  // Ticks only while the button is locked, to count down and then release it.
  useEffect(() => {
    if (
      fetchedAt === null ||
      getCooldownRemainingMs(fetchedAt, Date.now()) === 0
    ) {
      return;
    }

    const interval = setInterval(() => {
      const current: number = Date.now();

      setNow(current);

      if (getCooldownRemainingMs(fetchedAt, current) === 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [fetchedAt]);

  const item: IAppCatalogItem | undefined = catalog.find(
    (app: IAppCatalogItem) => app.id === APP_ID,
  );

  const { connection, isLoadingConnection, refetchConnection } =
    useGoogleContactsConnection(!!item?.enabled);

  // The API enforces this too; the buttons are disabled so nobody hits a 403.
  const canManage: boolean = employee?.level !== EmployeesEnum.Level.EMPLOYEE;

  const isExpired: boolean =
    connection?.status === AppsEnum.ConnectionStatus.EXPIRED;

  const summary: IGoogleContactsImportResult | null =
    lastResult ?? connection?.lastImport ?? null;

  const filteredContacts: IGoogleContactRow[] = useMemo(() => {
    const term: string = search.trim().toLowerCase();

    const contacts: IGoogleContactRow[] = (preview?.contacts ?? []).filter(
      (contact: IGoogleContactRow) =>
        !focusedContactId || contact.externalId === focusedContactId,
    );

    if (!term) {
      return contacts;
    }

    return contacts.filter((contact: IGoogleContactRow) =>
      [contact.name, contact.email, contact.phone].some((value) =>
        value?.toLowerCase().includes(term),
      ),
    );
  }, [preview, search, focusedContactId]);

  // How many new customers the plan still allows (null: unlimited or unknown;
  // the API checks it again on save either way). Linking never uses any.
  const customersUsage = usage?.customers;

  const remaining: number | null =
    customersUsage && customersUsage.limit !== null
      ? Math.max(0, customersUsage.limit - customersUsage.used)
      : null;

  const allContacts: IGoogleContactRow[] = preview?.contacts ?? [];

  const newSelectedCount: number = countNewSelected(
    selectedKeys.map(String),
    allContacts,
  );

  const hasNewContacts: boolean = allContacts.some(
    (contact: IGoogleContactRow) =>
      contact.status === GoogleContactsEnum.ContactStatus.NEW,
  );

  const exceedsLimit: boolean =
    remaining !== null && newSelectedCount > remaining;

  // Every way of selecting goes through here, so the limit cannot be passed.
  const applySelection = (next: Key[]): void => {
    const capped: string[] = capSelectionToCapacity(
      selectedKeys.map(String),
      next.map(String),
      allContacts,
      remaining ?? Infinity,
    );

    if (capped.length < next.length) {
      message.info(
        t("apps.google.limit.capped").replace("{count}", String(remaining)),
      );
    }

    setSelectedKeys(capped);
  };

  const formatResult = (result: IGoogleContactsImportResult): string =>
    t("apps.google.importResult")
      .replace("{created}", String(result.created))
      .replace("{linked}", String(result.linked))
      .replace("{skipped}", String(result.skipped))
      .replace("{failed}", String(result.failed));

  const loadContacts = async (): Promise<void> => {
    const response =
      await serviceMethodsInstance.googleContactsServiceMethods.listContacts();

    const fetchedNow: number = Date.now();

    setPreview(response);
    setFetchedAt(fetchedNow);
    setNow(fetchedNow);

    if (userId) {
      await writeCachedContacts(userId, APP_ID, {
        preview: response,
        fetchedAt: fetchedNow,
      });
    }
  };

  const handleConnect = async (): Promise<void> => {
    try {
      setBusy("connect");

      const { url } =
        await serviceMethodsInstance.googleContactsServiceMethods.connect();

      window.location.href = url;
    } catch (error: any) {
      handleClientError(error);
      setBusy(null);
    }
  };

  const handleSync = async (): Promise<void> => {
    if (cooldownRemainingMs > 0) {
      return;
    }

    try {
      setBusy("sync");

      setSelectedKeys([]);

      await loadContacts();
    } catch (error: any) {
      handleClientError(error);
    } finally {
      // Also refreshes the status after an APP_CONNECTION_EXPIRED answer.
      await Promise.all([fetchApps(), refetchConnection()]);
      setBusy(null);
    }
  };

  // Contacts that now belong to a customer: the list shown and the cached one
  // change in place, so nothing has to be asked of Google again.
  const markLinked = async (
    links: { externalId: string; customerId: string | null }[],
  ): Promise<void> => {
    if (!preview) {
      return;
    }

    const byContact = new Map<string, string | null>(
      links.map((link) => [link.externalId, link.customerId]),
    );

    const updated: IGoogleContactsPreview = {
      ...preview,
      contacts: preview.contacts.map((contact: IGoogleContactRow) =>
        byContact.has(contact.externalId)
          ? {
              ...contact,
              status: GoogleContactsEnum.ContactStatus.LINKED,
              customerId: byContact.get(contact.externalId) ?? null,
            }
          : contact,
      ),
    };

    setPreview(updated);

    if (userId && fetchedAt !== null) {
      await writeCachedContacts(userId, APP_ID, {
        preview: updated,
        fetchedAt,
      });
    }
  };

  // Goes to the customer of a linked contact. A list cached before customers were
  // known is asked once.
  const openCustomer = async (contact: IGoogleContactRow): Promise<void> => {
    try {
      const customerId: string | null =
        contact.customerId ??
        (
          await serviceMethodsInstance.googleContactsServiceMethods.findCustomer(
            contact.externalId,
          )
        ).customerId;

      if (!customerId) {
        message.warning(t("apps.google.grid.customerNotFound"));

        return;
      }

      router.push(Urls.CUSTOMER.replace(":customerId", customerId));
    } catch (error: any) {
      handleClientError(error);
    }
  };

  const handlePickCustomer = async (customer: ICustomer): Promise<void> => {
    const contact: IGoogleContactRow | null = linkingContact;

    setLinkingContact(null);

    if (!contact) {
      return;
    }

    try {
      setBusy("save");

      await serviceMethodsInstance.googleContactsServiceMethods.linkContact(
        contact.externalId,
        customer._id,
      );

      setSelectedKeys((keys: Key[]) =>
        keys.filter((key: Key) => key !== contact.externalId),
      );

      await markLinked([
        { externalId: contact.externalId, customerId: customer._id },
      ]);

      message.success(
        t("apps.google.grid.linkedTo").replace("{name}", customer.name ?? ""),
      );
    } catch (error: any) {
      // The server's words say what is wrong (the customer has a contact already...).
      handleClientError(error);
    } finally {
      setBusy(null);
    }
  };

  const handleSave = async (): Promise<void> => {
    try {
      setBusy("save");

      const result =
        await serviceMethodsInstance.googleContactsServiceMethods.importContacts(
          selectedKeys.map(String),
        );

      setLastResult(result);

      setSelectedKeys([]);

      message.success(`${t("apps.google.grid.saved")} ${formatResult(result)}`);

      // What was just saved is now linked. The cached list is updated in place:
      // asking Google again is not allowed until the 20 minutes pass.
      await markLinked(
        result.savedLinks ??
          result.savedExternalIds.map((externalId: string) => ({
            externalId,
            customerId: null,
          })),
      );

      await Promise.all([fetchApps(), refetchConnection()]);
    } catch (error: any) {
      handleClientError(error);
    } finally {
      await refetchUsage();
      setBusy(null);
    }
  };

  const handleDisconnect = async (): Promise<void> => {
    try {
      setBusy("disconnect");

      await serviceMethodsInstance.googleContactsServiceMethods.disconnect();

      setLastResult(null);

      setPreview(null);

      setFetchedAt(null);

      setSelectedKeys([]);

      if (userId) {
        await clearCachedContacts(userId, APP_ID);
      }

      message.success(t("apps.google.disconnected"));

      await Promise.all([fetchApps(), refetchConnection()]);
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setBusy(null);
    }
  };

  const columns: ColumnsType<IGoogleContactRow> = [
    {
      title: t("apps.google.grid.name"),
      dataIndex: "name",
      sorter: (a: IGoogleContactRow, b: IGoogleContactRow) =>
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
      render: (status: GoogleContactsEnum.ContactStatus) => {
        if (status === GoogleContactsEnum.ContactStatus.NEW) {
          return <Tag color="green">{t("apps.google.grid.new")}</Tag>;
        }

        if (status === GoogleContactsEnum.ContactStatus.EXISTING) {
          return <Tag color="blue">{t("apps.google.grid.existing")}</Tag>;
        }

        return <Tag>{t("apps.google.grid.linked")}</Tag>;
      },
    },
    {
      key: "actions",
      width: 90,
      render: (_: unknown, contact: IGoogleContactRow) =>
        contact.status === GoogleContactsEnum.ContactStatus.LINKED ? (
          <Tooltip title={t("apps.google.grid.goToCustomer")}>
            <Button
              icon={<EnterOutlined />}
              onClick={() => openCustomer(contact)}
              aria-label={t("apps.google.grid.goToCustomer")}
            />
          </Tooltip>
        ) : (
          <Tooltip title={t("apps.google.grid.linkToCustomer")}>
            <Button
              icon={<LinkOutlined />}
              disabled={!canManage || busy !== null}
              onClick={() => setLinkingContact(contact)}
              aria-label={t("apps.google.grid.linkToCustomer")}
            />
          </Tooltip>
        ),
    },
  ];

  const renderContacts = () => {
    if (!preview) {
      return null;
    }

    const countByStatus = (status: GoogleContactsEnum.ContactStatus): number =>
      preview.contacts.filter(
        (contact: IGoogleContactRow) => contact.status === status,
      ).length;

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
          <Space wrap size={[8, 8]}>
            {(
              [
                ["total", "default", preview.contacts.length],
                [
                  "new",
                  "green",
                  countByStatus(GoogleContactsEnum.ContactStatus.NEW),
                ],
                [
                  "existing",
                  "blue",
                  countByStatus(GoogleContactsEnum.ContactStatus.EXISTING),
                ],
                [
                  "linked",
                  "default",
                  countByStatus(GoogleContactsEnum.ContactStatus.LINKED),
                ],
              ] as const
            ).map(([key, color, count]) => (
              <Tag key={key} color={color} className="m-0">
                {t(`apps.google.counts.${key}`).replace(
                  "{count}",
                  String(count),
                )}
              </Tag>
            ))}
          </Space>

          <span>{t("apps.google.listHint")}</span>

          {focusedContactId && (
            <Alert
              type={filteredContacts.length ? "info" : "warning"}
              showIcon
              message={t(
                filteredContacts.length
                  ? "apps.google.focus.showing"
                  : "apps.google.focus.notFound",
              )}
              action={
                <Button size="small" onClick={() => setIsShowingAll(true)}>
                  {t("apps.google.focus.showAll")}
                </Button>
              }
            />
          )}

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

          <div className="flex flex-wrap items-center justify-end gap-2">
            <FeatureUsageBadge feature="customers" usage={customersUsage} />

            {remaining !== null && remaining > 0 && (
              <span>
                {t("apps.google.limit.remaining").replace(
                  "{count}",
                  String(remaining),
                )}
              </span>
            )}
          </div>

          {remaining === 0 && hasNewContacts && (
            <Alert
              type="warning"
              showIcon
              message={t("apps.google.limit.reached")}
            />
          )}

          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={busy === "save"}
              disabled={
                !canManage ||
                busy !== null ||
                selectedKeys.length === 0 ||
                exceedsLimit
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
                applySelection(
                  filteredContacts
                    .filter(
                      (contact: IGoogleContactRow) =>
                        contact.status !==
                        GoogleContactsEnum.ContactStatus.LINKED,
                    )
                    .map((contact: IGoogleContactRow) => contact.externalId),
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

          <Table<IGoogleContactRow>
            rowKey="externalId"
            columns={columns}
            dataSource={filteredContacts}
            rowSelection={{
              selectedRowKeys: selectedKeys,
              preserveSelectedRowKeys: true,
              onChange: (keys: Key[]) => applySelection(keys),
              getCheckboxProps: (contact: IGoogleContactRow) => ({
                disabled:
                  !canManage ||
                  contact.status === GoogleContactsEnum.ContactStatus.LINKED ||
                  // no room left for another new customer
                  (contact.status === GoogleContactsEnum.ContactStatus.NEW &&
                    remaining !== null &&
                    newSelectedCount >= remaining &&
                    !selectedKeys.includes(contact.externalId)),
              }),
            }}
            pagination={{
              defaultPageSize: 20,
              showSizeChanger: true,
              showTotal: (total: number, range: [number, number]) =>
                t("apps.google.grid.range")
                  .replace("{from}", String(range[0]))
                  .replace("{to}", String(range[1]))
                  .replace("{total}", String(total)),
            }}
            scroll={{ x: "max-content" }}
          />
        </Space>
      </Card>
    );
  };

  const renderBody = () => {
    if ((isLoadingApps && !item) || (isLoadingConnection && !connection)) {
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

        {connection?.connected ? (
          <GoogleContactsConnectedCard
            connection={connection}
            summary={summary}
            fetchedAt={fetchedAt}
            cooldownRemainingMs={cooldownRemainingMs}
            canManage={canManage}
            isSyncing={busy === "sync"}
            isDisconnecting={busy === "disconnect"}
            isBusy={busy !== null}
            onSync={handleSync}
            onDisconnect={handleDisconnect}
          />
        ) : (
          <GoogleContactsConnectCard
            isExpired={isExpired}
            canManage={canManage}
            isConnecting={busy === "connect"}
            isBusy={busy !== null}
            onConnect={handleConnect}
          />
        )}

        {connection?.connected && renderContacts()}
      </Space>
    );
  };

  return (
    <Layout title={t("apps.google.title")} hasBackButton>
      <div className="mt-4">{renderBody()}</div>

      <LinkCustomerModal
        open={!!linkingContact}
        onClose={() => setLinkingContact(null)}
        onPick={handlePickCustomer}
      />
    </Layout>
  );
}
