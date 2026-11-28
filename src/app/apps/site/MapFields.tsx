"use client";

import { useState } from "react";

import {
  Button,
  Card,
  ColorPicker,
  Form,
  Input,
  InputNumber,
  Slider,
  Space,
  Switch,
} from "antd";

import {
  DeleteOutlined,
  EnvironmentOutlined,
  SearchOutlined,
} from "@ant-design/icons";

import handleClientError from "../../../components/common/HandleClientError/HandleClientError";
import useLanguageData from "../../../data/context/language/useLanguageData";
import { IStoreSiteBlock } from "../../../shared/business/store-sites/store-site-blocks";
import {
  IStoreSiteMap,
  IStoreSiteMapPin,
  MAP_LIMITS,
  newMapPin,
  parseCoordinates,
} from "../../../shared/business/store-sites/store-site-map";

interface Props {
  section: IStoreSiteBlock;
  /** Applied to the section as it is then. */
  onChange: (
    change: (section: IStoreSiteBlock) => Partial<IStoreSiteBlock>,
  ) => void;
}

const KEY = "storeSite.editor.builder.map";

/** Finds an address on the map of OpenStreetMap: its first match, or none. */
const findAddress = async (
  query: string,
): Promise<{ lat: number; lng: number; name: string } | null> => {
  const response: Response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
      query,
    )}`,
    { headers: { Accept: "application/json" } },
  );

  if (!response.ok) {
    throw new Error(String(response.status));
  }

  const [found] = (await response.json()) as {
    lat: string;
    lon: string;
    display_name: string;
  }[];

  return found
    ? {
        lat: Number(found.lat),
        lng: Number(found.lon),
        name: found.display_name,
      }
    : null;
};

/**
 * A map in the panel: its height, how it opens, and its pins. A pin is added
 * by an address (looked up on OpenStreetMap) or by a latitude and longitude
 * pasted from any map service.
 */
const MapFields = ({ section, onChange }: Props) => {
  const { t } = useLanguageData();

  const [query, setQuery] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const map: IStoreSiteMap | null = section.settings.map;

  if (!map) {
    return null;
  }

  // From the section as it is when applied, like every change of the editor.
  const setMap = (
    change: (current: IStoreSiteMap) => Partial<IStoreSiteMap>,
  ): void =>
    onChange((current) => {
      const now: IStoreSiteMap = current.settings.map ?? map;

      return {
        settings: { ...current.settings, map: { ...now, ...change(now) } },
      };
    });

  const setPin = (key: string, patch: Partial<IStoreSiteMapPin>): void =>
    setMap((current) => ({
      pins: current.pins.map((pin: IStoreSiteMapPin) =>
        pin.key === key ? { ...pin, ...patch } : pin,
      ),
    }));

  const isFull: boolean = map.pins.length >= MAP_LIMITS.pins;

  const add = async (): Promise<void> => {
    const typed: string = query.trim();

    if (!typed || isFull) {
      return;
    }

    // A latitude and longitude are used as they are; anything else is an
    // address to look up.
    const coordinates = parseCoordinates(typed);

    if (coordinates) {
      setMap((current) => ({
        pins: [
          ...current.pins,
          newMapPin(coordinates.lat, coordinates.lng, null),
        ],
      }));
      setQuery("");

      return;
    }

    try {
      setIsSearching(true);

      const found = await findAddress(typed);

      if (!found) {
        handleClientError(t(`${KEY}.notFound`), 4);

        return;
      }

      setMap((current) => ({
        pins: [
          ...current.pins,
          {
            ...newMapPin(
              found.lat,
              found.lng,
              typed.slice(0, MAP_LIMITS.label),
            ),
            description: found.name.slice(0, MAP_LIMITS.description),
          },
        ],
      }));
      setQuery("");
    } catch {
      handleClientError(t(`${KEY}.searchFailed`), 4);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Space direction="vertical" className="w-full">
      <Form layout="vertical">
        <Form.Item label={t(`${KEY}.height`)}>
          <Slider
            min={MAP_LIMITS.height[0]}
            max={MAP_LIMITS.height[1]}
            step={10}
            tooltip={{ formatter: (value?: number) => `${value ?? 0}px` }}
            value={map.height}
            onChange={(height: number) => setMap(() => ({ height }))}
          />
        </Form.Item>

        <label className="mb-3 flex items-center justify-between gap-2">
          <span>{t(`${KEY}.isAutoFit`)}</span>
          <Switch
            size="small"
            checked={map.isAutoFit}
            onChange={(isAutoFit: boolean) =>
              // Left to itself, it starts from where the first pin is.
              setMap((current) => ({
                isAutoFit,
                ...(isAutoFit || !current.pins[0]
                  ? {}
                  : {
                      centerLat: current.pins[0].lat,
                      centerLng: current.pins[0].lng,
                    }),
              }))
            }
          />
        </label>

        {!map.isAutoFit && (
          <>
            <Form.Item label={t(`${KEY}.zoom`)}>
              <Slider
                min={MAP_LIMITS.zoom[0]}
                max={MAP_LIMITS.zoom[1]}
                value={map.zoom}
                onChange={(zoom: number) => setMap(() => ({ zoom }))}
              />
            </Form.Item>
            <Form.Item label={t(`${KEY}.center`)}>
              <div className="grid grid-cols-2 gap-2">
                <InputNumber
                  className="w-full"
                  addonBefore="Lat"
                  min={-MAP_LIMITS.lat}
                  max={MAP_LIMITS.lat}
                  step={0.001}
                  value={map.centerLat}
                  onChange={(value: number | null) =>
                    setMap(() => ({ centerLat: value ?? 0 }))
                  }
                />
                <InputNumber
                  className="w-full"
                  addonBefore="Lng"
                  min={-180}
                  max={180}
                  step={0.001}
                  value={map.centerLng}
                  onChange={(value: number | null) =>
                    setMap(() => ({ centerLng: value ?? 0 }))
                  }
                />
              </div>
            </Form.Item>
          </>
        )}
      </Form>

      <Card size="small" title={t(`${KEY}.addPin`)}>
        <Space.Compact className="w-full">
          <Input
            allowClear
            placeholder={t(`${KEY}.addPlaceholder`)}
            value={query}
            disabled={isFull}
            onChange={(event) => setQuery(event.target.value)}
            onPressEnter={add}
          />
          <Button
            type="primary"
            icon={<SearchOutlined />}
            loading={isSearching}
            disabled={isFull || !query.trim()}
            onClick={add}
          >
            {t(`${KEY}.add`)}
          </Button>
        </Space.Compact>
        <p className="mt-2 mb-0 text-xs opacity-70">{t(`${KEY}.addHint`)}</p>
      </Card>

      {map.pins.map((pin: IStoreSiteMapPin, index: number) => (
        <Card
          key={pin.key}
          size="small"
          title={
            <span className="flex items-center gap-2">
              <EnvironmentOutlined style={{ color: pin.color ?? undefined }} />
              <span className="truncate">
                {pin.label?.trim() || `${t(`${KEY}.pin`)} ${index + 1}`}
              </span>
            </span>
          }
          extra={
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              aria-label={t(`${KEY}.removePin`)}
              onClick={() =>
                setMap((current) => ({
                  pins: current.pins.filter(
                    (each: IStoreSiteMapPin) => each.key !== pin.key,
                  ),
                }))
              }
            />
          }
        >
          <Form layout="vertical">
            <Form.Item label={t(`${KEY}.label`)} className="mb-2">
              <Input
                maxLength={MAP_LIMITS.label}
                value={pin.label ?? ""}
                onChange={(event) =>
                  setPin(pin.key, { label: event.target.value || null })
                }
              />
            </Form.Item>
            <Form.Item label={t(`${KEY}.description`)} className="mb-2">
              <Input.TextArea
                autoSize={{ minRows: 1, maxRows: 4 }}
                maxLength={MAP_LIMITS.description}
                value={pin.description ?? ""}
                onChange={(event) =>
                  setPin(pin.key, { description: event.target.value || null })
                }
              />
            </Form.Item>
            <div className="grid grid-cols-2 gap-2">
              <InputNumber
                className="w-full"
                addonBefore="Lat"
                min={-MAP_LIMITS.lat}
                max={MAP_LIMITS.lat}
                step={0.0001}
                value={pin.lat}
                onChange={(value: number | null) =>
                  setPin(pin.key, { lat: value ?? pin.lat })
                }
              />
              <InputNumber
                className="w-full"
                addonBefore="Lng"
                min={-180}
                max={180}
                step={0.0001}
                value={pin.lng}
                onChange={(value: number | null) =>
                  setPin(pin.key, { lng: value ?? pin.lng })
                }
              />
            </div>
            <div className="mt-2 flex items-center justify-between gap-2">
              <span>{t(`${KEY}.color`)}</span>
              <ColorPicker
                allowClear
                disabledAlpha
                value={pin.color ?? undefined}
                showText={() =>
                  pin.color ?? t("storeSite.editor.pages.colorOfSite")
                }
                onChangeComplete={(picked) =>
                  setPin(pin.key, { color: picked.toHexString().slice(0, 7) })
                }
                onClear={() => setPin(pin.key, { color: null })}
              />
            </div>
          </Form>
        </Card>
      ))}
    </Space>
  );
};

export default MapFields;
