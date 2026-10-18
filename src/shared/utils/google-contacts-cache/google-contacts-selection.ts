import GoogleContactsEnum from "../../business/apps/google-contacts/google-contacts.enum";
import { IGoogleContactRow } from "../../business/apps/google-contacts/google-contacts.types";

// Keeps the selection inside what the customers limit still allows. Only NEW
// contacts become customers, so only they use up room; contacts that already
// match a customer are just linked and always fit.
//
// `remaining` is how many new customers can still be created. Earlier choices
// win over later ones, so ticking more never un-ticks what was already picked.
export const capSelectionToCapacity = (
  previous: string[],
  next: string[],
  contacts: IGoogleContactRow[],
  remaining: number,
): string[] => {
  const statusByKey = new Map<string, GoogleContactsEnum.ContactStatus>(
    contacts.map((contact: IGoogleContactRow) => [
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
    if (statusByKey.get(key) !== GoogleContactsEnum.ContactStatus.NEW) {
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
  contacts: IGoogleContactRow[],
): number => {
  const newKeys: Set<string> = new Set(
    contacts
      .filter(
        (contact: IGoogleContactRow) =>
          contact.status === GoogleContactsEnum.ContactStatus.NEW,
      )
      .map((contact: IGoogleContactRow) => contact.externalId),
  );

  return selected.filter((key: string) => newKeys.has(key)).length;
};
