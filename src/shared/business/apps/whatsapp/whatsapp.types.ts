// What the owner of the number sees about the connection. Never a token.
export interface IWhatsappConnection {
  connected: boolean;
  // REVOKED when the user removed the app from their business: connect again.
  status: string | null;
  phoneNumberId: string | null;
  displayPhoneNumber: string | null;
  verifiedName: string | null;
  connectedAt: string | null;
  lastUpdateAt: string | null;
}

// What the browser needs to open Meta's Embedded Signup. None of it is secret.
export interface IWhatsappConnectConfig {
  appId: string;
  configId: string;
  graphVersion: string;
}

// What Embedded Signup hands over when the user finishes.
export interface IWhatsappSignupResult {
  code: string;
  wabaId: string;
  phoneNumberId: string;
}
