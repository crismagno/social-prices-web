"use client";

import { CSSProperties, DragEvent, HTMLAttributes, useState } from "react";

interface IDragReorder {
  /** What makes the item at this position draggable and a place to drop on. */
  itemProps: (index: number) => HTMLAttributes<HTMLElement>;
}

/**
 * Reorders a list by dragging an item from any part of it onto another. It
 * uses the browser's own drag, which a touch screen does not have: the list
 * keeps its move buttons for that.
 */
const useDragReorder = (
  onMove: (from: number, to: number) => void,
): IDragReorder => {
  const [dragged, setDragged] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);

  const reset = (): void => {
    setDragged(null);
    setOver(null);
  };

  const styleOf = (index: number): CSSProperties => {
    if (dragged === null) {
      return { cursor: "grab" };
    }

    if (index === dragged) {
      return { cursor: "grabbing", opacity: 0.4 };
    }

    if (index !== over) {
      return { cursor: "grabbing" };
    }

    // A line on the side the item will land: below when it comes from above.
    return {
      cursor: "grabbing",
      boxShadow:
        dragged < over ? "inset 0 -2px 0 0 #1677ff" : "inset 0 2px 0 0 #1677ff",
    };
  };

  return {
    itemProps: (index: number) => ({
      draggable: true,
      style: styleOf(index),
      onDragStart: (event: DragEvent<HTMLElement>) => {
        event.dataTransfer.effectAllowed = "move";
        // Firefox only starts a drag that carries some data.
        event.dataTransfer.setData("text/plain", String(index));
        setDragged(index);
      },
      onDragOver: (event: DragEvent<HTMLElement>) => {
        if (dragged === null) {
          return;
        }

        // Without this the browser refuses the drop.
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";

        if (over !== index) {
          setOver(index);
        }
      },
      onDrop: (event: DragEvent<HTMLElement>) => {
        event.preventDefault();

        if (dragged !== null && dragged !== index) {
          onMove(dragged, index);
        }

        reset();
      },
      onDragEnd: reset,
    }),
  };
};

export default useDragReorder;
