"use client"

import BookingForm from "./BookingForm";
import CalendarUI from "./CalendarUI";

export default function HomePage() {
    return (
        <main className="p-4">
            <BookingForm />
            <div className="h-24"></div>
            <CalendarUI />
        </main>
    );
}
