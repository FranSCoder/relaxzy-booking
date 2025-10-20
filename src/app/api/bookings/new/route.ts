import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Body = {
  name?: string;
  surname?: string;
  phone?: string;
  email?: string;
  start_time: string; // ISO
  duration?: string; // minutes as string or number
  service_name?: string;
  notes?: string;
};

export async function POST(request: Request) {
  try {
    const body: Body = await request.json();

    if (!body.start_time) {
      return NextResponse.json({ error: 'Missing start_time' }, { status: 400 });
    }

    if (!body.service_name) {
      return NextResponse.json({ error: 'Missing service_name' }, { status: 400 });
    }

    // 1) find or create client
    let client;
    if (body.email) {
      client = await prisma.clients.findFirst({ where: { email: body.email } });
    }
    if (!client && body.phone) {
      client = await prisma.clients.findFirst({ where: { phone: body.phone } });
    }
    if (!client) {
      const full_name = `${body.name ?? ''} ${body.surname ?? ''}`.trim() || 'Unknown';
      client = await prisma.clients.create({ data: { full_name, email: body.email ?? null, phone: body.phone ?? null } });
    }

    // 2) find service
    const service = await prisma.services.findFirst({ where: { name: body.service_name } });
    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 400 });
    }

    // 3) compute end_time using duration (minutes) from body or service.duration
    const start = new Date(body.start_time);
    if (Number.isNaN(start.getTime())) {
      return NextResponse.json({ error: 'Invalid start_time' }, { status: 400 });
    }

    let durationMinutes = 0;
    if (body.duration) {
      durationMinutes = parseInt(String(body.duration), 10) || 0;
    }
    if (!durationMinutes && service.duration != null) {
      // service.duration may be Decimal or number
      const sd = (service as any).duration;
      durationMinutes = sd != null ? parseInt(String(sd), 10) : 0;
    }
    if (!durationMinutes) durationMinutes = 60;

    const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

    // 4) create booking
    const booking = await prisma.bookings.create({
      data: {
        client_id: client.id,
        service_id: service.id,
        start_time: start,
        end_time: end,
        notes: body.notes ?? null,
        status: 'confirmed',
      },
    });

    return NextResponse.json({ booking });
  } catch (err) {
    console.error('Create booking error', err);
    return NextResponse.json({ error: 'Error creating booking' }, { status: 500 });
  }
}
