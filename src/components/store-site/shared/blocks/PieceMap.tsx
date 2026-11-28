"use client";

import { PointerEvent, useEffect, useMemo, useRef, useState } from "react";

import {
  IStoreSiteMap,
  IStoreSiteMapPin,
  MAP_LIMITS,
  TILE,
  fitPins,
  fromWorld,
  toWorld,
} from "../../../../shared/business/store-sites/store-site-map";
import useSiteT from "../useSiteT";
import { IBlockProps } from "./blockTypes";
import styles from "./PieceMap.module.css";

/** Where the map is looking: what dragging and the zoom buttons change. */
interface IView {
  lat: number;
  lng: number;
  zoom: number;
}

interface ITile {
  key: string;
  src: string;
  left: number;
  top: number;
}

/** The tiles of OpenStreetMap: free to show, with their credit beside them. */
const TILE_URL = "https://tile.openstreetmap.org";

interface IMapViewProps {
  map: IStoreSiteMap | null;
  /**
   * It takes the whole of the box it is in (an element of a free canvas)
   * instead of the height the map was given.
   */
  isFill?: boolean;
}

/**
 * A map with the places the owner marked: it opens showing all of them (or
 * the centre the owner chose), can be dragged and zoomed, and a pin that is
 * picked says its name and what was written about it.
 */
