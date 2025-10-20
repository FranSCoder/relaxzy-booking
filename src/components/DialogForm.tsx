import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Typography, Box, Container } from '@mui/material';
import { GridFormElement } from './GridFormElement';
import React from 'react';
import { FormFieldConfigModel } from '@/types/formFieldConfig';
import { ClientRow, useSimilarClients } from '@/hooks/useSimilarClients';


type DialogFormProps<T> = {
  open: boolean;
  title: string;
  formFields: FormFieldConfigModel<T>[];
  formData: T;
  setFormData: React.Dispatch<React.SetStateAction<T>>;
  onAccept: () => void;
  onCancel: () => void;
  acceptText?: React.ReactNode;
  cancelText?: React.ReactNode;
};

export function DialogForm<T>({
  open,
  title,
  formFields,
  formData,
  setFormData,
  onAccept,
  onCancel,
  acceptText = 'Aceptar',
  cancelText = 'Cancelar',
}: DialogFormProps<T>) {

  // inside DialogForm, with setFormData typed to BookingModel setState
  const { clients, loading, error } = useSimilarClients({
    name: (formData as any).name,
    surname: (formData as any).surname,
    email: (formData as any).email,
    phone: (formData as any).phone,
  });

  const handlePickClient = (c: ClientRow) => {
    // map client -> booking form model (split full_name if you want)
    const [firstName, ...rest] = (c.full_name || "").split(" ");
    const surname = rest.join(" ");
    setFormData((prev: any) => ({
      ...prev,
      name: firstName ?? "",
      surname: surname ?? "",
      email: c.email ?? prev.email,
      phone: c.phone ?? prev.phone,
      notes: prev.notes, // keep existing notes
    }));
  };

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="md"
      fullWidth
      sx={{
        '& .MuiDialog-container': {
          alignItems: 'flex-start', // 👈 aligns dialog to top instead of center
        },
        '& .MuiPaper-root': {
          marginTop: '2rem', // 👈 add some spacing from top
        },
      }}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent sx={{ overflowY: 'hidden' }}>
        <Grid sx={{ paddingTop: '1rem' }} container spacing={{ xs: 1, xl: 2 }}>
          {formFields.map((field) => (
            <GridFormElement<T>
              key={String(field.formKey)}
              type={field.type}
              size={field.size}
              formData={formData}
              setFormData={setFormData}
              formKey={field.formKey}
              label={field.label}
              elements={field.elements}
              filesMax={field.filesMax}
              text={field.text}
              showTime={field.showTime}
              autoFocus={field.autoFocus}
            />
          ))}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button sx={{ color: 'error.main', gap: 1 }} onClick={onCancel}>
          {cancelText}
        </Button>
        <Button sx={{ color: 'primary.main', gap: 1 }} onClick={onAccept}>
          {acceptText}
        </Button>
      </DialogActions>
      {loading && <Typography variant="body2">Searching...</Typography>}
      {error && <Typography color="error">{error}</Typography>}
      {clients.length > 0 && (
        <Container sx={{ mt: 2 }}>
          <Typography variant="subtitle2">Possible existing clients:</Typography>
          {clients.map((c) => (
            <Button key={c.id} onClick={() => handlePickClient(c)} sx={{ textTransform: "none" }}>
              {c.full_name} – {c.phone || c.email}
            </Button>
          ))}
        </Container>
      )}
    </Dialog>
  );
}