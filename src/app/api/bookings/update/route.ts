import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, start_time, end_time, service_name, notes, status } = body;

    if (!id) return NextResponse.json({ error: "Missing booking id" }, { status: 400 });

    const data: any = {};
    if (start_time) data.start_time = new Date(start_time);
    if (end_time) data.end_time = new Date(end_time);
    if (notes !== undefined) data.notes = notes;
    if (status !== undefined) data.status = status;

    if (service_name) {
      // try to find service by name
      const service = await prisma.services.findFirst({ where: { name: service_name } });
      if (service) data.service_id = service.id;
    }

    const updated = await prisma.bookings.update({ where: { id }, data });

    return NextResponse.json({ booking: updated });
  } catch (err: any) {
    console.error("Error updating booking:", err);
    return NextResponse.json({ error: err?.message || "Unknown error" }, { status: 500 });
  }
}
