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
import { useEffect, useState } from "react";
import debounce from "lodash.debounce";

export function useSimilarClients(formData: Partial<BookingModel>) {
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const { name, surname, email, phone } = formData;
    if (!name && !surname && !email && !phone) {
      setClients([]);
      return;
    }

    const fetchClients = debounce(async () => {
      const res = await fetch("/api/clients/find-similar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, surname, email, phone }),
      });
      if (res.ok) {
        const data = await res.json();
        setClients(data);
      }
    }, 500);

    fetchClients();
    return () => fetchClients.cancel();
  }, [formData.name, formData.surname, formData.email, formData.phone]);

  return clients;
}

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
            return { ...field, elements: availableServices.length ? availableServices : field.elements };
        }
        if (field.formKey === 'duration') {
            return { ...field, elements: availableDurations.length ? availableDurations : field.elements };
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
                acceptText={<><AddCircleIcon /> Añadir</>}
                cancelText={<><CloseIcon /> Cancelar</>}
            />
        </main>
    );
}
