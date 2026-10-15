import AppsEnum from "../../business/apps/apps.enum";
import { IAppContactRow } from "../../business/apps/apps.types";

// Keeps the selection inside what the customers limit still allows. Only NEW
// contacts become customers, so only they use up room; contacts that already
// match a customer are just linked and always fit.
//
// `remaining` is how many new customers can still be created. Earlier choices
// win over later ones, so ticking more never un-ticks what was already picked.
export const capSelectionToCapacity = (
  previous: string[],
  next: string[],
  contacts: IAppContactRow[],
  remaining: number,
): string[] => {
  const statusByKey = new Map<string, AppsEnum.ContactStatus>(
    contacts.map((contact: IAppContactRow) => [
      contact.externalId,
      contact.status,
    ]),
  );

  const wasSelected: Set<string> = new Set(previous);

  const ordered: string[] = [
    ...next.filter((key: string) => wasSelected.has(key)),
    ...next.filter((key: string) => !wasSelected.has(key)),
  ];

  let room: number = Math.max(0, remaining);

  return ordered.filter((key: string) => {
    if (statusByKey.get(key) !== AppsEnum.ContactStatus.NEW) {
      return true;
    }

    if (room > 0) {
      room--;
      return true;
    }

    return false;
  });
};

export const countNewSelected = (
  selected: string[],
  contacts: IAppContactRow[],
): number => {
  const newKeys: Set<string> = new Set(
    contacts
      .filter(
        (contact: IAppContactRow) =>
          contact.status === AppsEnum.ContactStatus.NEW,
      )
      .map((contact: IAppContactRow) => contact.externalId),
  );

  return selected.filter((key: string) => newKeys.has(key)).length;
};
