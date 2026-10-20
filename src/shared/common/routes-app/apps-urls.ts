import AppsEnum from "../../business/apps/apps.enum";
import Urls from "./routes-app";

// Only apps with an integration page are listed here; the rest are "coming soon".
export const APP_URLS: Partial<Record<AppsEnum.App, string>> = {
  [AppsEnum.App.GOOGLE_CONTACTS]: Urls.APPS_GOOGLE_CONTACTS,
  [AppsEnum.App.TELEGRAM]: Urls.APPS_TELEGRAM,
  [AppsEnum.App.FACEBOOK]: Urls.APPS_MESSENGER,
  [AppsEnum.App.INSTAGRAM]: Urls.APPS_INSTAGRAM,
};
