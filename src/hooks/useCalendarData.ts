// hooks/useCalendarData.ts
import { useState, useEffect, useRef, useCallback } from "react";
import { BookingDTO } from "@/types/bookings";
import { DateTime } from "luxon";
import { AGENDA_LENGTH } from "@/constants";

export type Range = { start: DateTime; end: DateTime };
type CalendarView = "month" | "week" | "day" | "agenda" | "work_week";

export function useCalendarData(date: Date, view: CalendarView) {
  const bookingsCache = useRef<Record<string, BookingDTO>>({});
  const cachedRanges = useRef<Range[]>([]);

  const [bookings, setBookings] = useState<BookingDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");

  const getCurrentRange = useCallback((): Range => {
    const base = DateTime.fromJSDate(date);
    let start: DateTime;
    let end: DateTime;

    if (view === "agenda") {
      start = base.startOf("day");
      end = base.plus({ days: AGENDA_LENGTH }).endOf("day");
    } else {
      start = base.startOf(view === "work_week" ? "week" : view);
      end = base.endOf(view === "work_week" ? "week" : view);
    }

    return { start, end };
  }, [date, view]);

  const isRangeCached = (range: Range) =>
    cachedRanges.current.some(
      (cached) => cached.start <= range.start && cached.end >= range.end
    );

  const mergeRanges = (ranges: Range[]): Range[] => {
    if (!ranges.length) return [];
    const sorted = [...ranges].sort((a, b) => a.start.toMillis() - b.start.toMillis());
    const merged: Range[] = [sorted[0]];

    for (let i = 1; i < sorted.length; i++) {
      const last = merged[merged.length - 1];
      const current = sorted[i];

      if (current.start <= last.end) last.end = current.end > last.end ? current.end : last.end;
      else merged.push(current);
    }
    return merged;
  };

  useEffect(() => {
    const fetchData = async () => {
      const range = getCurrentRange();

      if (isRangeCached(range)) {
        setBookings(Object.values(bookingsCache.current));
        return;
      }

      setLoading(true);
      try {
        const url = `/api/bookings/range?start=${encodeURIComponent(
          range.start.toISO()!
        )}&end=${encodeURIComponent(range.end.toISO()!)}`;

        const response = await fetch(url);
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || "Unknown error");
        }

        const data: BookingDTO[] = await response.json();
        data.forEach((b) => (bookingsCache.current[b.id] = b));

        cachedRanges.current.push(range);
        cachedRanges.current = mergeRanges(cachedRanges.current);

        setBookings(Object.values(bookingsCache.current));
      } catch (error: unknown) {
        setFetchError(error instanceof Error ? error.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [getCurrentRange, view]);

  return { bookings, loading, fetchError };
}
