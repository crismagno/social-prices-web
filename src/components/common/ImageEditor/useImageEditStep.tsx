"use client";

import { ReactNode, useCallback, useState } from "react";

import useLanguageData from "../../../data/context/language/useLanguageData";
import ImageEditorModal, { TAspect, isEditableImage } from "./ImageEditorModal";

interface IImageEditStep {
  /**
   * The file as it goes on: a picture after the editor (or as it was, when
   * the owner leaves without editing); any other file at once.
   */
  editIfImage: (file: File) => Promise<File>;
  /** The editor itself, to be placed once in the screen that uses it. */
  editor: ReactNode;
}

interface IWaiting {
  file: File;
  resolve: (file: File) => void;
}

/**
 * The step between picking a file and using it: a picture opens in the image
 * editor (crop, turn, mirror); videos, documents and animated pictures go
 * straight on. Several pictures picked at once open one after the other.
 * The same editor everywhere a picture is picked.
 */
export const useImageEditStep = (
  initialAspect: TAspect = "free",
): IImageEditStep => {
  const { t } = useLanguageData();

  const [queue, setQueue] = useState<IWaiting[]>([]);

  const editIfImage = useCallback((picked: File): Promise<File> => {
    if (!isEditableImage(picked)) {
      return Promise.resolve(picked);
    }

    return new Promise((resolve) =>
      setQueue((current: IWaiting[]) => [...current, { file: picked, resolve }]),
    );
  }, []);

  const current: IWaiting | undefined = queue[0];

  // The picture shown is done: it goes on, and the next one opens.
  const finish = (result: File): void => {
    current?.resolve(result);
    setQueue((waiting: IWaiting[]) => waiting.slice(1));
  };

  return {
    editIfImage,
    editor: (
      <ImageEditorModal
        file={current?.file ?? null}
        initialAspect={initialAspect}
        cancelLabel={t("imageEditor.useOriginal")}
        // Leaving keeps the picture as it was picked.
        onCancel={() => current && finish(current.file)}
        onSave={(edited: File) => finish(edited)}
      />
    ),
  };
};
