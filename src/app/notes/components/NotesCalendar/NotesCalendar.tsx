"use client";

import { useEffect, useMemo, useState } from "react";

import { Badge, Button, Calendar, Card, Segmented, Spin } from "antd";
import dayjs, { Dayjs } from "dayjs";

import {
  ExpandOutlined,
  LeftOutlined,
  RightOutlined,
  ShrinkOutlined,
} from "@ant-design/icons";

import useLanguageData from "../../../../data/context/language/useLanguageData";
import { LanguageEnum } from "../../../../data/context/language/LanguageContext";
import { INote } from "../../../../shared/business/notes/note.interface";
import {
  INoteCalendarMarker,
  INoteFilters,
} from "../../../../shared/business/notes/notes.types";
import { useNotesInRange } from "../../useNotesInRange";
import { NotesTimeline } from "./NotesTimeline";

/** How much of time the calendar shows at once. */
type TView = "year" | "month" | "week" | "day";

const VIEWS: TView[] = ["year", "month", "week", "day"];

interface Props {
  markers: INoteCalendarMarker[];
  isLoading: boolean;
  selectedDate: Dayjs | null;
  onSelectDate: (date: Dayjs | null) => void;
  onPanelChange: (date: Dayjs) => void;
  /** What the grid searches and filters by: the hours show the same notes. */
  search?: string;
  filters: INoteFilters;
  /** Changes when the notes changed, so the hours are asked again. */
  reloadKey: number;
  onOpenNote: (note: INote) => void;
  onCreateAt: (date: Dayjs) => void;
}

const SIZE_STORAGE_KEY = "notes.calendarSize";

const VIEW_STORAGE_KEY = "notes.calendarView";

const getInitialView = (): TView => {
  try {
    const stored = localStorage.getItem(VIEW_STORAGE_KEY) as TView | null;

    return stored && VIEWS.includes(stored) ? stored : "month";
  } catch {
    return "month";
  }
};

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
  search,
  filters,
  reloadKey,
  onOpenNote,
  onCreateAt,
}) => {
  const { t, language } = useLanguageData();

  const locale: string = language === LanguageEnum.ptBR ? "pt-BR" : "en-US";

  const [isFullscreen, setIsFullscreen] = useState<boolean>(true);

  const [view, setView] = useState<TView>("month");

  // The moment the calendar is around: the month, week or day it shows.
  const [cursor, setCursor] = useState<Dayjs>(dayjs());

  const isHours: boolean = view === "week" || view === "day";

  const days: Dayjs[] = useMemo(() => {
    if (view === "day") {
      return [cursor.startOf("day")];
    }

    const start: Dayjs = cursor.startOf("week");

    return Array.from({ length: 7 }, (_, index: number) =>
      start.add(index, "day"),
    );
  }, [view, cursor]);

  const range = useMemo(
    () => ({
      start: days[0].startOf("day").toISOString(),
      end: days[days.length - 1].endOf("day").toISOString(),
    }),
    [days],
  );

  // A day picked on the month narrows the grid, not the hours.
  const hourFilters: INoteFilters = useMemo(() => {
    const { rangeDate: _ignored, ...rest } = filters;

    return rest;
  }, [filters]);

  const {
    isLoading: isLoadingHours,
    notes,
    refetch,
  } = useNotesInRange({
    ...range,
    search,
    filters: hourFilters,
    isEnabled: isHours,
  });

  useEffect(() => {
    if (reloadKey) {
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey]);

  const changeView = (value: TView): void => {
    setView(value);

    // The day picked on the month is where the week or the day opens.
    if ((value === "week" || value === "day") && selectedDate) {
      setCursor(selectedDate);
    }

    try {
      localStorage.setItem(VIEW_STORAGE_KEY, value);
    } catch {
      // The choice just won't persist.
    }
  };

  const step = (direction: 1 | -1): void =>
    setCursor((current: Dayjs) =>
      current.add(direction, view === "day" ? "day" : "week"),
    );

  const periodLabel: string = (() => {
    const first: Date = days[0].toDate();
    const last: Date = days[days.length - 1].toDate();

    if (view === "day") {
      return new Intl.DateTimeFormat(locale, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(first);
    }

    return new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).formatRange(first, last);
  })();

  // Read the stored size only after mount, so the server-rendered markup
  // (always "large") matches the client's first render and React does not
  // complain about a hydration mismatch.
  useEffect(() => {
    setIsFullscreen(getInitialIsFullscreen());
    setView(getInitialView());
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
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Segmented
            value={view}
            onChange={(value) => changeView(value as TView)}
            options={VIEWS.map((value: TView) => ({
              value,
              label: t(`notes.views.${value}`),
            }))}
          />

          {!isHours && (
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
          )}
        </div>
      }
    >
      {isHours ? (
        <Spin spinning={isLoadingHours}>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Button onClick={() => setCursor(dayjs())}>
              {t("notes.views.today")}
            </Button>
            <Button
              icon={<LeftOutlined />}
              aria-label={t("notes.views.previous")}
              onClick={() => step(-1)}
            />
            <Button
              icon={<RightOutlined />}
              aria-label={t("notes.views.next")}
              onClick={() => step(1)}
            />
            <span className="ml-1 text-base font-semibold capitalize">
              {periodLabel}
            </span>
          </div>

          <NotesTimeline
            days={days}
            notes={notes}
            locale={locale}
            onOpenNote={onOpenNote}
            onCreateAt={onCreateAt}
            onOpenDay={
              view === "week"
                ? (day: Dayjs) => {
                    setCursor(day);
                    changeView("day");
                  }
                : undefined
            }
          />
        </Spin>
      ) : (
        <>
          {/* Spin overlays a spinner without unmounting its children. Card's own
          `loading` prop replaces the whole body with a skeleton instead, which
          would remount the Calendar on every marker refetch and silently
          reset its month/year navigation back to today. */}
          <Spin spinning={isLoading}>
            <Calendar
              fullscreen={isFullscreen}
              mode={view === "year" ? "year" : "month"}
              value={cursor}
              onSelect={(date, info) => {
                // A month picked on the year opens that month.
                if (info.source === "month" && view === "year") {
                  setCursor(date);
                  onPanelChange(date);
                  changeView("month");

                  return;
                }

                if (info.source !== "date") {
                  return;
                }

                onSelectDate(selectedDate?.isSame(date, "day") ? null : date);
              }}
              onPanelChange={(date, mode) => {
                setCursor(date);
                onPanelChange(date);

                if (mode !== view) {
                  changeView(mode);
                }
              }}
              onChange={(date) => setCursor(date)}
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
        </>
      )}
    </Card>
  );
};
