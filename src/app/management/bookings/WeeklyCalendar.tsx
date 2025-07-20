import { createClient } from "@/utils/supabase/server";
import { format, startOfWeek, addDays } from "date-fns";
import CalendarUI from "./CalendarUI";

type Booking = {
    id: string;
    client_id: string;
    therapist_id: string;
    service_id: string;
    start_time: string;
    end_time: string;
    notes: string;
    status: string;
    created_at: string;
    updated_at: string;
};

export default async function WeeklyCalendar() {
    const supabase = await createClient();

    const today = new Date();
    const start = startOfWeek(today, { weekStartsOn: 1 });
    const end = addDays(start, 6);

    const { data: bookings = [], error } = await supabase
        .from<Booking>("bookings")
        .select("*")
        .gte("start_time", start.toISOString())
        .lte("start_time", end.toISOString());

    if (error) {
        console.error("Error fetching bookings:", error.message);
        return <div>Error loading bookings.</div>;
    }

    const bookingsByDay: Record<string, typeof bookings> = {};
    for (let i = 0; i < 7; i++) {
        const key = format(addDays(start, i), "yyyy-MM-dd");
        bookingsByDay[key] = [];
    }

    bookings.forEach((booking: Booking) => {
        const key = format(new Date(booking.start_time), "yyyy-MM-dd");
        if (bookingsByDay[key]) bookingsByDay[key].push(booking);
    });


    return <CalendarUI bookingsByDay={bookingsByDay} />;
}
