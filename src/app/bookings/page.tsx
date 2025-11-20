'use client';

import { DialogForm } from '@/components/DialogForm';
import CalendarUI from './CalendarUI';
import { useBookingForm } from '@/hooks/useBookingForms';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import { BookingDTO, BookingModel } from '@/types/bookings';
import { FORM_FIELDS_ADD_BOOKING, FORM_FIELDS_EDIT_BOOKING } from '@/constants';
import { FormFieldConfigModel } from '@/types/formFieldConfig';
import { useLayout } from '../context/LayoutContext';
import { useEffect, useState } from 'react';
import { useServiceLookups } from '@/hooks/useServiceLookups';
import { ClientRow, useSimilarClients } from '@/hooks/useSimilarClients';
import { Button, Container, Typography } from '@mui/material';
import ClientSearch from './ClientSearch';
import EditIcon from '@mui/icons-material/Edit';
import DialogDeletion from '@/components/DialogDeletion';

export default function Bookings() {
    const { setButtonLabel, setOnButtonClick, selectedBooking, isEditing, setIsEditing } = useLayout();
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

    const newBookingForm = useBookingForm({ mode: 'new' });
    const editBookingForm = useBookingForm({ mode: 'edit', initialData: selectedBooking });

    const { clients, loading, error } = useSimilarClients({
        client_name: (newBookingForm.bookingFormData as BookingModel).client_name,
        client_surname: (newBookingForm.bookingFormData as BookingModel).client_surname,
        client_email: (newBookingForm.bookingFormData as BookingModel).client_email,
        client_phone: (newBookingForm.bookingFormData as BookingModel).client_phone
    });

    useEffect(() => {
        setButtonLabel('New Booking');
        setOnButtonClick(() => () => newBookingForm.setIsOpenBookingDialog((prev) => !prev));
        return () => {
            setButtonLabel('');
            setOnButtonClick(null);
        };
    }, [setButtonLabel, setOnButtonClick, newBookingForm.setIsOpenBookingDialog]);

    return (
        <main className='p-4'>
            <CalendarUI
                setBookingFormData={editBookingForm.setBookingFormData}
                setIsOpenBookingDialog={editBookingForm.setIsOpenBookingDialog}
                setIsEditable={editBookingForm.setIsEditable}
            />
            <DialogForm<BookingModel>
                open={newBookingForm.isOpenBookingDialog}
                title='Add Booking'
                formFields={FORM_FIELDS_ADD_BOOKING as FormFieldConfigModel<BookingModel>[]}
                formData={newBookingForm.bookingFormData}
                setFormData={newBookingForm.setBookingFormData}
                handleCancel={newBookingForm.handleCancel}
                cancelButton={
                    <Button
                        sx={{ color: 'error.main', gap: 1 }}
                        onClick={() => {
                            newBookingForm.handleCancel();
                            setIsEditing(false);
                        }}>
                        {
                            <>
                                <CloseIcon />
                                Cancel
                            </>
                        }
                    </Button>
                }
                acceptButton={
                    <Button sx={{ color: 'primary.main', gap: 1 }} onClick={() => newBookingForm.handleAccept()}>
                        {
                            <>
                                <AddCircleIcon />
                                Add Booking
                            </>
                        }
                    </Button>
                }
                otherSubComponents={[
                    <ClientSearch
                        newBookingForm={{
                            bookingFormData: newBookingForm.bookingFormData,
                            setBookingFormData: newBookingForm.setBookingFormData
                        }}
                        clients={clients}
                        loading={loading}
                        error={error}
                    />
                ]}
            />
            <DialogForm<BookingModel>
                open={editBookingForm.isOpenBookingDialog}
                title='Booking Details'
                formFields={FORM_FIELDS_EDIT_BOOKING as FormFieldConfigModel<BookingModel>[]}
                formData={editBookingForm.bookingFormData}
                setFormData={editBookingForm.setBookingFormData}
                handleCancel={editBookingForm.handleCancel}
                deleteButton={
                    <Button
                        color='error'
                        sx={{
                            gap: 1
                        }}
                        variant='contained'
                        onClick={() => setConfirmDeleteOpen(true)}>
                        <>
                            <DeleteIcon />
                            Delete
                        </>
                    </Button>
                }
                cancelButton={
                    <Button
                        sx={{ color: 'error.main', gap: 1 }}
                        onClick={() => {
                            editBookingForm.handleCancel();
                            setIsEditing(false);
                        }}>
                        {
                            <>
                                <CloseIcon />
                                Cancel
                            </>
                        }
                    </Button>
                }
                acceptButton={
                    isEditing ? (
                        <Button
                            sx={{ color: 'primary.main', gap: 1 }}
                            onClick={() => {
                                setIsEditing(false);
                                editBookingForm.handleAccept();
                            }}>
                            {
                                <>
                                    <SaveIcon />
                                    Save
                                </>
                            }
                        </Button>
                    ) : (
                        <Button sx={{ color: 'primary.main', gap: 1 }} onClick={() => setIsEditing(true)}>
                            {
                                <>
                                    <EditIcon /> Edit
                                </>
                            }
                        </Button>
                    )
                }
            />
            <DialogDeletion
                confirmDeleteOpen={confirmDeleteOpen}
                setConfirmDeleteOpen={setConfirmDeleteOpen}
                handleDelete={editBookingForm.handleDelete}
            />
        </main>
    );
}
