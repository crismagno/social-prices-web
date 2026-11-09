// Mirrors the API's quick message shapes.
import { IInboxMessage } from "../inbox/inbox.types";
import QuickMessagesEnum from "./quick-messages.enum";

export interface IQuickMessageTextBlock {
  type: QuickMessagesEnum.BlockType.TEXT;
  text: string;
}

export interface IQuickMessageMediaBlock {
  type: QuickMessagesEnum.BlockType.MEDIA;
  kind: QuickMessagesEnum.MediaKind;
  fileKey: string;
  fileName: string;
  mimeType: string;
  size: number;
  caption: string | null;
}

export type IQuickMessageBlock =
  IQuickMessageTextBlock | IQuickMessageMediaBlock;

export interface IQuickMessage {
  _id: string;
  ownerUserId: string;
  name: string;
  blocks: IQuickMessageBlock[];
  allEmployees: boolean;
  employeesIds: string[];
  usageCount: number;
  lastUsedAt: string | null;
  softDelete: { isDeleted: boolean } | null;
  createdAt: string;
  updatedAt: string;
}

// In the chat a file block comes without where it is kept.
export type IQuickMessageAvailableMediaBlock = Omit<
  IQuickMessageMediaBlock,
  "fileKey"
>;

export interface IQuickMessageAvailable {
  _id: string;
  name: string;
  usageCount: number;
  blocks: (IQuickMessageTextBlock | IQuickMessageAvailableMediaBlock)[];
}

export interface IQuickMessageFieldInfo {
  key: string;
  group: "cliente" | "funcionario";
  labelKey: string;
}

export interface IQuickMessageSendResult {
  messages: IInboxMessage[];
  sentCount: number;
  totalCount: number;
}

// One block as the editor sends it: a new file by its place in `files`, a kept one by its key.
export interface IQuickMessageBlockInput {
  type: QuickMessagesEnum.BlockType;
  text?: string;
  caption?: string | null;
  fileIndex?: number;
  fileKey?: string;
}

export interface IQuickMessageUpsert {
  name: string;
  allEmployees: boolean;
  employeesIds: string[];
  blocks: IQuickMessageBlockInput[];
}
