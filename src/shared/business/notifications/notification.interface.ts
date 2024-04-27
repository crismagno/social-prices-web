import { ICreatedAtEntity } from "../interfaces/created-at.interface";
import { IUpdatedAtEntity } from "../interfaces/updated-at.interface";
import NotificationsEnum from "./notifications.enum";

export interface INotification extends ICreatedAtEntity, IUpdatedAtEntity {
  readonly _id: string;
  userId: string;
  content: any;
  title: string;
  subtitle: string | null;
  type: NotificationsEnum.Type;
  createdByUserId: string;
}
