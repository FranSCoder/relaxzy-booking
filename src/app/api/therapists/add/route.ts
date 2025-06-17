import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server"; // para el usuario actual
import { createAdminClient } from "@/utils/supabase/admin"; // para funciones admin

export async function POST(req: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.role !== "supabase_admin") {
    console.log("Unauthorized user:", user?.email ?? "No user");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const { user_id, full_name, phone } = body;

  if (!user_id || !full_name || !phone) {
    return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
  }

  const adminClient = createAdminClient();
  // Obtén el usuario desde Supabase Auth
  const { data: userData, error: userError } = await adminClient.auth.admin.getUserById(user_id);

  if (userError || !userData?.user?.email) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  const email = userData.user.email;

  // Inserta en la tabla therapists
  const { error: insertError } = await supabase
    .from("therapists")
    .insert({ id: user_id, full_name, phone, email });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
