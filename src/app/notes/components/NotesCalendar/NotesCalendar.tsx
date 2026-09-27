"use client";

import { useEffect, useState } from "react";

import { Badge, Calendar, Card, Segmented, Spin } from "antd";
import { Dayjs } from "dayjs";

import { ExpandOutlined, ShrinkOutlined } from "@ant-design/icons";

import useLanguageData from "../../../../data/context/language/useLanguageData";
import { INoteCalendarMarker } from "../../../../shared/business/notes/notes.types";

interface Props {
  markers: INoteCalendarMarker[];
  isLoading: boolean;
  selectedDate: Dayjs | null;
  onSelectDate: (date: Dayjs | null) => void;
  onPanelChange: (date: Dayjs) => void;
}

const SIZE_STORAGE_KEY = "notes.calendarSize";

// Remembered across visits, but only ever read on the client: localStorage
// does not exist during server rendering.
const getInitialIsFullscreen = (): boolean => {
  try {
    return localStorage.getItem(SIZE_STORAGE_KEY) !== "small";
  } catch {
    return true;
  }
};

export const NotesCalendar: React.FC<Props> = ({
  markers,
  isLoading,
  selectedDate,
  onSelectDate,
  onPanelChange,
}) => {
  const { t } = useLanguageData();

  const [isFullscreen, setIsFullscreen] = useState<boolean>(true);

  // Read the stored size only after mount, so the server-rendered markup
  // (always "large") matches the client's first render and React does not
  // complain about a hydration mismatch.
  useEffect(() => {
    setIsFullscreen(getInitialIsFullscreen());
  }, []);

  const changeSize = (value: "large" | "small"): void => {
    const nextIsFullscreen: boolean = value === "large";

    setIsFullscreen(nextIsFullscreen);

    try {
      localStorage.setItem(SIZE_STORAGE_KEY, value);
    } catch {
      // Private browsing or a blocked store: the choice just won't persist.
    }
  };

  const markerByDate: Record<string, INoteCalendarMarker> = Object.fromEntries(
    markers.map((marker) => [marker.date, marker]),
  );

  return (
    <Card
      className="mb-4"
      title={t("notes.calendar")}
      extra={
        <Segmented
          value={isFullscreen ? "large" : "small"}
          onChange={(value) => changeSize(value as "large" | "small")}
          options={[
            {
              value: "small",
              icon: <ShrinkOutlined />,
              label: t("notes.smallCalendar"),
            },
            {
              value: "large",
              icon: <ExpandOutlined />,
              label: t("notes.largeCalendar"),
            },
          ]}
        />
      }
    >
      {/* Spin overlays a spinner without unmounting its children. Card's own
          `loading` prop replaces the whole body with a skeleton instead, which
          would remount the Calendar on every marker refetch and silently
          reset its month/year navigation back to today. */}
      <Spin spinning={isLoading}>
        <Calendar
          fullscreen={isFullscreen}
          onSelect={(date, info) => {
            if (info.source !== "date") {
              return;
            }

            onSelectDate(selectedDate?.isSame(date, "day") ? null : date);
          }}
          onPanelChange={(date) => onPanelChange(date)}
          cellRender={(date, info) => {
            if (info.type !== "date") {
              return info.originNode;
            }

            const marker = markerByDate[date.format("YYYY-MM-DD")];

            if (!marker) {
              return null;
            }

            return (
              <div className="flex flex-wrap gap-1 justify-center mt-1">
                {marker.pending > 0 && (
                  <Badge
                    count={marker.pending}
                    color="gold"
                    title={t("notes.statusPending")}
                  />
                )}

                {marker.completed > 0 && (
                  <Badge
                    count={marker.completed}
                    color="green"
                    title={t("notes.statusCompleted")}
                  />
                )}

                {marker.colors.length > 0 && (
                  <div className="flex gap-0.5" title={t("notes.color")}>
                    {marker.colors.map((color) => (
                      <span
                        key={color}
                        className="h-2 w-2 rounded-full border border-black/10"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          }}
        />
      </Spin>
    </Card>
  );
};
