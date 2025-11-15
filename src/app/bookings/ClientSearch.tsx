import { ClientRow } from '@/hooks/useSimilarClients';
import { BookingModel } from '@/types/bookings';
import { Button, Container, Typography } from '@mui/material';
import React from 'react';

type ClientSearchProps = {
    newBookingForm: {
        bookingFormData: BookingModel;
        setBookingFormData: React.Dispatch<React.SetStateAction<BookingModel>>;
    };
    clients: ClientRow[];
    loading: boolean;
    error: string | undefined;
};

const ClientSearch = ({ newBookingForm, clients, loading, error }: ClientSearchProps) => {
    const handlePickClient = (c: ClientRow) => {
        // map client -> booking form model using separate name/surname fields
        const firstName = c.name ?? '';
        const surname = c.surname ?? '';
        newBookingForm.setBookingFormData(
            (prev: BookingModel) =>
                ({
                    ...prev,
                    name: firstName,
                    surname: surname,
                    email: c.email ?? (prev.client_email as string | undefined),
                    phone: c.phone ?? (prev.client_phone as string | undefined),
                    notes: prev.notes as string | undefined // keep existing notes
                } as BookingModel)
        );
    };

    return (
        <>
            {loading && <Typography variant='body2'>Searching...</Typography>}
            {error && <Typography color='error'>{error}</Typography>}
            {clients.length > 0 && (
                <Container sx={{ mt: 2 }}>
                    <Typography variant='subtitle2'>Possible existing clients:</Typography>
                    {clients.map((c) => (
                        <Button key={c.id} onClick={() => handlePickClient(c)} sx={{ textTransform: 'none' }}>
                            {`${c.name ?? ''} ${c.surname ?? ''}`.trim()} – {c.phone || c.email}
                        </Button>
                    ))}
                </Container>
            )}
        </>
    );
};

export default ClientSearch;
