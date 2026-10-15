import AppsEnum from "./apps.enum";

export interface IAppContactRow {
  externalId: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: AppsEnum.ContactStatus;
}

export interface IAppSyncPreview {
  contacts: IAppContactRow[];
  hasMore: boolean;
}

export interface IAppImportResult {
  created: number;
  linked: number;
  skipped: number;
  failed: number;
  limitReached: boolean;
  finishedAt: string;
}

export interface IAppCatalogItem {
  id: AppsEnum.App;
  enabled: boolean;
  integrated: boolean;
  connected: boolean;
  status: AppsEnum.ConnectionStatus | null;
  accountLabel: string | null;
  lastSyncAt: string | null;
  lastSyncSummary: IAppImportResult | null;
}
