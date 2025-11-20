import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CLIENTS_FETCH_LIMIT } from "@/constants";

export async function POST(req: NextRequest) {
  const { searchTerm } = await req.json();

  if (!searchTerm) {
    const clients = await prisma.clients.findMany({ take: CLIENTS_FETCH_LIMIT });
    return NextResponse.json(clients);
  }

  const clients = await prisma.clients.findMany({
    where: {
      OR: [
        { client_name: { contains: searchTerm, mode: "insensitive" } },
        { client_surname: { contains: searchTerm, mode: "insensitive" } },
        { client_email: { contains: searchTerm, mode: "insensitive" } },
        { client_phone: { contains: searchTerm, mode: "insensitive" } },
      ]
    },
    take: CLIENTS_FETCH_LIMIT
  });

  return NextResponse.json(clients);
}
