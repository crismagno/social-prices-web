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
  // What the channel takes besides text: files, recordings, and the size limit.
  canSendMedia: boolean;
  canSendVoice: boolean;
  maxUploadBytes: number | null;
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
  // Whether the store has ever written to this person, on any channel.
  hasReplied: boolean;
  // Set aside by the user: shown apart, until the person writes again.
  isInLimbo: boolean;
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
  // When its words were last changed after being sent; null when they never were.
  editedAt: string | null;
  // Whether the message's channel lets it be removed.
  canDelete: boolean;
  // Whether the message's channel lets its words be changed.
  canEdit: boolean;
}

// Which conversations a call is about: a customer's, or just one.
export interface IInboxScope {
  customerId?: string;
  conversationId?: string;
  // Only this channel's conversations: what an app's own page shows.
  channel?: InboxEnum.Channel;
}