export const MapView = ({ map, isFill = false }: IMapViewProps) => {
  const t = useSiteT();

  const frameRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number; view: IView } | null>(null);

  const [width, setWidth] = useState<number>(0);
  const [boxHeight, setBoxHeight] = useState<number>(0);
  const [moved, setMoved] = useState<IView | null>(null);
  const [openKey, setOpenKey] = useState<string | null>(null);

  // Its height: the box's own when it fills one, else the one it was given.
  const height: number = isFill ? boxHeight : (map?.height ?? 0);

  // The frame's own size: the map fills it, whatever the screen.
  useEffect(() => {
    const frame: HTMLDivElement | null = frameRef.current;

    if (!frame) {
      return;
    }

    const read = (): void => {
      setWidth(frame.clientWidth);
      setBoxHeight(frame.clientHeight);
    };

    read();

    const observer = new ResizeObserver(read);

    observer.observe(frame);

    return () => observer.disconnect();
  }, []);

  // Where it opens: every pin in sight, or the owner's own centre and zoom.
  const start: IView | null = useMemo(() => {
    if (!map) {
      return null;
    }

    const fitted =
      map.isAutoFit && width > 0 && height > 0
        ? fitPins(map.pins, width, height)
        : null;

    return fitted ?? { lat: map.centerLat, lng: map.centerLng, zoom: map.zoom };
  }, [map, width, height]);

  // What the owner changes in the editor is shown at once: a view the
  // visitor dragged to belongs to the map as it was.
  useEffect(() => {
    setMoved(null);
  }, [map]);

  if (!map || !start) {
    return null;
  }

  const view: IView = moved ?? start;

  const center = toWorld(view.lat, view.lng, view.zoom);
  const left: number = center.x - width / 2;
  const top: number = center.y - height / 2;
  const count: number = 2 ** view.zoom;

  const tiles: ITile[] = [];

  if (width > 0) {
    for (
      let x = Math.floor(left / TILE);
      x <= Math.floor((left + width) / TILE);
      x++
    ) {
      for (
        let y = Math.max(0, Math.floor(top / TILE));
        y <= Math.min(count - 1, Math.floor((top + height) / TILE));
        y++
      ) {
        // The world goes round: past its last tile comes its first again.
        const wrapped: number = ((x % count) + count) % count;

        tiles.push({
          key: `${view.zoom}/${x}/${y}`,
          src: `${TILE_URL}/${view.zoom}/${wrapped}/${y}.png`,
          left: x * TILE - left,
          top: y * TILE - top,
        });
      }
    }
  }

  const zoomBy = (step: number): void =>
    setMoved({
      ...view,
      zoom: Math.min(
        MAP_LIMITS.zoom[1],
        Math.max(MAP_LIMITS.zoom[0], view.zoom + step),
      ),
    });

  const begin = (event: PointerEvent<HTMLDivElement>): void => {
    if (event.button !== 0) {
      return;
    }

    dragRef.current = { x: event.clientX, y: event.clientY, view };

    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // A pointer that cannot be held still drags while it stays over it.
    }
  };

  const drag = (event: PointerEvent<HTMLDivElement>): void => {
    const from = dragRef.current;

    if (!from) {
      return;
    }

    const origin = toWorld(from.view.lat, from.view.lng, from.view.zoom);

    const next = fromWorld(
      origin.x - (event.clientX - from.x),
      origin.y - (event.clientY - from.y),
      from.view.zoom,
    );

    setMoved({
      zoom: from.view.zoom,
      lat: Math.max(-MAP_LIMITS.lat, Math.min(MAP_LIMITS.lat, next.lat)),
      lng: next.lng,
    });
  };

  const end = (): void => {
    dragRef.current = null;
  };

  return (
    <div
      ref={frameRef}
      className={styles.map}
      data-fill={isFill ? "" : undefined}
      style={isFill ? undefined : { height }}
      onPointerDown={begin}
      onPointerMove={drag}
      onPointerUp={end}
      onPointerCancel={end}
    >
      {tiles.map((tile: ITile) => (
        // Plain images: the tiles come ready from the map's own server.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={tile.key}
          className={styles.tile}
          src={tile.src}
          alt=""
          draggable={false}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          style={{ left: tile.left, top: tile.top }}
        />
      ))}

      {width > 0 &&
        map.pins.map((pin: IStoreSiteMapPin) => {
          const at = toWorld(pin.lat, pin.lng, view.zoom);
          const isOpen: boolean = openKey === pin.key;

          return (
            <div
              key={pin.key}
              className={styles.pin}
              data-open={isOpen ? "" : undefined}
              style={{
                left: at.x - left,
                top: at.y - top,
                color: pin.color ?? "var(--site-primary)",
              }}
            >
              {isOpen && (pin.label || pin.description) && (
                <div className={styles.card} role="status">
                  {pin.label && <strong>{pin.label}</strong>}
                  {pin.description && <span>{pin.description}</span>}
                </div>
              )}
              <button
                type="button"
                className={styles.marker}
                aria-label={pin.label ?? t("storeSite.public.map.pin")}
                aria-expanded={isOpen}
                // A press on a pin is not the start of a drag of the map.
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => setOpenKey(isOpen ? null : pin.key)}
              >
                <svg viewBox="0 0 24 32" aria-hidden="true">
                  <path d="M12 0C5.4 0 0 5.3 0 11.9 0 20.8 12 32 12 32s12-11.2 12-20.1C24 5.3 18.6 0 12 0Z" />
                  <circle cx="12" cy="12" r="4.6" />
                </svg>
              </button>
              {pin.label && !isOpen && (
                <span className={styles.name}>{pin.label}</span>
              )}
            </div>
          );
        })}

      <div className={styles.zoom}>
        <button
          type="button"
          aria-label={t("storeSite.public.map.zoomIn")}
          disabled={view.zoom >= MAP_LIMITS.zoom[1]}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => zoomBy(1)}
        >
          +
        </button>
        <button
          type="button"
          aria-label={t("storeSite.public.map.zoomOut")}
          disabled={view.zoom <= MAP_LIMITS.zoom[0]}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => zoomBy(-1)}
        >
          −
        </button>
      </div>

      <a
        className={styles.credit}
        href="https://www.openstreetmap.org/copyright"
        target="_blank"
        rel="noreferrer"
        onPointerDown={(event) => event.stopPropagation()}
      >
        © OpenStreetMap
      </a>
    </div>
  );
};

/** The map section: the map, as tall as the owner made it. */
const PieceMap = ({ block }: IBlockProps) => (
  <MapView map={block.settings.map} />
);

export default PieceMap;
