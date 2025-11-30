// src/api/clients/delete/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Client ID is required" }, { status: 400 });
    }

    // Soft-delete: set deleted_at instead of removing the record
    const updatedClient = await prisma.clients.update({
      where: { id },
      data: { deleted_at: new Date() }
    });

    return NextResponse.json({
      message: "Client soft-deleted successfully",
      client: updatedClient
    });
  } catch (error: any) {
    console.error("Failed to soft-delete client:", error);

    // Prisma error when record not found
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
