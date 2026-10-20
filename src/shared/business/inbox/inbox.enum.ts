import AppsEnum from "../apps/apps.enum";

// Mirrors the API's inbox enums by hand.
namespace InboxEnum {
  export enum Channel {
    TELEGRAM = "TELEGRAM",
    MESSENGER = "MESSENGER",
    INSTAGRAM = "INSTAGRAM",
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

  // The app that owns each channel: its icon, its name, its page.
  export const ChannelApp: Record<Channel, AppsEnum.App> = {
    [Channel.TELEGRAM]: AppsEnum.App.TELEGRAM,
    [Channel.MESSENGER]: AppsEnum.App.FACEBOOK,
    [Channel.INSTAGRAM]: AppsEnum.App.INSTAGRAM,
  };
}

export default InboxEnum;
