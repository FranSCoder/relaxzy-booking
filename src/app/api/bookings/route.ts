import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const data = await req.json();
  const booking = await prisma.bookings.create({ data });
  return Response.json(booking);
}
