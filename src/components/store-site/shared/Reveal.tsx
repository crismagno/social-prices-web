"use client";

import { CSSProperties, ReactNode } from "react";

import base from "./site-base.module.css";
import useReveal from "./useReveal";

export type TRevealEffect = "up" | "left" | "right" | "zoom" | "blur";

interface Props {
  children: ReactNode;
  className?: string;
  /** Seconds to wait once in view, to stagger siblings. */
  delay?: number;
  style?: CSSProperties;
  /** How the block comes in: rising (default), from a side, growing, or out of a blur. */
  effect?: TRevealEffect;
  id?: string;
  /** Marks it as the photo of a place, when the whole of it is: see siteImageStyleProps. */
  photo?: "product" | "section" | "block";
}

/**
 * Brings its content in the first time it scrolls into view, then its parts
 * (anything marked data-part) one after the other. What is on screen
 * at load, or seen without JavaScript, is simply there.
 */
const Reveal = ({
  children,
  className,
  delay = 0,
  style,
  id,
  effect = "up",
  photo,
}: Props) => {
  const { ref, phase } = useReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      id={id}
      data-effect={effect}
      data-photo={photo}
      className={`${phase === "waiting" ? base.waiting : ""} ${
        phase === "shown" ? base.shown : ""
      } ${className ?? ""}`}
      style={
        {
          ...style,
          animationDelay: `${delay}s`,
          // Its parts start after it, in turn.
          "--reveal-delay": `${delay}s`,
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
};

export default Reveal;
