import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// /api/bookings
export async function GET() {
  try {
    // Fetch all bookings including client and service, without therapist
    const bookings = await prisma.bookings.findMany({
      include: {
        clients: true,
        services: true,
      },
      orderBy: {
        start_time: "asc",
      },
    });

    // Format data to match BookingWithDetailsDTO
    const formatted = bookings.map((b) => ({
      id: b.id,
      client_name: b.clients?.full_name ?? "Unknown", // your DB uses full_name
      service_name: b.services?.name ?? "Unknown",
      start_time: b.start_time,
      end_time: b.end_time,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Error fetching bookings" },
      { status: 500 }
    );
  }
}
