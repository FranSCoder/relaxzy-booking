import { SelectChangeEvent } from "@mui/material";

export const handleInputChange =
  <T, K extends keyof T>(
    field: K,
    setFormData: React.Dispatch<React.SetStateAction<T>>
  ) =>
  (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = event.target;
    let value: T[K];

    if (target.type === "checkbox") {
      value = (target as HTMLInputElement).checked as unknown as T[K];
    } else {
      value = target.value as unknown as T[K];
    }

    setFormData((prev) => ({ ...prev, [field]: value }));
  };

export const handleSelectChange =
  <T, K extends keyof T>(
    field: K,
    setFormData: React.Dispatch<React.SetStateAction<T>>
  ) =>
  (event: SelectChangeEvent) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value as unknown as T[K],
    }));
  };