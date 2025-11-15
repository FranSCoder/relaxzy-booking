import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Typography, Container } from '@mui/material';
import { GridFormElement } from './GridFormElement';
import React from 'react';
import { FormFieldConfigModel } from '@/types/formFieldConfig';
import { ClientRow, useSimilarClients } from '@/hooks/useSimilarClients';
import { BookingModel } from '@/types/bookings';


type DialogFormProps<T extends BookingModel> = {
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

export function DialogForm<T extends BookingModel>({
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
    client_name: (formData as BookingModel).client_name,
    client_surname: (formData as BookingModel).client_surname,
    client_email: (formData as BookingModel).client_email,
    client_phone: (formData as BookingModel).client_phone,
  });

  const handlePickClient = (c: ClientRow) => {
    // map client -> booking form model using separate name/surname fields
    const firstName = c.name ?? "";
    const surname = c.surname ?? "";
    setFormData((prev: T) => ({
      ...prev,
      name: firstName,
      surname: surname,
      email: c.email ?? (prev.client_email as string | undefined),
      phone: c.phone ?? (prev.client_phone as string | undefined),
      notes: prev.notes as string | undefined, // keep existing notes
    } as T));
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
              {`${c.name ?? ''} ${c.surname ?? ''}`.trim()} – {c.phone || c.email}
            </Button>
          ))}
        </Container>
      )}
    </Dialog>
  );
}