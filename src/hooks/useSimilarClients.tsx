import { useEffect, useState } from "react";
import debounce from "lodash.debounce";
import { Box, Button, Typography } from "@mui/material";

function similarClients(formData) {
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const { name, surname, email, phone } = formData;
    if (!name && !surname && !email && !phone) {
      setClients([]);
      return;
    }

    const fetchClients = debounce(async () => {
      const res = await fetch("/api/clients/find-similar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, surname, email, phone }),
      });
      if (res.ok) {
        const data = await res.json();
        setClients(data);
      }
    }, 500);

    fetchClients();
    return () => fetchClients.cancel();
  }, [formData.name, formData.surname, formData.email, formData.phone]);

  return clients;
}

export default function useSimilarClients(formData, setFormData) {
    const clients = similarClients(formData);
    return clients.length > 0 && (
  <Box sx={{ mt: 2 }}>
    <Typography variant="subtitle2">Possible existing clients:</Typography>
    {clients.map((c) => (
      <Button key={c.id} onClick={() => setFormData(c)} sx={{ textTransform: "none" }}>
        {c.full_name} – {c.phone || c.email}
      </Button>
    ))}
  </Box>
)
}