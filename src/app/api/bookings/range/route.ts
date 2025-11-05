// app/api/bookings/range/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  if (!start || !end) {
    return NextResponse.json({ error: "Missing date range" }, { status: 400 });
  }

  try {
    const bookings = await prisma.bookings.findMany({
      where: {
        start_time: { gte: new Date(start), lte: new Date(end) },
      },
      include: {
        clients: true,
        services: true,
      },
      orderBy: { start_time: "asc" },
    });

    const formatted = bookings.map((b) => ({
      id: b.id,
      client_name: b.clients?.name ?? "Unknown",
      client_surname: b.clients?.surname,
      service_name: b.services?.name ?? "Unknown",
      start_time: b.start_time,
      end_time: b.end_time,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error fetching bookings in range:", error);
    return NextResponse.json(
      { error: "Error fetching bookings in range" },
      { status: 500 }
    );
  }
}
