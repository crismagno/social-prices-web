import StoreSitesEnum from "../../../../shared/business/store-sites/store-sites.enum";

/** What the preview tells the editor the owner did on a section. */
export type TBuilderAction =
  | { kind: "select"; key: string }
  | { kind: "insert"; type: StoreSitesEnum.BlockType; atIndex: number }
  | { kind: "move"; key: string; toIndex: number }
  | { kind: "remove"; key: string }
  | { kind: "duplicate"; key: string }
  | { kind: "toggle"; key: string };

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
  send: (action: TBuilderAction) => void;
  labelOf: (type: StoreSitesEnum.BlockType) => string;
}
