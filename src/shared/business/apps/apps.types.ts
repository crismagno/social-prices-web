import AppsEnum from "./apps.enum";

// One card of the apps catalog: the same few facts for every app. What an app
// knows beyond this comes from that app's own endpoints.
export interface IAppCatalogItem {
  id: AppsEnum.App;
  enabled: boolean;
  integrated: boolean;
  connected: boolean;
  status: AppsEnum.ConnectionStatus | null;
  accountLabel: string | null;
}
