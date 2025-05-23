"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function Home() {
    const supabase = createClient();
    const [message, setMessage] = useState("Connecting...");
    const [startDate, setStartDate] = useState<Date | null>(new Date());

    useEffect(() => {
        const test = async () => {
            const { data, error } = await supabase
                .schema('public')
                .from("bookings")
                .select("*");
            if (error) {
                setMessage(`Error: ${error.code}`);
            } else {
                setMessage(`Success! Got ${data.length} rows.`);
            }
        };

        test();
    }, [supabase]);

    return (
        <div className="flex flex-col justify-center items-center w-full h-screen">
            <div className="p-4 text-xl">{message}</div>
            <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                showTimeSelect
                timeIntervals={5}
                showTimeCaption={false}
            />
        </div>
    );
}
