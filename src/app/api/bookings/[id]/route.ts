import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const data = await req.json();
  const booking = await prisma.bookings.update({
    where: { id: params.id },
    data,
  });
  return Response.json(booking);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const booking = await prisma.bookings.delete({
    where: { id: params.id },
  });
  return Response.json(booking);
}
