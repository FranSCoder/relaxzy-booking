import { NextResponse } from "next/server";
import { createAdminClient  } from "@/utils/supabase/admin";

export async function GET() {
    try {
        const supabase = await createAdminClient();

        const response = await supabase.auth.admin.updateUserById(
            "02b45b68-dba4-4a11-953e-a518e636d6b3",
            {
                user_metadata: {
                    role: "client"
                }
            }
        );

        if (response.error) {
            console.error("Supabase error:", response.error.message);
            return new NextResponse(
                JSON.stringify({ error: response.error.message }),
                { status: 500 }
            );
        }

        return new NextResponse(JSON.stringify(response.data.user), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (err: unknown) {
        if (err instanceof Error) {
            console.error("Unexpected server error:", err.message);
        } else {
            console.error("Unexpected error:", err);
        }
        return new NextResponse(
            JSON.stringify({ error: "Unexpected server error" }),
            { status: 500 }
        );
    }
}
