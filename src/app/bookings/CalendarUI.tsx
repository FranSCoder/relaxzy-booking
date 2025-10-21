"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { Calendar, luxonLocalizer, View } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { BookingWithDetailsDTO } from "@/types/bookings";
import { DateTime, Settings } from "luxon";

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

    const [isClient, setIsClient] = useState(false);
    const [bookings, setBookings] = useState<BookingWithDetailsDTO[]>([]);
    const [fetchError, setFetchError] = useState("");

    useEffect(() => {
        setIsClient(true); // Trigger render only on client
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("/api/bookings/all");
                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.error || "Unknown error");
                }
                const data = await response.json();
                console.log("Fetched bookings:", data.length);
                setBookings(data);
            } catch (error: unknown) {
                if (error instanceof Error) {
                    console.error("Error fetching bookings:", error.message);
                    setFetchError(error.message);
                } else {
                    console.error("Unknown error fetching bookings:", error);
                    setFetchError("Unknown error");
                }
            }
        };
        fetchData();
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
                    backgroundColor: "rgba(212, 228, 209, 1)", // dark background
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
            )}
        </>
    );
}
