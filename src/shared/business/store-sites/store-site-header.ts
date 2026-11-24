/** How the top of the site behaves. */
export interface IStoreSiteHeader {
  /** The menu stays at the top of the screen while the visitor scrolls. */
  isFixed: boolean;
}

/** The header of a site, also for one saved before the option: in its place. */
export const siteHeaderOf = (
  header: Partial<IStoreSiteHeader> | null | undefined,
): IStoreSiteHeader => ({ isFixed: header?.isFixed === true });
