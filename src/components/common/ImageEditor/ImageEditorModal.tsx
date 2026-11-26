"use client";

import {
  PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import {
  ReloadOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import { Button, Modal, Segmented, Space, Spin, Tooltip } from "antd";

import useLanguageData from "../../../data/context/language/useLanguageData";
import styles from "./ImageEditorModal.module.css";
import {
  FULL_CROP,
  ICropBox,
  TCorner,
  centeredCrop,
  fractionRatio,
  moveCrop,
  resizeCrop,
} from "./image-editor-geometry";

export type TAspect = "free" | "1:1" | "4:3" | "16:9";

const ASPECTS: Record<TAspect, number | null> = {
  free: null,
  "1:1": 1,
  "4:3": 4 / 3,
  "16:9": 16 / 9,
};

const STAGE_MAX_WIDTH: number = 640;
const STAGE_MAX_HEIGHT: number = 420;

// The kinds the editor writes back as they came; anything else becomes a PNG.
const KEPT_TYPES: string[] = ["image/jpeg", "image/png", "image/webp"];

/** The largest crop of a shape on a picture of this size, in the middle. */
const startCrop = (
  aspect: TAspect,
  width: number,
  height: number,
): ICropBox =>
  ASPECTS[aspect]
    ? centeredCrop(fractionRatio(ASPECTS[aspect] as number, width, height))
    : FULL_CROP;

/** Whether a file is a picture the editor can open (an animated GIF is not). */
export const isEditableImage = (file: File | null | undefined): boolean =>
  !!file &&
  file.type.startsWith("image/") &&
  file.type !== "image/gif" &&
  file.type !== "image/svg+xml";

interface Props {
  /** The picture to edit; null closes the editor. */
  file: File | null;
  onCancel: () => void;
  onSave: (file: File) => void;
  /** The words of the button that leaves without editing. */
  cancelLabel?: string;
  /** The shape the crop starts in (a photo of a profile starts square). */
  initialAspect?: TAspect;
}

type TDrag =
  | { kind: "move"; startX: number; startY: number; crop: ICropBox }
  | { kind: "corner"; corner: TCorner };

/**
 * Crops and turns a picture before it is sent: free or a fixed shape, a
 * quarter turn either way, a mirror. The picture is drawn again in the
 * browser at its full size, so nothing leaves the page while editing.
 */
const ImageEditorModal = ({
  file,
  onCancel,
  onSave,
  cancelLabel,
  initialAspect = "free",
}: Props) => {
  const { t } = useLanguageData();

  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [rotation, setRotation] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [aspect, setAspect] = useState<TAspect>("free");
  const [crop, setCrop] = useState<ICropBox>(FULL_CROP);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<TDrag | null>(null);

  // The picture is loaded again for each file, and everything starts over.
  useEffect(() => {
    if (!file) {
      setImage(null);
      return;
    }

    const url: string = URL.createObjectURL(file);
    const loaded: HTMLImageElement = new Image();

    loaded.onload = () => {
      setImage(loaded);
      setCrop(startCrop(initialAspect, loaded.naturalWidth, loaded.naturalHeight));
    };
    loaded.src = url;

    setRotation(0);
    setIsFlipped(false);
    setAspect(initialAspect);
    setCrop(FULL_CROP);

    return () => URL.revokeObjectURL(url);
  }, [file, initialAspect]);

  const isSideways: boolean = rotation % 180 !== 0;
  const turnedWidth: number = image
    ? isSideways
      ? image.naturalHeight
      : image.naturalWidth
    : 1;
  const turnedHeight: number = image
    ? isSideways
      ? image.naturalWidth
      : image.naturalHeight
    : 1;

  const scale: number = Math.min(
    STAGE_MAX_WIDTH / turnedWidth,
    STAGE_MAX_HEIGHT / turnedHeight,
    1,
  );
  const shownWidth: number = Math.round(turnedWidth * scale);
  const shownHeight: number = Math.round(turnedHeight * scale);

  const ratio: number | null = ASPECTS[aspect]
    ? fractionRatio(ASPECTS[aspect] as number, turnedWidth, turnedHeight)
    : null;

  /** Draws the picture turned and mirrored, filling a canvas of its turned size. */
  const draw = useCallback(
    (canvas: HTMLCanvasElement, width: number, height: number): void => {
      if (!image) {
        return;
      }

      canvas.width = width;
      canvas.height = height;

      const context: CanvasRenderingContext2D | null = canvas.getContext("2d");

      if (!context) {
        return;
      }

      const drawWidth: number = isSideways ? height : width;
      const drawHeight: number = isSideways ? width : height;

      context.save();
      context.translate(width / 2, height / 2);
      // Mirrored as the owner sees it, whatever the turn.
      context.scale(isFlipped ? -1 : 1, 1);
      context.rotate((rotation * Math.PI) / 180);
      context.drawImage(
        image,
        -drawWidth / 2,
        -drawHeight / 2,
        drawWidth,
        drawHeight,
      );
      context.restore();
    },
    [image, isFlipped, isSideways, rotation],
  );

  useLayoutEffect(() => {
    if (canvasRef.current) {
      draw(canvasRef.current, shownWidth, shownHeight);
    }
  }, [draw, shownWidth, shownHeight]);

  // A new turn or shape starts from the largest crop that fits.
  const startOver = (nextRatio: number | null): void =>
    setCrop(centeredCrop(nextRatio));

  const turn = (degrees: number): void => {
    const next: number = (rotation + degrees + 360) % 360;
    const nextSideways: boolean = next % 180 !== 0;

    setRotation(next);

    if (image && ASPECTS[aspect]) {
      const width: number = nextSideways ? image.naturalHeight : image.naturalWidth;
      const height: number = nextSideways ? image.naturalWidth : image.naturalHeight;

      startOver(fractionRatio(ASPECTS[aspect] as number, width, height));
    } else {
      startOver(null);
    }
  };

  const changeAspect = (next: TAspect): void => {
    setAspect(next);
    startOver(
      ASPECTS[next]
        ? fractionRatio(ASPECTS[next] as number, turnedWidth, turnedHeight)
        : null,
    );
  };

  /** Where the pointer is, in fractions of the picture shown. */
  const pointOf = (event: ReactPointerEvent): { x: number; y: number } => {
    const stage: DOMRect | undefined =
      boxRef.current?.parentElement?.getBoundingClientRect();

    if (!stage) {
      return { x: 0, y: 0 };
    }

    return {
      x: (event.clientX - stage.left) / stage.width,
      y: (event.clientY - stage.top) / stage.height,
    };
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const corner = (event.target as HTMLElement).dataset.corner as
      | TCorner
      | undefined;
    const point = pointOf(event);

    dragRef.current = corner
      ? { kind: "corner", corner }
      : { kind: "move", startX: point.x, startY: point.y, crop };

    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const drag: TDrag | null = dragRef.current;

    if (!drag) {
      return;
    }

    const point = pointOf(event);

    setCrop((current: ICropBox) =>
      drag.kind === "move"
        ? moveCrop(drag.crop, point.x - drag.startX, point.y - drag.startY)
        : resizeCrop(current, drag.corner, point.x, point.y, ratio),
    );
  };

  const onPointerUp = (): void => {
    dragRef.current = null;
  };

  const save = async (): Promise<void> => {
    if (!file || !image) {
      return;
    }

    setIsSaving(true);

    try {
      // The whole picture at its own size, then the crop of it.
      const full: HTMLCanvasElement = document.createElement("canvas");

      draw(full, turnedWidth, turnedHeight);

      const cut: HTMLCanvasElement = document.createElement("canvas");
      const sx: number = Math.round(crop.x * turnedWidth);
      const sy: number = Math.round(crop.y * turnedHeight);
      const sw: number = Math.max(1, Math.round(crop.w * turnedWidth));
      const sh: number = Math.max(1, Math.round(crop.h * turnedHeight));

      cut.width = sw;
      cut.height = sh;
      cut.getContext("2d")?.drawImage(full, sx, sy, sw, sh, 0, 0, sw, sh);

      const type: string = KEPT_TYPES.includes(file.type)
        ? file.type
        : "image/png";

      const blob: Blob | null = await new Promise((resolve) =>
        cut.toBlob(resolve, type, 0.92),
      );

      if (!blob) {
        return;
      }

      const name: string =
        type === file.type ? file.name : file.name.replace(/\.[^.]+$/, "") + ".png";

      onSave(new File([blob], name, { type, lastModified: Date.now() }));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      open={!!file}
      title={t("imageEditor.title")}
      width={720}
      onCancel={onCancel}
      destroyOnClose
      footer={[
        <Button key="cancel" onClick={onCancel}>
          {cancelLabel ?? t("imageEditor.cancel")}
        </Button>,
        <Button
          key="save"
          type="primary"
          loading={isSaving}
          disabled={!image}
          onClick={save}
        >
          {t("imageEditor.save")}
        </Button>,
      ]}
    >
      <div className={styles.tools}>
        <Segmented<TAspect>
          value={aspect}
          onChange={changeAspect}
          options={[
            { value: "free", label: t("imageEditor.free") },
            { value: "1:1", label: t("imageEditor.square") },
            { value: "4:3", label: "4:3" },
            { value: "16:9", label: "16:9" },
          ]}
        />
        <Space size={4}>
          <Tooltip title={t("imageEditor.rotateLeft")}>
            <Button icon={<RotateLeftOutlined />} onClick={() => turn(-90)} />
          </Tooltip>
          <Tooltip title={t("imageEditor.rotateRight")}>
            <Button icon={<RotateRightOutlined />} onClick={() => turn(90)} />
          </Tooltip>
          <Tooltip title={t("imageEditor.flip")}>
            <Button
              icon={<SwapOutlined />}
              type={isFlipped ? "primary" : "default"}
              onClick={() => setIsFlipped((flipped: boolean) => !flipped)}
            />
          </Tooltip>
          <Tooltip title={t("imageEditor.reset")}>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                setRotation(0);
                setIsFlipped(false);
                setAspect(initialAspect);
                setCrop(
                  image
                    ? startCrop(
                        initialAspect,
                        image.naturalWidth,
                        image.naturalHeight,
                      )
                    : FULL_CROP,
                );
              }}
            />
          </Tooltip>
        </Space>
      </div>

      <div className={styles.area}>
        {!image ? (
          <Spin />
        ) : (
          <div
            className={styles.stage}
            style={{ width: shownWidth, height: shownHeight }}
          >
            <canvas ref={canvasRef} className={styles.canvas} />
            <div
              ref={boxRef}
              className={styles.box}
              style={{
                left: `${crop.x * 100}%`,
                top: `${crop.y * 100}%`,
                width: `${crop.w * 100}%`,
                height: `${crop.h * 100}%`,
              }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            >
              <span className={styles.grid} aria-hidden />
              {(["nw", "ne", "sw", "se"] as TCorner[]).map((corner) => (
                <span
                  key={corner}
                  className={`${styles.handle} ${styles[corner]}`}
                  data-corner={corner}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <p className={styles.hint}>{t("imageEditor.hint")}</p>
    </Modal>
  );
};

export default ImageEditorModal;
