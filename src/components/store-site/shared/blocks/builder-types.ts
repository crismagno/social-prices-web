import { TCanvasBox } from "../../../../shared/business/store-sites/store-site-canvas";
import StoreSitesEnum from "../../../../shared/business/store-sites/store-sites.enum";

/** What the preview tells the editor the owner did on a section. */
export type TBuilderAction =
  | { kind: "select"; key: string }
  | { kind: "insert"; type: StoreSitesEnum.BlockType; atIndex: number }
  | { kind: "move"; key: string; toIndex: number }
  | { kind: "remove"; key: string }
  | { kind: "duplicate"; key: string }
  | { kind: "toggle"; key: string }
  /** An element of a free canvas was picked; none lets go of it. */
  | { kind: "selectElement"; key: string; elementKey: string | null }
  /** An element of a free canvas was moved or resized. */
  | { kind: "placeElement"; key: string; elementKey: string; box: TCanvasBox }
  /** A link to a page of the site was clicked: the preview shows that page. */
  | { kind: "page"; pageKey: string | null };

/** The drag data a palette item or a section's handle carries. */
export const SECTION_DRAG_TYPE = "application/x-site-section";

export type TSectionDrag =
  | { kind: "new"; type: StoreSitesEnum.BlockType }
  | { kind: "move"; key: string };

/**
 * The preview in builder mode: which section is selected, how to tell the
 * editor, and the name of each kind of section.
 */
export interface ISectionBuilderHooks {
  selectedKey: string | null;
  /** The element picked on the selected free canvas, if any. */
  selectedElementKey?: string | null;
  send: (action: TBuilderAction) => void;
  labelOf: (type: StoreSitesEnum.BlockType) => string;
}
