namespace NotificationsEnum {
  export enum Type {
    INFO = "INFO",
    WARNING = "WARNING",
    NEWS = "NEWS",
    DEFAULT = "DEFAULT",
  }

  export const TypeLabels = {
    [Type.INFO]: "Info",
    [Type.WARNING]: "Warning",
    [Type.NEWS]: "News",
    [Type.DEFAULT]: "Default",
  };

  export const TypeColors = {
    [Type.INFO]: "blue",
    [Type.WARNING]: "warning",
    [Type.NEWS]: "success",
    [Type.DEFAULT]: "default",
  };
}

export default NotificationsEnum;
