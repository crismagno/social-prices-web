import InboxEnum from "./inbox.enum";

// Mirrors the API's central chat views by hand.
export interface IInboxConversation {
  _id: string;
  channel: InboxEnum.Channel;
  contactKey: string;
  name: string | null;
  username: string | null;
  profilePic: string | null;
  unreadCount: number;
  lastMessageAt: string | null;
  // Whether an answer is allowed now on this channel, and until when.
  canReply: boolean;
  replyWindowEndsAt: string | null;
}

// A row of the list: a customer with all their conversations, or one person
// not tied to a customer yet.
export interface IInboxChat {
  key: string;
  customerId: string | null;
  name: string | null;
  avatar: string | null;
  channels: InboxEnum.Channel[];
  conversations: IInboxConversation[];
  // Where an answer goes by default: the conversation of the last message received.
  replyConversationId: string;
  lastMessageAt: string;
  lastMessageText: string | null;
  lastMessageKind: InboxEnum.MessageKind | null;
  lastMessageChannel: InboxEnum.Channel;
  lastMessageDirection: InboxEnum.Direction;
  unreadCount: number;
}

export interface IInboxAttachment {
  index: number;
  kind: InboxEnum.MessageKind;
  mimeType: string | null;
  fileName: string | null;
  size: number | null;
  width: number | null;
  height: number | null;
  duration: number | null;
}

export interface IInboxMessage {
  _id: string;
  conversationId: string;
  channel: InboxEnum.Channel;
  direction: InboxEnum.Direction;
  kind: InboxEnum.MessageKind;
  text: string | null;
  attachments: IInboxAttachment[];
  isUnsupported: boolean;
  sentAt: string;
  sentByEmployeeId: string | null;
  // Whether the message's channel lets it be removed.
  canDelete: boolean;
}

// Which conversations a call is about: a customer's, or just one.
export interface IInboxScope {
  customerId?: string;
  conversationId?: string;
}
