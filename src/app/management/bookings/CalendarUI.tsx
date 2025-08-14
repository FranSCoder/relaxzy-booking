"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { Calendar, luxonLocalizer, View } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { BookingWithDetails } from "@/types";
import { DateTime, Settings } from "luxon";
import { createClient } from "@/utils/supabase/client";

// Set default timezone (safe to do once globally)
Settings.defaultZone = "Europe/Madrid";

const localizer = luxonLocalizer(DateTime, { firstDayOfWeek: 1 });

export default function CalendarUI() {

    const useCustomCalendar = () => {
        const [view, setView] = useState<View>("week");
        const [date, setDate] = useState<Date>(new Date());
        const onView = useCallback((view: View) => {
            setView(view);
        }, []);

        const onNavigate = useCallback((date: Date) => {
            setDate(date);
        }, []);

        return {
            view,
            date,
            onView,
            onNavigate,
        };
    };

    const { view, date, onView, onNavigate } = useCustomCalendar();

    const { min, max } = useMemo(() => {
        const start = DateTime.now().startOf("day").set({ hour: 10 });
        const end = DateTime.now().startOf("day").set({ hour: 22 });
        return { min: start.toJSDate(), max: end.toJSDate() };
    }, []);

    const supabase = createClient();

    const [isClient, setIsClient] = useState(false);
    const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
    const [fetchError, setFetchError] = useState("");

    useEffect(() => {
        setIsClient(true); // Trigger render only on client
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            const { data, error } = await supabase
                .from("bookings_with_details")
                .select("*");
            if (!error && data) {
                setBookings(data);
            } else if (error) {
                console.error("Error fetching bookings:", error.message);
                setFetchError(error.message);
            }
        };
        fetchData();
    }, [supabase]);

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
        <>
            {fetchError !== "" ? (
                <div>Error loading bookings: {fetchError}</div>
            ) : (
                <div className="h-fit">
                    <Calendar
                        localizer={localizer}
                        defaultView="week"
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: 600 }}
                        min={min} // 10:00
                        max={max} // 22:00
                        dayPropGetter={dayPropGetter}
                        view={view}
                        onView={onView}
                        onNavigate={onNavigate}
                        date={date}
                    />
                </div>
            )}
        </>
    );
}
