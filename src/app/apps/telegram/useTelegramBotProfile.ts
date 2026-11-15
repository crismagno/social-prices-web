"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import { ITelegramBotProfile } from "../../../shared/business/apps/telegram/telegram.types";

// What people see about the bot on Telegram: name, descriptions and photo. The
// card shows it and the edit modal updates it, so both stay in step.
export const useTelegramBotProfile = (): {
  profile: ITelegramBotProfile | null;
  photoUrl: string | null;
  setProfile: (profile: ITelegramBotProfile) => void;
  setPhoto: (photo: Blob | null) => void;
} => {
  const [profile, setProfile] = useState<ITelegramBotProfile | null>(null);

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  // The object URL in use, freed when it is replaced or the card goes away.
  const photoUrlRef = useRef<string | null>(null);

  const setPhoto = useCallback((photo: Blob | null) => {
    if (photoUrlRef.current) {
      URL.revokeObjectURL(photoUrlRef.current);
    }

    photoUrlRef.current = photo ? URL.createObjectURL(photo) : null;

    setPhotoUrl(photoUrlRef.current);
  }, []);

  useEffect(() => {
    let isCurrent: boolean = true;

    // Both are niceties on the card: if Telegram does not answer, it just shows less.
    serviceMethodsInstance.telegramServiceMethods
      .getBotProfile()
      .then((loaded) => isCurrent && setProfile(loaded))
      .catch(() => undefined);

    serviceMethodsInstance.telegramServiceMethods
      .getBotPhoto()
      .then((photo) => isCurrent && setPhoto(photo))
      .catch(() => undefined);

    return () => {
      isCurrent = false;
    };
  }, [setPhoto]);

  useEffect(
    () => () => {
      if (photoUrlRef.current) {
        URL.revokeObjectURL(photoUrlRef.current);
      }
    },
    [],
  );

  return { profile, photoUrl, setProfile, setPhoto };
};
