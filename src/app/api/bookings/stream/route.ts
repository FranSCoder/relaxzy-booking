import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service key for realtime access on the server
  {
    auth: { persistSession: false },
  }
);

export async function GET(_req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };

      // Connect to the realtime channel for the `bookings` table
      const channel = supabase
        .channel("public:bookings-stream")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "bookings" },
          (payload) => {
            const { eventType, new: newData, old: oldData } = payload;
            if (eventType === "INSERT") send({ type: "INSERT", data: newData });
            else if (eventType === "UPDATE") send({ type: "UPDATE", data: newData });
            else if (eventType === "DELETE") send({ type: "DELETE", data: oldData });
          }
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            controller.enqueue(encoder.encode(": connected\n\n"));
          }
        });

      // Auto-reconnect hint for the client
      controller.enqueue(encoder.encode("retry: 5000\n\n"));

      // Cleanup when client disconnects
      const close = async () => {
        await supabase.removeChannel(channel);
        controller.close();
      };

      // Abort if connection closes
      _req.signal.addEventListener("abort", close);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
