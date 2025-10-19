import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function POST(req: Request) {
  const body = await req.json();
  const { name, surname, email, phone } = body;

  if (!name && !surname && !email && !phone) {
    return NextResponse.json([], { status: 200 });
  }

const filters: Prisma.clientsWhereInput[] = [];

if (name) filters.push({ full_name: { contains: name, mode: "insensitive" } });
if (surname) filters.push({ full_name: { contains: surname, mode: "insensitive" } });
if (email) filters.push({ email: { contains: email, mode: "insensitive" } });
if (phone) filters.push({ phone: { contains: phone, mode: "insensitive" } });

  try {
    const clients = await prisma.clients.findMany({
      where: { OR: filters },
      select: {
        id: true,
        full_name: true,
        email: true,
        phone: true,
        notes: true,
        created_at: true,
        updated_at: true,
      },
      take: 5,
    });

    return NextResponse.json(clients);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error finding clients" }, { status: 500 });
  }
}
