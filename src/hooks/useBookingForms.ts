import { useState } from "react";
import { toast } from "react-toastify";
import { BookingDTO } from "@/types/bookings";

const initialStateBookingForm: BookingDTO = {
  client_name: "",
  client_surname: "",
  client_phone: "",
  client_email: "",
  start_time: "",
  end_time: "",
  service_name: "",
  notes: "",
  status: "",
  created_at: "",
  updated_at: "",
};

type BookingFormMode = "new" | "edit";

interface UseBookingFormOptions {
  mode?: BookingFormMode;
  initialData?: BookingDTO;
}

export const useBookingForm = ({
  mode = "new",
  initialData,
}: UseBookingFormOptions = {}) => {
  const [isOpenBookingDialog, setIsOpenBookingDialog] = useState(false);
  const [bookingFormData, setBookingFormData] = useState<BookingDTO>(
    initialData || initialStateBookingForm
  );

  const [isEditable, setIsEditable] = useState(mode === "new"); 

  const toggleEditMode = () => setIsEditable(prev => !prev);

  const handleAccept = async () => {
    try {
      const url =
        mode === "edit"
          ? `/api/bookings/${bookingFormData.id}`
          : "/api/bookings/new";

      const method = mode === "edit" ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingFormData),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error(`Booking ${mode} error:`, data);
        toast.error(data?.error || `Error ${mode === "edit" ? "updating" : "creating"} booking`);
        return;
      }

      toast.success(
        mode === "edit"
          ? "The booking has been updated successfully."
          : "The booking has been created successfully."
      );

      setIsOpenBookingDialog(false);
      setBookingFormData(initialStateBookingForm);
      setIsEditable(mode === "new");

      // Refresh calendar
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("refreshCalendarData"));
      }, 500);
    } catch (err) {
      console.error(`Network or server error ${mode} booking`, err);
      toast.error("Network or server error");
    }
  };

  const handleCancel = () => {
    setIsOpenBookingDialog(false);
    setBookingFormData(initialStateBookingForm);
    setIsEditable(mode === "new");
  };

  return {
    mode,
    isOpenBookingDialog,
    setIsOpenBookingDialog,
    bookingFormData,
    setBookingFormData,
    isEditable,
    setIsEditable,
    toggleEditMode, // optional convenience
    handleAccept,
    handleCancel,
  };
};
