/**
 * The crop of the image editor, in fractions of the picture as it is shown
 * (after turning and mirroring): 0 is the left or top edge, 1 the other one.
 */
export interface ICropBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** A corner the owner drags: which way it grows. */
export type TCorner = "nw" | "ne" | "sw" | "se";

/** The smallest crop, so a slip of the mouse never leaves nothing. */
export const MIN_CROP: number = 0.05;

export const FULL_CROP: ICropBox = { x: 0, y: 0, w: 1, h: 1 };

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

/**
 * The shape of a width:height ratio in fractions of a picture of this size:
 * a square on a wide picture is narrower than it is tall, in fractions.
 */
export const fractionRatio = (
  aspect: number,
  pictureWidth: number,
  pictureHeight: number,
): number => (aspect * pictureHeight) / pictureWidth;

/** The largest crop of that shape, in the middle; the whole picture when free. */
export const centeredCrop = (ratio: number | null): ICropBox => {
  if (!ratio) {
    return FULL_CROP;
  }

  let w: number = 1;
  let h: number = 1 / ratio;

  if (h > 1) {
    h = 1;
    w = ratio;
  }

  return { x: (1 - w) / 2, y: (1 - h) / 2, w, h };
};

/** The crop moved by a drag, kept inside the picture. */
export const moveCrop = (crop: ICropBox, dx: number, dy: number): ICropBox => ({
  ...crop,
  x: clamp(crop.x + dx, 0, 1 - crop.w),
  y: clamp(crop.y + dy, 0, 1 - crop.h),
});

/**
 * The crop when a corner is dragged to (px, py): the opposite corner stays,
 * the box keeps its shape when one is chosen, and never leaves the picture.
 */
export const resizeCrop = (
  crop: ICropBox,
  corner: TCorner,
  px: number,
  py: number,
  ratio: number | null,
): ICropBox => {
  const sx: number = corner === "ne" || corner === "se" ? 1 : -1;
  const sy: number = corner === "sw" || corner === "se" ? 1 : -1;

  // The corner that does not move.
  const ax: number = sx === 1 ? crop.x : crop.x + crop.w;
  const ay: number = sy === 1 ? crop.y : crop.y + crop.h;

  // How far it may grow before leaving the picture.
  const roomX: number = sx === 1 ? 1 - ax : ax;
  const roomY: number = sy === 1 ? 1 - ay : ay;

  let w: number = clamp((px - ax) * sx, MIN_CROP, roomX);
  let h: number = clamp((py - ay) * sy, MIN_CROP, roomY);

  if (ratio) {
    // The larger pull wins, then both fit the room left.
    w = Math.max(w, h * ratio);
    w = Math.min(w, roomX, roomY * ratio);
    w = Math.max(w, MIN_CROP);
    h = w / ratio;
  }

  return {
    x: sx === 1 ? ax : ax - w,
    y: sy === 1 ? ay : ay - h,
    w,
    h,
  };
};
