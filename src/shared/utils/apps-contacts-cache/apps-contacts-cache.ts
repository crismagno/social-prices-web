import localforage from "localforage";

import AppsEnum from "../../business/apps/apps.enum";
import {
  IAppContactRow,
  IAppSyncPreview,
} from "../../business/apps/apps.types";

// How long the user must wait before asking the provider for the list again.
export const CONTACTS_SYNC_COOLDOWN_MS: number = 10 * 60 * 1000;

export interface ICachedContacts {
  preview: IAppSyncPreview;
  // When the list was fetched from the provider (epoch ms). Saving customers
  // changes the rows but never this, so the 10 minutes keep counting.
  fetchedAt: number;
}

// Milliseconds left until the list can be fetched again; 0 when it can.
// Capped at the cooldown so a clock set backwards cannot lock the button.
export const getCooldownRemainingMs = (
  fetchedAt: number | null,
  now: number,
  cooldownMs: number = CONTACTS_SYNC_COOLDOWN_MS,
): number => {
  if (fetchedAt === null) {
    return 0;
  }

  return Math.min(cooldownMs, Math.max(0, fetchedAt + cooldownMs - now));
};

export const formatCountdown = (remainingMs: number): string => {
  const totalSeconds: number = Math.ceil(remainingMs / 1000);

  const minutes: string = String(Math.floor(totalSeconds / 60)).padStart(
    2,
    "0",
  );

  const seconds: string = String(totalSeconds % 60).padStart(2, "0");

  return `${minutes}:${seconds}`;
};

// Created on first use: localforage needs the browser, and this file is also
// imported while Next prerenders pages on the server.
let store: LocalForage | null = null;

const getStore = (): LocalForage => {
  if (!store) {
    store = localforage.createInstance({
      name: "social-prices",
      storeName: "apps_contacts",
    });
  }

  return store;
};

// One entry per user and app: contacts are personal data, so another user of
// the same browser never reads them.
const keyFor = (userId: string, appId: AppsEnum.App): string =>
  `contacts:${userId}:${appId}`;

const isCachedContacts = (value: unknown): value is ICachedContacts => {
  const cached = value as ICachedContacts | null;

  return (
    typeof cached?.fetchedAt === "number" &&
    Array.isArray(cached?.preview?.contacts) &&
    cached.preview.contacts.every(
      (contact: IAppContactRow) => typeof contact?.externalId === "string",
    )
  );
};

// The cache is an optimization: when storage is unavailable (private mode,
// quota, blocked) every function degrades to "nothing cached", never throws.
export const readCachedContacts = async (
  userId: string,
  appId: AppsEnum.App,
): Promise<ICachedContacts | null> => {
  try {
    const value = await getStore().getItem<unknown>(keyFor(userId, appId));

    return isCachedContacts(value) ? value : null;
  } catch {
    return null;
  }
};

export const writeCachedContacts = async (
  userId: string,
  appId: AppsEnum.App,
  cached: ICachedContacts,
): Promise<void> => {
  try {
    await getStore().setItem(keyFor(userId, appId), cached);
  } catch {
    // not cached; the next visit just fetches again once the cooldown allows
  }
};

export const clearCachedContacts = async (
  userId: string,
  appId: AppsEnum.App,
): Promise<void> => {
  try {
    await getStore().removeItem(keyFor(userId, appId));
  } catch {
    // nothing to clear
  }
};

// For logout: the next person on this browser must not find anyone's contacts.
export const clearAllCachedContacts = async (): Promise<void> => {
  try {
    await getStore().clear();
  } catch {
    // nothing to clear
  }
};
