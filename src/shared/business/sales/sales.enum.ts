namespace SalesEnum {
  export enum Type {
    MANUAL = "MANUAL",
    SHOPPING = "SHOPPING",
  }

  export const TypeLabels = {
    [Type.MANUAL]: "Manual",
    [Type.SHOPPING]: "Shopping",
  };

  export const TypeColors = {
    [Type.MANUAL]: "blue",
    [Type.SHOPPING]: "orange",
  };

  export enum DeliveryType {
    PICKUP = "PICKUP",
    DELIVERY = "DELIVERY",
  }

  export const DeliveryTypeLabels = {
    [DeliveryType.PICKUP]: "Pickup",
    [DeliveryType.DELIVERY]: "Delivery",
  };

  export enum PaymentType {
    PIX = "PIX",
    CASH = "CASH",
    CARD = "CARD",
    OTHER = "OTHER",
  }

  export const PaymentTypeLabels = {
    [PaymentType.PIX]: "PIX",
    [PaymentType.CASH]: "Cash",
    [PaymentType.CARD]: "Card",
    [PaymentType.OTHER]: "Other",
  };

  export const PaymentTypeColors = {
    [PaymentType.PIX]: "blue",
    [PaymentType.CASH]: "green",
    [PaymentType.CARD]: "orange",
    [PaymentType.OTHER]: "default",
  };

  export enum PaymentStatus {
    COMPLETED = "COMPLETED",
    PENDING = "PENDING",
    PARTIALLY = "PARTIALLY",
    CANCELLED = "CANCELLED",
    REFUNDED = "REFUNDED",
  }

  export const PaymentStatusLabels = {
    [PaymentStatus.COMPLETED]: "Completed",
    [PaymentStatus.PENDING]: "Pending",
    [PaymentStatus.PARTIALLY]: "Partially",
    [PaymentStatus.CANCELLED]: "Cancelled",
    [PaymentStatus.REFUNDED]: "Refunded",
  };

  export const PaymentStatusColors = {
    [PaymentStatus.COMPLETED]: "green",
    [PaymentStatus.PENDING]: "blue",
    [PaymentStatus.PARTIALLY]: "purple",
    [PaymentStatus.CANCELLED]: "red",
    [PaymentStatus.REFUNDED]: "orange",
  };

  export enum Status {
    STARTED = "STARTED",
    CANCELLED = "CANCELLED",
    STOPPED = "STOPPED",
    ERROR = "ERROR",
    COMPLETED = "COMPLETED",
    PROCESSING = "PROCESSING",
    PENDING = "PENDING",
    REFUNDED = "REFUNDED",
  }

  export const StatusLabels = {
    [Status.STARTED]: "Started",
    [Status.CANCELLED]: "Cancelled",
    [Status.STOPPED]: "Stopped",
    [Status.ERROR]: "Error",
    [Status.COMPLETED]: "Completed",
    [Status.PROCESSING]: "Processing",
    [Status.PENDING]: "Pending",
    [Status.REFUNDED]: "Refunded",
  };

  export const StatusColors = {
    [Status.STARTED]: "blue",
    [Status.CANCELLED]: "gray",
    [Status.STOPPED]: "red",
    [Status.ERROR]: "red",
    [Status.COMPLETED]: "green",
    [Status.PROCESSING]: "blue",
    [Status.PENDING]: "blue",
    [Status.REFUNDED]: "orange",
  };
}

export default SalesEnum;
