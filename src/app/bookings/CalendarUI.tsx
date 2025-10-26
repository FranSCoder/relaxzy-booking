"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Calendar, luxonLocalizer, View } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { DateTime, Settings } from "luxon";
import CircularProgress from "@mui/material/CircularProgress";
import { useCalendarData } from "@/hooks/useCalendarData";

Settings.defaultZone = "Europe/Madrid";
const localizer = luxonLocalizer(DateTime, { firstDayOfWeek: 1 });

function CalendarUI() {
  const [view, setView] = useState<View>("week");
  const [date, setDate] = useState(new Date());

  const onView = useCallback((v: View) => setView(v), []);
  const onNavigate = useCallback((d: Date) => setDate(d), []);

  const { bookings, loading, fetchError } = useCalendarData(date, view);

  const { min, max } = useMemo(() => {
    const start = DateTime.now().startOf("day").set({ hour: 10 });
    const end = DateTime.now().startOf("day").set({ hour: 22 });
    return { min: start.toJSDate(), max: end.toJSDate() };
  }, []);

  const events = bookings.map((b) => ({
    title: `${b.client_name} ${b.client_surname} - ${b.service_name}`,
    start: new Date(b.start_time),
    end: new Date(b.end_time),
  }));

  const dayPropGetter = (date: Date) => {
    const today = DateTime.now().startOf("day").toISODate();
    const current = DateTime.fromJSDate(date).startOf("day").toISODate();
    return today === current ? { style: { backgroundColor: "rgba(212, 228, 209, 1)" } } : {};
  };

  return (
    <div className="h-fit relative">
      <div style={{ opacity: loading ? 0.5 : 1, transition: "opacity 0.3s" }}>
        <Calendar
          localizer={localizer}
          defaultView="week"
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          min={min}
          max={max}
          dayPropGetter={dayPropGetter}
          eventPropGetter={() => ({
            style: {
              backgroundColor: "rgba(4, 62, 0, 1)",
              color: "white",
              borderRadius: "8px",
              border: "1.5px solid #6FBF73",
              padding: "4px",
            },
          })}
          view={view}
          onView={onView}
          onNavigate={onNavigate}
          date={date}
        />
      </div>

      {loading && (
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
          <CircularProgress />
        </div>
      )}

      {fetchError && <div>Error loading bookings: {fetchError}</div>}
    </div>
  );
}

export default React.memo(CalendarUI);
