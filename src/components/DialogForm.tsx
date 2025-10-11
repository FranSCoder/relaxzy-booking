import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid } from '@mui/material';
import { GridFormElement } from './GridFormElement';
import React from 'react';
import { FormFieldConfigModel } from '@/types/formFieldConfig';


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
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="md"
      fullWidth
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
    </Dialog>
  );
}