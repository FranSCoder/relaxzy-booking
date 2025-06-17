import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const user_id = searchParams.get("user_id");

  if (!user_id) {
    return NextResponse.json({ error: "Falta el parámetro user_id" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("therapists")
    .select("id")
    .eq("id", user_id)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = No rows found
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const exists = !!data;
  return NextResponse.json({ exists });
}
