// Mirrors social-prices-api/src/modules/quick-messages/interfaces/quick-messages.enum.ts
namespace QuickMessagesEnum {
  export enum BlockType {
    TEXT = "TEXT",
    MEDIA = "MEDIA",
  }

  export enum MediaKind {
    IMAGE = "IMAGE",
    VIDEO = "VIDEO",
    AUDIO = "AUDIO",
    FILE = "FILE",
  }

  export enum ErrorCode {
    NAME_TAKEN = "QUICK_MESSAGE_NAME_TAKEN",
    NOT_ALLOWED = "QUICK_MESSAGE_NOT_ALLOWED",
    FILE_MISSING = "QUICK_MESSAGE_FILE_MISSING",
    PARTIAL_SEND = "QUICK_MESSAGE_PARTIAL_SEND",
  }

  export const MAX_BLOCKS: number = 20;

  export const MAX_TEXT_LENGTH: number = 1000;

  export const MAX_NAME_LENGTH: number = 80;

  // The most any channel takes (25 MB), as the API.
  export const MAX_FILE_BYTES: number = 25 * 1024 * 1024;
}

export default QuickMessagesEnum;
