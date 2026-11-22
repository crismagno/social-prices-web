"use client";

import { CSSProperties, ReactNode } from "react";

import base from "./site-base.module.css";
import useReveal from "./useReveal";

interface Props {
  children: ReactNode;
  className?: string;
  /** Seconds to wait once in view, to stagger siblings. */
  delay?: number;
  style?: CSSProperties;
  id?: string;
}

/**
 * Fades its content up the first time it scrolls into view. What is on screen
 * at load, or seen without JavaScript, is simply there.
 */
const Reveal = ({ children, className, delay = 0, style, id }: Props) => {
  const { ref, phase } = useReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      id={id}
      className={`${phase === "waiting" ? base.waiting : ""} ${
        phase === "shown" ? base.shown : ""
      } ${className ?? ""}`}
      style={{ ...style, animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
};

export default Reveal;
