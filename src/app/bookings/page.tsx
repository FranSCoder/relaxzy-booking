"use client"

import { DialogForm } from "@/components/DialogForm";
import CalendarUI from "./CalendarUI";
import { useBookingForm } from "@/hooks/useBookingForms";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CloseIcon from '@mui/icons-material/Close';
import { BookingModel } from "@/types/bookings";
import { FORM_FIELD_ADD_BOOKING } from "@/constants";
import { FormFieldConfigModel } from "@/types/formFieldConfig";
import { useLayout } from "../context/LayoutContext";
import { useEffect } from "react";

export default function Bookings() {

    const { setButtonLabel, setOnButtonClick } = useLayout();

    const { isOpenBookingDialog,
        setIsOpenBookingDialog,
        bookingFormData,
        setBookingFormData,
        handleAccept,
        handleCancel } = useBookingForm()

    useEffect(() => {
        setButtonLabel("New Booking");
        setOnButtonClick(() => () => setIsOpenBookingDialog(prev => !prev));
    }, [setButtonLabel, setOnButtonClick, setIsOpenBookingDialog]);

    return (
        <main className="p-4">
            <CalendarUI />
            <DialogForm<BookingModel>
                open={isOpenBookingDialog}
                title="Añadir banco"
                formFields={FORM_FIELD_ADD_BOOKING as FormFieldConfigModel<BookingModel>[]}
                formData={bookingFormData}
                setFormData={setBookingFormData}
                onAccept={handleAccept}
                onCancel={handleCancel}
                acceptText={<><AddCircleIcon /> Añadir</>}
                cancelText={<><CloseIcon /> Cancelar</>}
            />
        </main>
    );
}
