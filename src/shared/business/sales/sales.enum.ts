import moment from "moment";

namespace SalesEnum {
  export enum Type {
    MANUAL = "MANUAL",
    SHOPPING = "SHOPPING",
  }

  export const TypeLabels = {
    [Type.MANUAL]: "sales.typeManual",
    [Type.SHOPPING]: "sales.typeShopping",
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
    [DeliveryType.PICKUP]: "sales.deliveryPickup",
    [DeliveryType.DELIVERY]: "sales.deliveryDelivery",
  };

  export enum PaymentType {
    PIX = "PIX",
    CASH = "CASH",
    CARD = "CARD",
    OTHER = "OTHER",
  }

  export const PaymentTypeLabels = {
    [PaymentType.PIX]: "sales.paymentPix",
    [PaymentType.CASH]: "sales.paymentCash",
    [PaymentType.CARD]: "sales.paymentCard",
    [PaymentType.OTHER]: "sales.paymentOther",
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
    [PaymentStatus.COMPLETED]: "sales.paymentCompleted",
    [PaymentStatus.PENDING]: "sales.paymentPending",
    [PaymentStatus.PARTIALLY]: "sales.paymentPartially",
    [PaymentStatus.CANCELLED]: "sales.paymentCancelled",
    [PaymentStatus.REFUNDED]: "sales.paymentRefunded",
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
    DELIVERY = "DELIVERY",
  }

  export const StatusLabels = {
    [Status.STARTED]: "sales.statusStarted",
    [Status.CANCELLED]: "sales.statusCancelled",
    [Status.STOPPED]: "sales.statusStopped",
    [Status.ERROR]: "sales.statusError",
    [Status.COMPLETED]: "sales.statusCompleted",
    [Status.PROCESSING]: "sales.statusProcessing",
    [Status.PENDING]: "sales.statusPending",
    [Status.REFUNDED]: "sales.statusRefunded",
    [Status.DELIVERY]: "sales.statusDelivery",
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
    [Status.DELIVERY]: "purple",
  };

  export const getDeliveryAtColor = (deliveryAt: Date | null): string => {
    if (!deliveryAt) {
      return "gray";
    }

    const differenceDays: number = getDeliveryAtDifferenceDays(deliveryAt);

    if (differenceDays < 1) {
      return "red";
    }

    if (differenceDays === 1) {
      return "orange";
    }

    if (differenceDays >= 2 && differenceDays <= 4) {
      return "blue";
    }

    if (differenceDays > 4) {
      return "green";
    }

    return "gray";
  };

  export const getDeliveryAtDifferenceDays = (
    deliveryAt: Date | null,
  ): number => {
    if (!deliveryAt) {
      return 0;
    }

    const todayStartDay: Date = moment().startOf("day").toDate();

    return moment(deliveryAt).diff(todayStartDay, "days");
  };

  export const StatusToShowDeliveryAt = [
    Status.PENDING,
    Status.PROCESSING,
    Status.STARTED,
    Status.STOPPED,
  ];

  export enum SortField {
    deliveryAt = "deliveryAt",
    createdAt = "createdAt",
    createdDate = "createdDate",
    completedAt = "completedAt",
    updatedAt = "updatedAt",
  }

  export const SortFieldLabels = {
    [SortField.deliveryAt]: "sales.deliveryAt",
    [SortField.createdAt]: "sales.createdAt",
    [SortField.createdDate]: "sales.createdDate",
    [SortField.completedAt]: "sales.completedAt",
    [SortField.updatedAt]: "sales.updatedAt",
  };

  export const StatusToFilterCharts: Status[] = [
    Status.STARTED,
    Status.PROCESSING,
    Status.COMPLETED,
    Status.STOPPED,
    Status.DELIVERY,
  ];

  export const StatusRed: Status[] = [Status.ERROR, Status.STOPPED];

  export const SelectOptionsRangeDatePicker = (t: (key: string) => string) =>
    Object.values(SortField).map((value) => ({
      label: t(SalesEnum.SortFieldLabels[value]),
      value,
    }));
}

export default SalesEnum;
