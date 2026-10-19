import MessengerEnum from "./messenger.enum";

// What the owner of the Page sees about the connection. Never a token.
export interface IMessengerConnection {
  connected: boolean;
  pageId: string | null;
  pageName: string | null;
  connectedAt: string | null;
  lastUpdateAt: string | null;
  // After the login of a user with several Pages: the ones to choose from.
  pendingPages: IMessengerPendingPage[];
}

export interface IMessengerPendingPage {
  pageId: string;
  pageName: string;
}

// One row of the inbox: a person talking to the Page.
export interface IMessengerChat {
  psid: string;
  name: string | null;
  profilePic: string | null;
  customerId: string | null;
  customerName: string | null;
  lastMessageAt: string;
  lastMessageText: string | null;
  // The kind of the file of the last message, when it had one and no text.
  lastAttachmentType: string | null;
  lastMessageDirection: MessengerEnum.Direction;
  unreadCount: number;
  // False once 24 hours passed since the person last wrote.
  canReply: boolean;
  replyWindowEndsAt: string;
}

export interface IMessengerAttachment {
  type: string;
  url: string;
}

export interface IMessengerMessage {
  _id: string;
  direction: MessengerEnum.Direction;
  psid: string;
  mid: string;
  text: string | null;
  attachments: IMessengerAttachment[];
  sentAt: string;
  sentByEmployeeId?: string | null;
}
