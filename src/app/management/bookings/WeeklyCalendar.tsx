"use client";

import { createClient } from "@/utils/supabase/client";
import CalendarUI from "./CalendarUI";
import { BookingWithDetails } from "@/types";
import { useEffect, useState } from "react";

export default function WeeklyCalendar() {
    const supabase = createClient();

    const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
    const [fetchError, setFetchError] = useState('')

    useEffect(() => {
        const fetchData = async () => {
            const { data, error } = await supabase
                .from("bookings_with_details")
                .select("*")
            if (!error && data) {
                setBookings(data)
            } else if (error ) {
                console.error("Error fetching bookings:", error.message);
                setFetchError(error.message)
            }
            
                
        };
        fetchData();
    }, [supabase]);

    return (
        <>
            {fetchError !== ''
                ? <div>Error loading bookings: {fetchError}</div>
                : <CalendarUI bookings={bookings} />
            }
        </>
    );
}
