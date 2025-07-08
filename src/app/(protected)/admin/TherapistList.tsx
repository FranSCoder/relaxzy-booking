"use client"; // Only if using Next.js App Router

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client"; // Adjust if needed

type Therapist = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  notes: string;
  created_at: string;
};

const TherapistList = () => {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const supabase = createClient();

  useEffect(() => {
    const fetchTherapists = async () => {
      const { data, error } = await supabase.from("therapists").select("*");
      if (error) {
        setError("Error loading therapists");
        console.error(error);
      } else {
        setTherapists(data);
      }
      setLoading(false);
    };

    fetchTherapists();
  }, [supabase]);

  if (loading) return <p>Loading therapists...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="p-4 space-y-4 ">
      <h2 className="text-2xl font-bold">Therapists</h2>
      {therapists.length === 0 && <p>No therapists found.</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ">
        {therapists.map((therapist) => (
          <div
            key={therapist.id}
            className="border p-4 rounded-2xl shadow bg-white space-y-2 dark:bg-gray-800 dark:text-white"
          >
            <h3 className="text-xl font-semibold">{therapist.full_name}</h3>
            <p><span className="font-medium">Email:</span> {therapist.email}</p>
            <p><span className="font-medium">Phone:</span> {therapist.phone}</p>
            {therapist.notes && (
              <p className="text-sm text-gray-600 italic">Notes: {therapist.notes}</p>
            )}
            <p className="text-xs text-gray-400">Added: {new Date(therapist.created_at).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TherapistList;
