"use client"

import { DialogForm } from "@/components/DialogForm";
import CalendarUI from "./CalendarUI";
import { useBookingForm } from "@/hooks/useBookingForms";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import { BookingDTO, BookingModel } from "@/types/bookings";
import { FORM_FIELDS_ADD_BOOKING } from "@/constants";
import { FormFieldConfigModel } from "@/types/formFieldConfig";
import { useLayout } from "../context/LayoutContext";
import { useEffect, useState } from "react";
import { useServiceLookups } from "@/hooks/useServiceLookups";

export default function Bookings() {

    const { setButtonLabel, setOnButtonClick, selectedBooking, setSelectedBooking } = useLayout();
    

    const { availableServices, availableDurations  } = useServiceLookups();

    const newBookingForm = useBookingForm({mode: 'new'})
    const editBookingForm = useBookingForm({ mode: "edit", initialData: selectedBooking })

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
        setOnButtonClick(() => () => newBookingForm.setIsOpenBookingDialog(prev => !prev));
        return () => {
            setButtonLabel("");
            setOnButtonClick(null);
        }
    }, [setButtonLabel, setOnButtonClick, newBookingForm.setIsOpenBookingDialog]);

    return (
        <main className="p-4">
            <CalendarUI 
            setBookingFormData={editBookingForm.setBookingFormData}
            setIsOpenBookingDialog={editBookingForm.setIsOpenBookingDialog}
            setIsEditable={editBookingForm.setIsEditable}
            />
            <DialogForm<BookingModel>
                open={newBookingForm.isOpenBookingDialog}
                title="Add Booking"
                formFields={formFieldsLocal as FormFieldConfigModel<BookingModel>[]}
                formData={newBookingForm.bookingFormData}
                setFormData={newBookingForm.setBookingFormData}
                onAccept={newBookingForm.handleAccept}
                onCancel={newBookingForm.handleCancel}
                acceptText={<><AddCircleIcon />Add Booking</>}
                cancelText={<><CloseIcon />Cancel</>}
            />
            <DialogForm<BookingModel>
                open={editBookingForm.isOpenBookingDialog}
                title="Booking Details"
                formFields={formFieldsLocal as FormFieldConfigModel<BookingModel>[]}
                formData={editBookingForm.bookingFormData}
                setFormData={editBookingForm.setBookingFormData}
                onAccept={editBookingForm.handleAccept}
                onCancel={editBookingForm.handleCancel}
                acceptText={<><EditIcon />Edit Booking</>}
                cancelText={<><CloseIcon />Cancel</>}
            />
        </main>
    );
}
