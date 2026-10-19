"use client";

import { useEffect, useRef } from "react";

const SIZE: number = 160;

interface Props {
  // An object URL of the .tgs file, which is a gzipped Lottie animation.
  url: string;
}

export default function AnimatedSticker({ url }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let isCancelled: boolean = false;
    let destroy: (() => void) | undefined;

    const play = async (): Promise<void> => {
      const compressed: Blob = await (await fetch(url)).blob();

      const json: string = await new Response(
        compressed.stream().pipeThrough(new DecompressionStream("gzip")),
      ).text();

      const { default: lottie } = await import("lottie-web");

      if (isCancelled || !containerRef.current) {
        return;
      }

      const animation = lottie.loadAnimation({
        container: containerRef.current,
        renderer: "svg",
        loop: true,
        autoplay: true,
        animationData: JSON.parse(json),
      });

      destroy = () => animation.destroy();
    };

    play().catch(() => undefined);

    return () => {
      isCancelled = true;
      destroy?.();
    };
  }, [url]);

  return <div ref={containerRef} style={{ width: SIZE, height: SIZE }} />;
}
