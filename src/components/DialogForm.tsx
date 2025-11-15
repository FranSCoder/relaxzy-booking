import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Typography, Container } from '@mui/material';
import { GridFormElement } from './GridFormElement';
import React, { useState } from 'react';
import { FormFieldConfigModel } from '@/types/formFieldConfig';
import { ClientRow, useSimilarClients } from '@/hooks/useSimilarClients';
import { BookingModel } from '@/types/bookings';
import EditIcon from '@mui/icons-material/Edit';

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
    otherSubComponents?: React.ReactNode[];
    isProtected?: boolean;
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
    otherSubComponents,
    isProtected = false
}: DialogFormProps<T>) {
    const [isEditing, setIsEditing] = useState(false);

    function computeIsDisabled<T>(field: FormFieldConfigModel<T>, isEditing: boolean): boolean {
        if (!field.allowsEnabled) return true;
        if (!field.allowsDisabled) return false;
        return !isEditing;
    }

    return (
        <Dialog
            open={open}
            onClose={() => {
                onCancel();
                setIsEditing(false);
            }}
            maxWidth='md'
            fullWidth
            sx={{
                '& .MuiDialog-container': {
                    alignItems: 'flex-start' // 👈 aligns dialog to top instead of center
                },
                '& .MuiPaper-root': {
                    marginTop: '2rem' // 👈 add some spacing from top
                }
            }}>
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
                            isDisabled={computeIsDisabled(field, isEditing)}
                        />
                    ))}
                </Grid>
            </DialogContent>

            <DialogActions>
                <Button
                    sx={{ color: 'error.main', gap: 1 }}
                    onClick={() => {
                        onCancel();
                        setIsEditing(false);
                    }}>
                    {cancelText}
                </Button>
                {isProtected ? (
                    isEditing ? (
                        <Button sx={{ color: 'primary.main', gap: 1 }} onClick={onAccept}>
                            {acceptText}
                        </Button>
                    ) : (
                        <Button sx={{ color: 'primary.main', gap: 1 }} onClick={() => setIsEditing((prev) => !prev)}>
                            <EditIcon />
                            Edit
                        </Button>
                    )
                ) : (
                    <Button sx={{ color: 'primary.main', gap: 1 }} onClick={onAccept}>
                        {acceptText}
                    </Button>
                )}
            </DialogActions>

            {otherSubComponents &&
                otherSubComponents.map((component, index) => (
                    <Container key={index} sx={{ padding: '1rem' }}>
                        {component}
                    </Container>
                ))}
        </Dialog>
    );
}
