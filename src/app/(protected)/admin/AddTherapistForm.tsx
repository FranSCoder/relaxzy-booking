"use client";

import { useEffect, useState } from "react";

type SupabaseUser = {
  id: string;
  email: string;
};

export default function AddTherapistForm() {
  const [users, setUsers] = useState<SupabaseUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users/list"); // debe existir esta ruta
        const json = await res.json();
        setUsers(json.users || []);
      } catch (err) {
        console.error("Error al obtener usuarios", err);
      }
    };

    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError("");

    try {
      const res = await fetch("/api/therapists/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: selectedUser,
          full_name: fullName,
          phone,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Error inesperado");
        setStatus("error");
        return;
      }

      setStatus("success");
      setFullName("");
      setPhone("");
      setSelectedUser("");
    } catch (err) {
      setError(`Error al conectar con el servidor: ${err}`);
      setStatus("error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold">Añadir nuevo terapeuta</h2>

      <label className="block">
        <span className="text-sm">Usuario (email)</span>
        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          className="w-full mt-1 p-2 border rounded bg-white text-black dark:bg-gray-800 dark:text-white"
        >
          <option value="">Seleccionar usuario</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.email}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="text-sm">Nombre completo</span>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full mt-1 p-2 border rounded"
          required
        />
      </label>

      <label className="block">
        <span className="text-sm">Teléfono</span>
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full mt-1 p-2 border rounded"
          required
        />
      </label>

      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        disabled={status === "loading"}
      >
        {status === "loading" ? "Guardando..." : "Guardar terapeuta"}
      </button>

      {status === "success" && <p className="text-green-600">Terapeuta añadido correctamente.</p>}
      {status === "error" && <p className="text-red-600">{error}</p>}
    </form>
  );
}
