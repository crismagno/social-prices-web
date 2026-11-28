/** One place marked on a map: where it is and what it says. */
export interface IStoreSiteMapPin {
  key: string;
  lat: number;
  lng: number;
  /** Its name, shown over it. */
  label: string | null;
  /** A line or two shown when it is picked: an address, opening hours. */
  description: string | null;
  /** Its colour, as #rrggbb; empty, the site's main one. */
  color: string | null;
}

/**
 * A map with the places the owner marked on it. Mirrors the API
 * (store-site-map.ts): change both together.
 */
export interface IStoreSiteMap {
  /** Its height, in pixels. */
  height: number;
  /** Shows every pin at once; off, the centre and the zoom below are used. */
  isAutoFit: boolean;
  centerLat: number;
  centerLng: number;
  zoom: number;
  pins: IStoreSiteMapPin[];
}

export const MAP_LIMITS = {
  height: [200, 900] as [number, number],
  defaultHeight: 420,
  zoom: [2, 18] as [number, number],
  defaultZoom: 12,
  pins: 60,
  label: 80,
  description: 300,
  /** Web maps stop short of the poles. */
  lat: 85,
} as const;

type TRecord = Record<string, unknown>;

const recordOf = (value: unknown): TRecord =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as TRecord)
    : {};

// Words kept as typed while they are being written; the API trims them.
const textOf = (value: unknown, max: number): string | null =>
  typeof value === "string" && value ? value.slice(0, max) : null;

const wholeOf = (
  value: unknown,
  [min, max]: [number, number],
  fallback: number,
): number =>
  typeof value === "number" && Number.isFinite(value)
    ? Math.min(max, Math.max(min, Math.round(value)))
    : fallback;

const degreesOf = (value: unknown, limit: number): number | null =>
  typeof value === "number" &&
  Number.isFinite(value) &&
  Math.abs(value) <= limit
    ? Math.round(value * 1e6) / 1e6
    : null;

const HEX: RegExp = /^#[0-9a-fA-F]{6}$/;

/** A map, whatever was stored: the API checks it the same way. */
export const siteMapOf = (raw: unknown): IStoreSiteMap => {
  const source: TRecord = recordOf(raw);

  const taken: Set<string> = new Set();

  const pins: IStoreSiteMapPin[] = (
    Array.isArray(source.pins) ? source.pins : []
  )
    .map(recordOf)
    .reduce((kept: IStoreSiteMapPin[], pin: TRecord) => {
      const lat: number | null = degreesOf(pin.lat, MAP_LIMITS.lat);
      const lng: number | null = degreesOf(pin.lng, 180);

      if (lat === null || lng === null || kept.length >= MAP_LIMITS.pins) {
        return kept;
      }

      const given: string = typeof pin.key === "string" ? pin.key.trim() : "";

      const key: string =
        /^[A-Za-z0-9_-]{1,40}$/.test(given) && !taken.has(given)
          ? given
          : `p${kept.length}-${taken.size}`;

      taken.add(key);

      return [
        ...kept,
        {
          key,
          lat,
          lng,
          label: textOf(pin.label, MAP_LIMITS.label),
          description: textOf(pin.description, MAP_LIMITS.description),
          color:
            typeof pin.color === "string" && HEX.test(pin.color)
              ? pin.color
              : null,
        },
      ];
    }, []);

  return {
    height: wholeOf(source.height, MAP_LIMITS.height, MAP_LIMITS.defaultHeight),
    isAutoFit: source.isAutoFit !== false,
    centerLat: degreesOf(source.centerLat, MAP_LIMITS.lat) ?? 0,
    centerLng: degreesOf(source.centerLng, 180) ?? 0,
    zoom: wholeOf(source.zoom, MAP_LIMITS.zoom, MAP_LIMITS.defaultZoom),
    pins,
  };
};

/** A new pin at a place, with a key of its own. */
export const newMapPin = (
  lat: number,
  lng: number,
  label: string | null,
): IStoreSiteMapPin => ({
  key: `m${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
  lat: Math.round(lat * 1e6) / 1e6,
  lng: Math.round(lng * 1e6) / 1e6,
  label,
  description: null,
  color: null,
});

/**
 * A latitude and a longitude read from what was typed or pasted: "-23.55,
 * -46.63", as a map service copies them. Nothing when it is not that.
 */
export const parseCoordinates = (
  text: string,
): { lat: number; lng: number } | null => {
  const match: RegExpMatchArray | null = text
    .trim()
    .match(/^(-?\d{1,2}(?:\.\d+)?)\s*[,;\s]\s*(-?\d{1,3}(?:\.\d+)?)$/);

  if (!match) {
    return null;
  }

  const lat: number | null = degreesOf(Number(match[1]), MAP_LIMITS.lat);
  const lng: number | null = degreesOf(Number(match[2]), 180);

  return lat === null || lng === null ? null : { lat, lng };
};

/* ---------- the arithmetic of a web map ---------- */

export const TILE: number = 256;

/** Where a place is on the flat map of a zoom, in pixels from its corner. */
export const toWorld = (
  lat: number,
  lng: number,
  zoom: number,
): { x: number; y: number } => {
  const size: number = TILE * 2 ** zoom;
  const sin: number = Math.sin((lat * Math.PI) / 180);

  return {
    x: ((lng + 180) / 360) * size,
    y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * size,
  };
};

/** The place a point of the flat map of a zoom is. */
export const fromWorld = (
  x: number,
  y: number,
  zoom: number,
): { lat: number; lng: number } => {
  const size: number = TILE * 2 ** zoom;
  const turn: number = Math.PI * (1 - (2 * y) / size);

  return {
    lat: (Math.atan(Math.sinh(turn)) * 180) / Math.PI,
    lng: (x / size) * 360 - 180,
  };
};

/**
 * The centre and the closest zoom that show every pin in a frame of this
 * size, with some room around them. One pin alone is shown close by.
 */
export const fitPins = (
  pins: Pick<IStoreSiteMapPin, "lat" | "lng">[],
  width: number,
  height: number,
): { lat: number; lng: number; zoom: number } | null => {
  if (pins.length === 0) {
    return null;
  }

  const lats: number[] = pins.map((pin) => pin.lat);
  const lngs: number[] = pins.map((pin) => pin.lng);

  const center = {
    lat: (Math.min(...lats) + Math.max(...lats)) / 2,
    lng: (Math.min(...lngs) + Math.max(...lngs)) / 2,
  };

  if (pins.length === 1) {
    return { ...center, zoom: 15 };
  }

  const [min, max] = MAP_LIMITS.zoom;
  const margin: number = 70;

  for (let zoom = 16; zoom > min; zoom--) {
    const a = toWorld(Math.max(...lats), Math.min(...lngs), zoom);
    const b = toWorld(Math.min(...lats), Math.max(...lngs), zoom);

    if (
      Math.abs(b.x - a.x) <= Math.max(60, width - 2 * margin) &&
      Math.abs(b.y - a.y) <= Math.max(60, height - 2 * margin)
    ) {
      return { ...center, zoom: Math.min(max, zoom) };
    }
  }

  return { ...center, zoom: min };
};
