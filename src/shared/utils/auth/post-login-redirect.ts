// Where a visitor wanted to go before being sent to the login: after signing
// in they land there instead of on their home. Kept for this tab only, for a
// short while, and only for addresses of this app.

const KEY: string = "socialPrices.postLoginRedirect";
const VALID_MS: number = 15 * 60 * 1000;

const CUSTOMER_AREA: string = "/customer";

// A path inside this app: "/x", never "//host" or "/\host" (another site).
const isInAppPath = (path: string): boolean =>
  /^\/(?![/\\])/.test(path) && !path.includes("://");

const isCustomerArea = (path: string): boolean =>
  path === CUSTOMER_AREA ||
  path.startsWith(`${CUSTOMER_AREA}/`) ||
  path.startsWith(`${CUSTOMER_AREA}?`);

export const rememberPostLoginRedirect = (path: string): void => {
  try {
    if (!isInAppPath(path)) {
      return;
    }

    sessionStorage.setItem(KEY, JSON.stringify({ path, at: Date.now() }));
  } catch {
    // No storage (private mode): the visitor just lands on their home.
  }
};

// Reads and forgets it. Null when there is none, it is old, or it is not a page
// this kind of account opens: the customer area for a customer, the rest for a
// company.
export const takePostLoginRedirect = (isCustomer: boolean): string | null => {
  try {
    const raw: string | null = sessionStorage.getItem(KEY);

    sessionStorage.removeItem(KEY);

    if (!raw) {
      return null;
    }

    const saved: { path?: unknown; at?: unknown } = JSON.parse(raw);

    if (
      typeof saved.path !== "string" ||
      typeof saved.at !== "number" ||
      Date.now() - saved.at > VALID_MS ||
      !isInAppPath(saved.path) ||
      isCustomerArea(saved.path) !== isCustomer
    ) {
      return null;
    }

    return saved.path;
  } catch {
    return null;
  }
};
