import { useEffect, useMemo, useState } from "react";
import debounce from "lodash.debounce";

export type ClientRow = {
  id: string;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
  created_at?: string | null;
};

export function useSimilarClients(formData: {
  name?: string;
  surname?: string;
  email?: string;
  phone?: string;
}) {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  // combine search key so we can put a single dependency
  const searchKey = `${formData.name ?? ""}|${formData.surname ?? ""}|${formData.email ?? ""}|${formData.phone ?? ""}`;

  // Create a stable debounced fetch function
  const debouncedFetch = useMemo(() => {
    return debounce(async (payload: typeof formData) => {
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
      } catch (err: any) {
        console.error("similar clients fetch error", err);
        setError(err?.message ?? "Unknown error");
        setClients([]);
      } finally {
        setLoading(false);
      }
    }, 500);
  }, []);

  useEffect(() => {
    const { name, surname, email, phone } = formData;
    if (!name && !surname && !email && !phone) {
      setClients([]);
      setLoading(false);
      return;
    }
    debouncedFetch(formData);
    return () => {
      debouncedFetch.cancel();
    };
    // Note: depend on the derived string key and the debounced function only.
    // Do NOT depend on the `formData` object reference because it's recreated on every render
    // and would cause an infinite loop.
  }, [searchKey, debouncedFetch]);

  return { clients, loading, error };
}