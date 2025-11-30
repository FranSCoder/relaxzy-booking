import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// /api/services
export async function GET() {
  try {
    const services = await prisma.services.findMany({
      where: { deleted_at: null }, // soft-delete filter
      orderBy: {
        name: "asc",
      },
    });

    const formatted = services.map((s) => ({
      id: s.id,
      name: s.name,
      duration: s.duration,
      price: s.price,
      notes: s.notes,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { error: "Error fetching services" },
      { status: 500 }
    );
  }
}
