"use client";

import { useEffect, useState } from "react";
import { Calendar, luxonLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { BookingWithDetails } from "@/types";
import { DateTime, Settings } from "luxon";

// Set default timezone (safe to do once globally)
Settings.defaultZone = 'Europe/Madrid';

const localizer = luxonLocalizer(DateTime, { firstDayOfWeek: 1 });

export default function CalendarUI({
  bookings,
}: {
  bookings: BookingWithDetails[];
}) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Trigger render only on client
  }, []);

  if (!isClient) return null;

  const events = bookings.map((b) => ({
    title: `${b.client_name} - ${b.service_name}`,
    start: new Date(b.start_time),
    end: new Date(b.end_time),
  }));

  // Custom style for the current day column
  const dayPropGetter = (date: Date) => {
    const today = DateTime.now().startOf("day").toISODate();
    const current = DateTime.fromJSDate(date).startOf("day").toISODate();

    if (today === current) {
      return {
        style: {
          backgroundColor: "#222", // dark background
          color: "#fff", // white text
        },
      };
    }
    return {};
  };

  return (
    <div className="h-fit">
      <Calendar
        localizer={localizer}
        defaultView="week"
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "100%" }}
        min={new Date(1970, 1, 1, 10, 0)} // 10:00
        max={new Date(1970, 1, 1, 22, 0)} // 22:00
        dayPropGetter={dayPropGetter}
      />
    </div>
  );
}
