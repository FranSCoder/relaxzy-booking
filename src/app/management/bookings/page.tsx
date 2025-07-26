"use client"

import BookingForm from "./BookingForm";
import WeeklyCalendar from "./WeeklyCalendar";

export default function HomePage() {
    return (
        <main className="p-4">
            <BookingForm />
            <div className="h-24"></div>
            <WeeklyCalendar />
        </main>
    );
}
