import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// /api/bookings/details
export async function GET() {
  try {
    // Fetch all bookings, including joined details
    const bookings = await prisma.booking.findMany({
      include: {
        client: true,     // assuming relation `client`
        service: true,    // assuming relation `service`
        therapist: true,  // if applicable
      },
      orderBy: {
        start_time: "asc",
      },
    });

    type BookingWithDetails = Prisma.BookingGetPayload<{
      include: { client: true; service: true; therapist: true };
    }>;

    // Transform data to match your BookingWithDetailsDTO if needed
    const formatted = bookings.map((b) => ({
      id: b.id,
      client_name: b.client?.name || "Unknown",
      service_name: b.service?.name || "Unknown",
      start_time: b.start_time,
      end_time: b.end_time,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error fetching booking details:", error);
    return NextResponse.json(
      { error: "Error fetching booking details" },
      { status: 500 }
    );
  }
}
