namespace NotificationsEnum {
  export enum Type {
    INFO = "INFO",
    WARNING = "WARNING",
    NEWS = "NEWS",
    DEFAULT = "DEFAULT",
  }

  export const TypeLabels = {
    [Type.INFO]: "common.info",
    [Type.WARNING]: "common.warning",
    [Type.NEWS]: "common.news",
    [Type.DEFAULT]: "common.default",
  };

  export const TypeColors = {
    [Type.INFO]: "blue",
    [Type.WARNING]: "warning",
    [Type.NEWS]: "success",
    [Type.DEFAULT]: "default",
  };
}

export default NotificationsEnum;
