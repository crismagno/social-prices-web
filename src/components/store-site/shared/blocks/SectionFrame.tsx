"use client";

import {
  DragEvent,
  MouseEvent,
  PointerEvent,
  ReactNode,
  useRef,
  useState,
} from "react";

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
  /** This section started being dragged by its handle. */
  onDragStartMove: () => void;
  onDrop: (event: DragEvent<HTMLElement>) => void;
  /**
   * Its bottom edge is being pulled: how far, in screen pixels, from where it
   * was when the pull began (with the size the section had then). `isDone`
   * when the pointer lets go.
   */
  onResize: (
    pull: { dy: number; startHeight: number; startWidth: number },
    isDone: boolean,
  ) => void;
  /** Back to as tall as it needs: a double click on the edge. */
  onResizeReset: () => void;
  /** What the edge says while it is pulled: the height it will have. */
  resizeLabel: string | null;
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
  onDragStartMove,
  onDrop,
  onResize,
  onResizeReset,
  resizeLabel,
  children,
}: Props) => {
  const t = useSiteT();
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const isSelected: boolean = builder.selectedKey === section.key;

  // Where a pull of the bottom edge began, and how big the section was then.
  const pullRef = useRef<{
    y: number;
    startHeight: number;
    startWidth: number;
  } | null>(null);

  const pullOf = (event: PointerEvent<HTMLElement>) => {
    const pull = pullRef.current;

    return pull
      ? {
          dy: event.clientY - pull.y,
          startHeight: pull.startHeight,
          startWidth: pull.startWidth,
        }
      : null;
  };

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

            // A small tag with its name follows the pointer, not a picture of
            // the whole section (which can be as tall as the screen).
            const ghost: HTMLSpanElement = document.createElement("span");

            ghost.className = styles.ghost;
            ghost.textContent = builder.labelOf(section.type);
            document.body.appendChild(ghost);
            event.dataTransfer.setDragImage(ghost, 16, 16);
            window.setTimeout(() => ghost.remove(), 0);

            setIsDragging(true);
            onDragStartMove();
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

      {/* The bottom edge: pulled to make the section taller or shorter. */}
      <div
        className={styles.resize}
        data-frame-tool
        data-pulling={resizeLabel !== null || undefined}
        role="separator"
        aria-orientation="horizontal"
        aria-label={label("resize")}
        title={label("resize")}
        onPointerDown={(event: PointerEvent<HTMLDivElement>) => {
          if (event.button !== 0) {
            return;
          }

          event.preventDefault();
          event.stopPropagation();

          const frame = event.currentTarget.closest(
            `.${styles.frame}`,
          ) as HTMLElement | null;
          const box: DOMRect | undefined = frame?.getBoundingClientRect();

          // A free canvas inside counts in its own width, which can be
          // narrower than the section.
          const canvas: Element | null | undefined =
            frame?.querySelector("[data-building]");

          pullRef.current = {
            y: event.clientY,
            startHeight: box?.height ?? 0,
            startWidth:
              canvas?.getBoundingClientRect().width ?? box?.width ?? 0,
          };

          try {
            event.currentTarget.setPointerCapture(event.pointerId);
          } catch {
            // A pointer that cannot be held still pulls while it stays over it.
          }

          builder.send({ kind: "select", key: section.key });
          onResize({ dy: 0, ...pullRef.current }, false);
        }}
        onPointerMove={(event: PointerEvent<HTMLDivElement>) => {
          const pull = pullOf(event);

          if (pull) {
            onResize(pull, false);
          }
        }}
        onPointerUp={(event: PointerEvent<HTMLDivElement>) => {
          const pull = pullOf(event);

          pullRef.current = null;

          if (pull) {
            onResize(pull, true);
          }
        }}
        onPointerCancel={(event: PointerEvent<HTMLDivElement>) => {
          const pull = pullOf(event);

          pullRef.current = null;

          if (pull) {
            onResize(pull, true);
          }
        }}
        onDoubleClick={(event: MouseEvent<HTMLDivElement>) => {
          event.stopPropagation();
          onResizeReset();
        }}
      >
        <span className={styles.resizeGrip} />
        {resizeLabel !== null && (
          <span className={styles.resizeLabel}>{resizeLabel}</span>
        )}
      </div>
    </div>
  );
};

export default SectionFrame;
