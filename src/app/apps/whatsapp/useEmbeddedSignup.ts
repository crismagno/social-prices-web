"use client";

import { useCallback } from "react";

import {
  IWhatsappConnectConfig,
  IWhatsappSignupResult,
} from "../../../shared/business/apps/whatsapp/whatsapp.types";

declare global {
  interface Window {
    FB?: any;
    fbAsyncInit?: () => void;
  }
}

const SDK_URL: string = "https://connect.facebook.net/en_US/sdk.js";

// The login window reports the ids and the callback brings the code; they arrive
// in either order, and the second one should come right after the first.
const SESSION_WAIT_MS: number = 15000;

export class SignupCancelledError extends Error {
  constructor() {
    super("The signup was cancelled.");
    this.name = "SignupCancelledError";
  }
}

// Facebook's SDK, once per page.
const loadSdk = (config: IWhatsappConnectConfig): Promise<any> =>
  new Promise((resolve, reject) => {
    const init = (): void => {
      window.FB.init({
        appId: config.appId,
        autoLogAppEvents: true,
        xfbml: false,
        version: config.graphVersion,
      });

      resolve(window.FB);
    };

    if (window.FB) {
      init();

      return;
    }

    window.fbAsyncInit = init;

    const script: HTMLScriptElement = document.createElement("script");
    script.src = SDK_URL;
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    script.onerror = () =>
      reject(new Error("Could not load Facebook's login."));

    document.body.appendChild(script);
  });

// Meta's Embedded Signup: a Facebook window where the user picks or creates their
// WhatsApp Business account and number. It ends with a code (for the server to
// trade for a token) and the ids of the account and number that were chosen.
export const useEmbeddedSignup = (): {
  start: (config: IWhatsappConnectConfig) => Promise<IWhatsappSignupResult>;
} => {
  const start = useCallback(
    async (config: IWhatsappConnectConfig): Promise<IWhatsappSignupResult> => {
      const FB = await loadSdk(config);

      return await new Promise<IWhatsappSignupResult>((resolve, reject) => {
        let code: string | null = null;
        let session: { wabaId: string; phoneNumberId: string } | null = null;
        let timer: ReturnType<typeof setTimeout> | undefined;

        const finish = (): void => {
          if (code && session) {
            cleanup();
            resolve({ code, ...session });
          }
        };

        const cleanup = (): void => {
          window.removeEventListener("message", onMessage);

          if (timer) {
            clearTimeout(timer);
          }
        };

        const fail = (error: Error): void => {
          cleanup();
          reject(error);
        };

        const onMessage = (event: MessageEvent): void => {
          if (!/(^|\.)facebook\.com$/.test(new URL(event.origin).hostname)) {
            return;
          }

          let data: any;

          try {
            data = JSON.parse(event.data);
          } catch {
            return;
          }

          if (data?.type !== "WA_EMBEDDED_SIGNUP") {
            return;
          }

          if (data.event === "FINISH" && data.data?.phone_number_id) {
            session = {
              wabaId: String(data.data.waba_id),
              phoneNumberId: String(data.data.phone_number_id),
            };

            finish();
          } else if (data.event === "CANCEL") {
            fail(new SignupCancelledError());
          }
        };

        window.addEventListener("message", onMessage);

        FB.login(
          (response: any) => {
            if (!response?.authResponse?.code) {
              fail(new SignupCancelledError());

              return;
            }

            code = response.authResponse.code;

            finish();

            // The ids should follow within moments.
            timer = setTimeout(
              () => fail(new Error("Facebook did not send the number chosen.")),
              SESSION_WAIT_MS,
            );
          },
          {
            config_id: config.configId,
            response_type: "code",
            override_default_response_type: true,
            extras: { setup: {}, featureType: "", sessionInfoVersion: "3" },
          },
        );
      });
    },
    [],
  );

  return { start };
};
