import InstagramEnum from "./instagram.enum";

// What the owner of the account sees about the connection. Never a token.
export interface IInstagramConnection {
  connected: boolean;
  // EXPIRED when the 60-day token ran out: the user connects again.
  status: string | null;
  instagramUserId: string | null;
  username: string | null;
  name: string | null;
  profilePictureUrl: string | null;
  connectedAt: string | null;
  lastUpdateAt: string | null;
}

// One row of the inbox: a person talking to the account.
export interface IInstagramChat {
  igsid: string;
  name: string | null;
  username: string | null;
  profilePic: string | null;
  customerId: string | null;
  customerName: string | null;
  lastMessageAt: string;
  lastMessageText: string | null;
  // The kind of the file of the last message, when it had one and no text (or "unsupported").
  lastAttachmentType: string | null;
  lastMessageDirection: InstagramEnum.Direction;
  unreadCount: number;
  // False once 24 hours passed since the person last wrote.
  canReply: boolean;
  replyWindowEndsAt: string;
}

export interface IInstagramAttachment {
  type: string;
  url: string;
}

export interface IInstagramMessage {
  _id: string;
  direction: InstagramEnum.Direction;
  igsid: string;
  mid: string;
  text: string | null;
  attachments: IInstagramAttachment[];
  // Instagram could not carry this message (a like, a share...).
  isUnsupported?: boolean;
  sentAt: string;
  sentByEmployeeId?: string | null;
}
