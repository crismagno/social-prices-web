import { IPublicStoreSite } from "../../../shared/business/store-sites/store-sites.types";
import StoreSitesServiceEnum from "./store-sites-service.enum";

/**
 * The published site of a store, read on the server (no token, no axios).
 * Answers null when there is nothing online at that address.
 */
export const fetchPublicStoreSite = async (
  slug: string,
): Promise<IPublicStoreSite | null> => {
  // Inside Docker the server reaches the API by another host than the browser.
  const apiUrl: string = `${
    process.env.SOCIAL_PRICES_API_URL_V1_SERVER ??
    process.env.NEXT_PUBLIC_SOCIAL_PRICES_API_URL_V1
  }`;

  const path: string =
    StoreSitesServiceEnum.Methods.PUBLIC_FIND_BY_SLUG.replace(
      ":slug",
      encodeURIComponent(slug),
    );

  const response: Response = await fetch(`${apiUrl}${path}`, {
    // Always fresh: the owner expects what was just saved or unpublished to
    // show (or stop showing) right away.
    cache: "no-store",
  });

  // Only "nothing at this address" is a 404 for the visitor. An API that is
  // down or misconfigured must fail loudly, not look like a missing site.
  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Could not load the site "${slug}" (${response.status}).`);
  }

  return (await response.json()) as IPublicStoreSite;
};
