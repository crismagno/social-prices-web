"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { theme } from "antd";
import dayjs, { Dayjs } from "dayjs";

import { CheckCircleFilled } from "@ant-design/icons";

import { INote } from "../../../../shared/business/notes/note.interface";
import NotesEnum from "../../../../shared/business/notes/notes.enum";

interface Props {
  /** The days shown side by side: seven for a week, one for a day. */
  days: Dayjs[];
  notes: INote[];
  locale: string;
  onOpenNote: (note: INote) => void;
  /** A free moment clicked: a new note can start there. */
  onCreateAt: (date: Dayjs) => void;
  onOpenDay?: (day: Dayjs) => void;
}

/** How tall an hour is: a half hour is the smallest slot a click picks. */
const HOUR_HEIGHT: number = 56;

/** How tall a note is drawn; notes have a moment, not a length. */
const NOTE_HEIGHT: number = 40;

const HOURS: number[] = Array.from({ length: 24 }, (_, hour: number) => hour);

interface IPlaced {
  note: INote;
  top: number;
  column: number;
  columns: number;
}

const topOf = (date: Dayjs): number =>
  ((date.hour() * 60 + date.minute()) / 60) * HOUR_HEIGHT;

/**
 * The notes of one day, each at its moment. Notes that would cover each other
 * share the width, side by side.
 */
const place = (notes: INote[]): IPlaced[] => {
  const sorted: IPlaced[] = notes
    .map((note: INote) => ({
      note,
      top: topOf(dayjs(note.date)),
      column: 0,
      columns: 1,
    }))
    .sort((a: IPlaced, b: IPlaced) => a.top - b.top);

  let group: IPlaced[] = [];
  let groupEnd: number = -Infinity;

  const closeGroup = (): void => {
    const columns: number =
      Math.max(0, ...group.map((item: IPlaced) => item.column)) + 1;

    group.forEach((item: IPlaced) => (item.columns = columns));
    group = [];
  };

  for (const item of sorted) {
    if (item.top >= groupEnd) {
      closeGroup();
    }

    // The first column whose last note already ended.
    const taken: Set<number> = new Set(
      group
        .filter((other: IPlaced) => other.top + NOTE_HEIGHT > item.top)
        .map((other: IPlaced) => other.column),
    );

    let column: number = 0;

    while (taken.has(column)) {
      column++;
    }

    item.column = column;
    group.push(item);
    groupEnd = Math.max(groupEnd, item.top + NOTE_HEIGHT);
  }

  closeGroup();

  return sorted;
};

/**
 * The hours of one or more days, with each note at its hour and minute.
 * Clicking a free half hour starts a note there.
 */
