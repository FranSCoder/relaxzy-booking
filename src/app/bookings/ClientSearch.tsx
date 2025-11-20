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
        newBookingForm.setBookingFormData(
            (prev: BookingModel) =>
                ({
                    ...prev,
                    client_name: c.client_name ?? '',
                    client_surname: c.client_surname ?? '',
                    client_email: c.client_email ?? (prev.client_email as string | undefined),
                    client_phone: c.client_phone ?? (prev.client_phone as string | undefined),
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
                            {`${c.client_name ?? ''} ${c.client_surname ?? ''}`.trim()} – {c.client_phone || c.client_email}
                        </Button>
                    ))}
                </Container>
            )}
        </>
    );
};

export default ClientSearch;
