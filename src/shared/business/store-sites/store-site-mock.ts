import { ISaveStoreSite } from "./store-site.interface";
import StoreSitesEnum from "./store-sites.enum";

/** The name of a saved mock of the site. Mirrors the API. */
export const MOCK_NAME_MAX = 60;

/**
 * A copy of a site the owner keeps aside, to open again in the editor and go
 * on changing without touching the site that is online.
 * Mirrors the API (store-site-mock.schema.ts): change both together.
 */
export interface IStoreSiteMock {
  _id: string;
  storeId: string;
  name: string;
  templateId: StoreSitesEnum.Template;
  /** Only when one mock is asked for: the list leaves it out. */
  content?: Partial<ISaveStoreSite>;
  createdAt: string;
  updatedAt: string;
}

/** The mocks of a store's site, and how many the account may keep. */
export interface IStoreSiteMocksList {
  mocks: IStoreSiteMock[];
  /** Null: as many as the owner wants. */
  limit: number | null;
  used: number;
}
