"use client";
import { format } from "date-fns";

type Booking = {
  id: string;
  date: string;
  client_name: string;
  service: string;
};

export default function CalendarUI({
  bookingsByDay,
}: {
  bookingsByDay: Record<string, Booking[]>;
}) {
  return (
    <div className="grid grid-cols-7 gap-2 p-4">
      {Object.entries(bookingsByDay).map(([date, bookings]) => (
        <div key={date} className="border rounded p-2 shadow-sm">
          <div className="font-semibold text-center mb-2">
            {format(new Date(date), "EEE")}
          </div>
          {bookings.length === 0 ? (
            <div className="text-sm text-gray-400 text-center">No bookings</div>
          ) : (
            bookings.map((b) => (
              <div key={b.id} className="text-sm border-b py-1">
                {b.client_name} - {b.service}
              </div>
            ))
          )}
        </div>
      ))}
    </div>
  );
}
