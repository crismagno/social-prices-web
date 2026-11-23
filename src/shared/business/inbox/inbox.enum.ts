import AppsEnum from "../apps/apps.enum";

// Mirrors the API's inbox enums by hand.
namespace InboxEnum {
  export enum Channel {
    TELEGRAM = "TELEGRAM",
    MESSENGER = "MESSENGER",
    INSTAGRAM = "INSTAGRAM",
    WHATSAPP = "WHATSAPP",
    // The platform's own chat between a customer account and a store.
    STORE = "STORE",
    // A visitor of a store's site, without an account, through its chat window.
    SITE = "SITE",
  }

  export enum Direction {
    IN = "IN",
    OUT = "OUT",
  }

  export enum MessageKind {
    TEXT = "TEXT",
    IMAGE = "IMAGE",
    VIDEO = "VIDEO",
    AUDIO = "AUDIO",
    VOICE = "VOICE",
    FILE = "FILE",
    STICKER = "STICKER",
    LOCATION = "LOCATION",
    CONTACT = "CONTACT",
    SHARE = "SHARE",
    UNSUPPORTED = "UNSUPPORTED",
    OTHER = "OTHER",
  }

  // The app that owns each channel: its icon, its name, its page. The store
  // chat is the platform's own, so it has none.
  export const ChannelApp: Partial<Record<Channel, AppsEnum.App>> = {
    [Channel.TELEGRAM]: AppsEnum.App.TELEGRAM,
    [Channel.MESSENGER]: AppsEnum.App.FACEBOOK,
    [Channel.INSTAGRAM]: AppsEnum.App.INSTAGRAM,
    [Channel.WHATSAPP]: AppsEnum.App.WHATSAPP,
    [Channel.SITE]: AppsEnum.App.SITE,
  };
}

export default InboxEnum;
