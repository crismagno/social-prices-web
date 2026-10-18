import AppsEnum from "../apps.enum";
import GoogleContactsEnum from "./google-contacts.enum";

// What saving contacts answers, and what is remembered of the last time.
export interface IGoogleContactsImportResult {
  created: number;
  linked: number;
  skipped: number;
  failed: number;
  limitReached: boolean;
  finishedAt: string;
}

// The details Google Contacts' own page shows about the connection.
export interface IGoogleContactsConnection {
  connected: boolean;
  status: AppsEnum.ConnectionStatus | null;
  googleEmail: string | null;
  connectedAt: string | null;
  lastImportAt: string | null;
  lastImport: IGoogleContactsImportResult | null;
}

export interface IGoogleContactRow {
  externalId: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: GoogleContactsEnum.ContactStatus;
}

export interface IGoogleContactsPreview {
  contacts: IGoogleContactRow[];
  hasMore: boolean;
}

// What saving answers: the summary plus which contacts were saved (created or
// linked), so a cached list can be updated without asking Google again.
export interface IGoogleContactsImportResponse extends IGoogleContactsImportResult {
  savedExternalIds: string[];
}
