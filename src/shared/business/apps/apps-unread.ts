import AppsEnum from "./apps.enum";
import { IAppCatalogItem } from "./apps.types";

/**
 * The unread count an app shows where the apps are listed. The site's chat
 * counts only in Chats: its app is about building the site, not a channel.
 */
export const unreadShownInApps = (app: IAppCatalogItem): number =>
  app.id === AppsEnum.App.SITE ? 0 : app.unreadCount;
