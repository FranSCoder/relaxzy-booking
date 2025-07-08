import BookingForm from "./BookingForm";
import WeeklyCalendar from "./WeeklyCalendar";

export default async function HomePage() {
    return (
        <main className="p-4">
            <BookingForm />
            <WeeklyCalendar />
        </main>
    );
}
