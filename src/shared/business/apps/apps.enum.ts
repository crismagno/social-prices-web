namespace AppsEnum {
  export enum App {
    GOOGLE_CONTACTS = "GOOGLE_CONTACTS",
    INSTAGRAM = "INSTAGRAM",
    FACEBOOK = "FACEBOOK",
    WHATSAPP = "WHATSAPP",
    TELEGRAM = "TELEGRAM",
  }

  export enum ContactStatus {
    NEW = "NEW",
    EXISTING = "EXISTING",
    LINKED = "LINKED",
  }

  export enum ConnectionStatus {
    CONNECTED = "CONNECTED",
    EXPIRED = "EXPIRED",
    REVOKED = "REVOKED",
  }
}

export default AppsEnum;
