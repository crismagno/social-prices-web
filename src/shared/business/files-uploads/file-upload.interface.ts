import { ICreatedAtEntity } from "../shared/global/created-at.interface";
import { IUpdatedAtEntity } from "../shared/global/updated-at.interface";
import FilesUploadsEnum from "./files-uploads.enum";

export interface IFileUpload extends ICreatedAtEntity, IUpdatedAtEntity {
  readonly _id: string;
  userId: string;
  employeeId: string;
  filename: string;
  type: FilesUploadsEnum.Type;
  status: FilesUploadsEnum.Status;
  totalToProcess: number | null;
  totalProcessed: number | null;
  totalSuccess: number | null;
  totalError: number | null;
  errors: any | null;
  extra: any | null;
}
