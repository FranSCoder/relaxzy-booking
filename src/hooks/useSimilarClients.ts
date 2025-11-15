import { useEffect, useMemo, useState } from "react";
import debounce from "lodash.debounce";
import { BookingModel } from "@/types/bookings";

export type ClientRow = {
  id: string;
  name?: string | null;
  surname?: string | null;
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
  created_at?: string | null;
};

export function useSimilarClients(formData: BookingModel) {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  // derive primitive fields so we can depend on stable primitives in the effect
  const { client_name, client_surname, client_email, client_phone } = formData;

  // Create a stable debounced fetch function
  const debouncedFetch = useMemo(() => {
    return debounce(async (payload: BookingModel) => {
      try {
        setLoading(true);
        setError(undefined);
        const res = await fetch("/api/clients/find-similar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          throw new Error(`Status ${res.status}`);
        }
        const data = await res.json();
        setClients(data ?? []);
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error("Similar clients fetch error", err);
          setError(err?.message ?? "Unknown error");
          setClients([]);
        } else {
          console.error("Similar clients unknown fetch error:", err);
          setError("Unknown error");
          setClients([]);
        }
      } finally {
        setLoading(false);
      }
    }, 500);
  }, []);

  useEffect(() => {
    if (!client_name && !client_surname && !client_email && !client_phone) {
      setClients([]);
      setLoading(false);
      return;
    }
    // pass a primitives-only payload so the effect can safely depend on the primitive fields
    debouncedFetch({ client_name, client_surname, client_email, client_phone });
    return () => {
      debouncedFetch.cancel();
    };
    // Depend on primitive fields (name, surname, email, phone) and the debounced function.
    // Avoid depending on `formData` object reference to prevent unnecessary runs.
  }, [client_name, client_surname, client_email, client_phone, debouncedFetch]);

  return { clients, loading, error };
}