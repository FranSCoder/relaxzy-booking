"use client"

import { DialogForm } from "@/components/DialogForm";
import CalendarUI from "./CalendarUI";
import { useBookingForm } from "@/hooks/useBookingForms";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CloseIcon from '@mui/icons-material/Close';
import { BookingModel } from "@/types/bookings";
import { FORM_FIELDS_ADD_BOOKING } from "@/constants";
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
        handleCancel,
        availableServices,
        availableDurations } = useBookingForm()

    // Build a local copy of form fields where we inject dynamic elements
    const formFieldsLocal = FORM_FIELDS_ADD_BOOKING.map(field => {
        if (field.formKey === 'service_name') {
            return {
                ...field,
                elements: availableServices.length
                    ? [
                        ...availableServices,
                        ...field.elements!.filter(el => !availableServices.includes(el))
                    ]
                    : field.elements
            };
        }
        if (field.formKey === 'duration') {
            return {
                ...field,
                elements: availableDurations.length
                    ? [
                        ...availableDurations,
                        ...field.elements!.filter(el => !availableDurations.includes(el))
                    ]
                    : field.elements
            };
        }
        return field;
    });

    useEffect(() => {
        setButtonLabel("New Booking");
        setOnButtonClick(() => () => setIsOpenBookingDialog(prev => !prev));
        return () => {
            setButtonLabel("");
            setOnButtonClick(null);
        }
    }, [setButtonLabel, setOnButtonClick, setIsOpenBookingDialog]);

    return (
        <main className="p-4">
            <CalendarUI />
            <DialogForm<BookingModel>
                open={isOpenBookingDialog}
                title="Add Booking"
                formFields={formFieldsLocal as FormFieldConfigModel<BookingModel>[]}
                formData={bookingFormData}
                setFormData={setBookingFormData}
                onAccept={handleAccept}
                onCancel={handleCancel}
                acceptText={<><AddCircleIcon />Add Booking</>}
                cancelText={<><CloseIcon />Cancel</>}
            />
        </main>
    );
}
