"use client";

import { createContext } from "react";

import { TCanvasBox } from "../../../../shared/business/store-sites/store-site-canvas";

/**
 * What a free canvas needs in the editor's builder to be worked on in the
 * preview itself: which of its elements is picked, and how to tell the editor
 * that one was picked, moved or resized. Absent, the canvas is just drawn.
 */
export interface ICanvasBuilder {
  selectedElementKey: string | null;
  select: (sectionKey: string, elementKey: string | null) => void;
  place: (sectionKey: string, elementKey: string, box: TCanvasBox) => void;
}

export const CanvasBuilderContext = createContext<ICanvasBuilder | null>(null);
