// /app/api/users/adduserstoclients/route.ts

import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

const supabaseAdmin = createAdminClient()

export async function GET() {
  const perPage = 1000;
  let page = 1;
  const allUsers = [];

  // Step 1: Fetch all users using pagination
  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });

    if (error) {
      return NextResponse.json({ error: "Failed to fetch users", details: error.message }, { status: 500 });
    }

    if (data.users.length === 0) break;

    allUsers.push(...data.users);
    page += 1;
  }

  // Step 2: Prepare new client entries
  const clientsToInsert: {
    name?: string | null;
    surname?: string | null;
    email: string;
    phone: string;
    notes: string;
  }[] = [];

  for (const user of allUsers) {
    const email = user.email ?? "";
    const phone = user.phone ?? "";
    const fullNameMeta = user.user_metadata?.full_name ?? email ?? "Unnamed";
    const [firstName, ...rest] = String(fullNameMeta).split(" ");
    const lastName = rest.join(" ");

    // Skip if both email and phone are empty
    if (!email && !phone) continue;

    // Check if user is already in the clients table
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from("clients")
      .select("id")
      .or(`email.eq.${email},phone.eq.${phone}`);

    if (fetchError) continue;

    if (!existing || existing.length === 0) {
      clientsToInsert.push({
        name: firstName || null,
        surname: lastName || null,
        email,
        phone,
        notes: "",
      });
    }
  }

  // Step 3: Insert new clients
  let insertedCount = 0;
  if (clientsToInsert.length > 0) {
    const { error: insertError } = await supabaseAdmin
      .from("clients")
      .insert(clientsToInsert);

    if (insertError) {
      return NextResponse.json({ error: "Insert failed", details: insertError.message }, { status: 500 });
    }

    insertedCount = clientsToInsert.length;
  }

  return NextResponse.json({
    message: "User sync complete",
    totalUsers: allUsers.length,
    newClientsInserted: insertedCount,
  });
}