export const NotesTimeline: React.FC<Props> = ({
  days,
  notes,
  locale,
  onOpenNote,
  onCreateAt,
  onOpenDay,
}) => {
  const { token } = theme.useToken();

  const scrollRef = useRef<HTMLDivElement>(null);

  // The red line of now moves with the clock.
  const [now, setNow] = useState<Dayjs>(dayjs());

  useEffect(() => {
    const timer = setInterval(() => setNow(dayjs()), 60_000);

    return () => clearInterval(timer);
  }, []);

  const byDay: Map<string, IPlaced[]> = useMemo(() => {
    const map: Map<string, IPlaced[]> = new Map();

    for (const day of days) {
      map.set(
        day.format("YYYY-MM-DD"),
        place(
          notes.filter((note: INote) => dayjs(note.date).isSame(day, "day")),
        ),
      );
    }

    return map;
  }, [days, notes]);

  const firstDay: string = days[0]?.format("YYYY-MM-DD") ?? "";

  // Opens on the first note of the period, else a little before now or at the
  // start of the working day.
  useEffect(() => {
    const tops: number[] = notes.map((note: INote) => topOf(dayjs(note.date)));
    const isNowShown: boolean = days.some((day: Dayjs) =>
      day.isSame(dayjs(), "day"),
    );

    const target: number = tops.length
      ? Math.min(...tops)
      : isNowShown
        ? topOf(dayjs())
        : 8 * HOUR_HEIGHT;

    scrollRef.current?.scrollTo({ top: Math.max(0, target - HOUR_HEIGHT) });
    // Only when the period changes, not on every refetch of its notes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstDay, days.length]);

  const weekday = new Intl.DateTimeFormat(locale, { weekday: "short" });
  const time = new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });

  const gutter: string = "56px";
  const columns: string = `${gutter} repeat(${days.length}, minmax(0, 1fr))`;

  const createAt = (
    day: Dayjs,
    event: React.MouseEvent<HTMLDivElement>,
  ): void => {
    const rect: DOMRect = event.currentTarget.getBoundingClientRect();
    const minutes: number = ((event.clientY - rect.top) / HOUR_HEIGHT) * 60;
    // To the half hour clicked.
    const slot: number = Math.floor(minutes / 30) * 30;

    onCreateAt(day.startOf("day").add(slot, "minute"));
  };

  return (
    <div
      className="overflow-hidden rounded-lg"
      style={{ border: `1px solid ${token.colorBorderSecondary}` }}
    >
      {/* The days. */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: columns,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
          background: token.colorFillQuaternary,
        }}
      >
        <div />
        {days.map((day: Dayjs) => {
          const isToday: boolean = day.isSame(now, "day");

          return (
            <button
              key={day.format("YYYY-MM-DD")}
              type="button"
              disabled={!onOpenDay}
              onClick={() => onOpenDay?.(day)}
              className="flex flex-col items-center gap-0.5 border-0 bg-transparent py-2 disabled:cursor-default enabled:cursor-pointer"
              style={{ borderLeft: `1px solid ${token.colorBorderSecondary}` }}
            >
              <span
                className="text-xs uppercase"
                style={{ color: token.colorTextSecondary }}
              >
                {weekday.format(day.toDate())}
              </span>
              <span
                className="grid h-8 w-8 place-items-center rounded-full text-base font-semibold"
                style={
                  isToday
                    ? { background: token.colorPrimary, color: "#fff" }
                    : undefined
                }
              >
                {day.date()}
              </span>
            </button>
          );
        })}
      </div>

      {/* The hours. */}
      <div ref={scrollRef} className="max-h-[620px] overflow-y-auto">
        <div
          className="relative grid"
          style={{ gridTemplateColumns: columns, height: HOUR_HEIGHT * 24 }}
        >
          <div className="relative">
            {HOURS.map((hour: number) => (
              <span
                key={hour}
                className="absolute right-2 -translate-y-1/2 text-[11px]"
                style={{
                  top: hour * HOUR_HEIGHT,
                  color: token.colorTextTertiary,
                }}
              >
                {hour === 0 ? "" : `${String(hour).padStart(2, "0")}:00`}
              </span>
            ))}
          </div>

          {days.map((day: Dayjs) => {
            const key: string = day.format("YYYY-MM-DD");
            const isToday: boolean = day.isSame(now, "day");

            return (
              <div
                key={key}
                role="presentation"
                onClick={(event) => createAt(day, event)}
                className="relative cursor-cell"
                style={{
                  borderLeft: `1px solid ${token.colorBorderSecondary}`,
                  background: isToday ? token.colorPrimaryBg : undefined,
                  // A line on each hour, a fainter one on each half.
                  backgroundImage: `repeating-linear-gradient(to bottom, ${token.colorBorderSecondary} 0 1px, transparent 1px ${HOUR_HEIGHT / 2}px, ${token.colorFillSecondary} ${HOUR_HEIGHT / 2}px ${HOUR_HEIGHT / 2 + 1}px, transparent ${HOUR_HEIGHT / 2 + 1}px ${HOUR_HEIGHT}px)`,
                }}
              >
                {isToday && (
                  <div
                    className="pointer-events-none absolute left-0 right-0 z-20"
                    style={{ top: topOf(now) }}
                  >
                    <div
                      className="absolute -left-1 -top-1 h-2 w-2 rounded-full"
                      style={{ background: token.colorError }}
                    />
                    <div
                      className="h-0.5"
                      style={{ background: token.colorError }}
                    />
                  </div>
                )}

                {byDay.get(key)?.map((item: IPlaced) => {
                  const color: string = item.note.color ?? token.colorPrimary;
                  const isDone: boolean =
                    item.note.status === NotesEnum.Status.COMPLETED;
                  const isCancelled: boolean =
                    item.note.status === NotesEnum.Status.CANCELLED;
                  const width: number = 100 / item.columns;

                  return (
                    <button
                      key={item.note._id}
                      type="button"
                      title={`${time.format(new Date(item.note.date))} · ${item.note.title}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        onOpenNote(item.note);
                      }}
                      className="absolute z-10 flex cursor-pointer flex-col overflow-hidden rounded-md border-0 px-1.5 py-0.5 text-left shadow-sm transition-shadow hover:z-30 hover:shadow-md"
                      style={{
                        top: item.top + 1,
                        height: NOTE_HEIGHT - 2,
                        left: `calc(${item.column * width}% + 2px)`,
                        width: `calc(${width}% - 4px)`,
                        borderLeft: `3px solid ${color}`,
                        background: token.colorBgElevated,
                        backgroundImage: `linear-gradient(${color}22, ${color}22)`,
                        opacity: isCancelled ? 0.5 : 1,
                      }}
                    >
                      <span
                        className="flex items-center gap-1 text-[11px] font-semibold leading-4"
                        style={{ color: token.colorTextSecondary }}
                      >
                        {time.format(new Date(item.note.date))}
                        {isDone && (
                          <CheckCircleFilled
                            style={{ color: token.colorSuccess }}
                          />
                        )}
                      </span>
                      <span
                        className={`truncate text-xs leading-4 ${
                          isDone || isCancelled ? "line-through" : ""
                        }`}
                        style={{ color: token.colorText }}
                      >
                        {item.note.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
