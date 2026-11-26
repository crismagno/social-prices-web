"use client";

import { DragEvent, MouseEvent, ReactNode, useState } from "react";

import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CopyOutlined,
  DeleteOutlined,
  DragOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
} from "@ant-design/icons";

import { IStoreSiteBlock } from "../../../../shared/business/store-sites/store-site-blocks";
import StoreSitesEnum from "../../../../shared/business/store-sites/store-sites.enum";
import useSiteT from "../useSiteT";
import styles from "./SectionFrame.module.css";
import {
  ISectionBuilderHooks,
  SECTION_DRAG_TYPE,
  TSectionDrag,
} from "./builder-types";

interface Props {
  section: IStoreSiteBlock;
  index: number;
  count: number;
  isPart: boolean;
  builder: ISectionBuilderHooks;
  /** Where a drag over this section would drop: before it or after it. */
  onDragOverAt: (index: number) => void;
  onDrop: (event: DragEvent<HTMLElement>) => void;
  children: ReactNode;
}

/**
 * One section in the editor's preview: outlined on hover with its name, a
 * small toolbar to move, copy, hide or remove it, a handle to drag it, and a
 * click that opens its fields in the panel.
 */
const SectionFrame = ({
  section,
  index,
  count,
  isPart,
  builder,
  onDragOverAt,
  onDrop,
  children,
}: Props) => {
  const t = useSiteT();
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const isSelected: boolean = builder.selectedKey === section.key;

  const act =
    (action: () => void) =>
    (event: MouseEvent<HTMLButtonElement>): void => {
      event.stopPropagation();
      action();
    };

  const label = (key: string): string =>
    t(`storeSite.editor.builder.frame.${key}`);

  return (
    <div
      className={styles.frame}
      data-selected={isSelected || undefined}
      data-hidden={!section.isActive || undefined}
      data-dragging={isDragging || undefined}
      // Shown when the section draws nothing (a part whose tab has it off).
      data-empty-label={`${builder.labelOf(section.type)} — ${label("empty")}`}
      onClickCapture={(event: MouseEvent<HTMLDivElement>) => {
        // In the builder a click picks the section; nothing inside it reacts.
        const target = event.target as HTMLElement;

        if (!target.closest("[data-frame-tool]")) {
          event.preventDefault();
          event.stopPropagation();
          builder.send({ kind: "select", key: section.key });
        }
      }}
      onDragOver={(event: DragEvent<HTMLDivElement>) => {
        if (!event.dataTransfer.types.includes(SECTION_DRAG_TYPE)) {
          return;
        }

        event.preventDefault();

        const box: DOMRect = event.currentTarget.getBoundingClientRect();

        onDragOverAt(
          event.clientY < box.top + box.height / 2 ? index : index + 1,
        );
      }}
      onDrop={onDrop}
    >
      <span className={styles.chip} data-frame-tool>
        {builder.labelOf(section.type)}
        {!section.isActive && (
          <em className={styles.hiddenTag}>{label("hidden")}</em>
        )}
      </span>

      <div className={styles.toolbar} data-frame-tool>
        <button
          type="button"
          className={styles.handle}
          draggable
          title={label("drag")}
          aria-label={label("drag")}
          onDragStart={(event: DragEvent<HTMLButtonElement>) => {
            const data: TSectionDrag = { kind: "move", key: section.key };

            event.dataTransfer.setData(SECTION_DRAG_TYPE, JSON.stringify(data));
            event.dataTransfer.effectAllowed = "move";

            const frame = event.currentTarget.closest(
              `.${styles.frame}`,
            ) as HTMLElement | null;

            if (frame) {
              event.dataTransfer.setDragImage(frame, 24, 24);
            }

            setIsDragging(true);
          }}
          onDragEnd={() => setIsDragging(false)}
        >
          <DragOutlined />
        </button>
        <button
          type="button"
          title={label("up")}
          aria-label={label("up")}
          disabled={index === 0}
          onClick={act(() =>
            builder.send({
              kind: "move",
              key: section.key,
              toIndex: index - 1,
            }),
          )}
        >
          <ArrowUpOutlined />
        </button>
        <button
          type="button"
          title={label("down")}
          aria-label={label("down")}
          disabled={index === count - 1}
          onClick={act(() =>
            builder.send({
              kind: "move",
              key: section.key,
              toIndex: index + 1,
            }),
          )}
        >
          <ArrowDownOutlined />
        </button>
        {!isPart && (
          <button
            type="button"
            title={label("duplicate")}
            aria-label={label("duplicate")}
            onClick={act(() =>
              builder.send({ kind: "duplicate", key: section.key }),
            )}
          >
            <CopyOutlined />
          </button>
        )}
        <button
          type="button"
          title={label(section.isActive ? "hide" : "show")}
          aria-label={label(section.isActive ? "hide" : "show")}
          onClick={act(() =>
            builder.send({ kind: "toggle", key: section.key }),
          )}
        >
          {section.isActive ? <EyeOutlined /> : <EyeInvisibleOutlined />}
        </button>
        {section.type !== StoreSitesEnum.BlockType.HERO && (
          <button
            type="button"
            className={`${styles.danger} ${isConfirming ? styles.confirming : ""}`}
            title={label("remove")}
            aria-label={label(isConfirming ? "removeConfirm" : "remove")}
            onMouseLeave={() => setIsConfirming(false)}
            onClick={act(() => {
              // Asks once: a second click removes it.
              if (isConfirming) {
                setIsConfirming(false);
                builder.send({ kind: "remove", key: section.key });
              } else {
                setIsConfirming(true);
              }
            })}
          >
            <DeleteOutlined />
            {isConfirming && <span>{label("removeConfirm")}</span>}
          </button>
        )}
      </div>

      {children}
    </div>
  );
};

export default SectionFrame;
