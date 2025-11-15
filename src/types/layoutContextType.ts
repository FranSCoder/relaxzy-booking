import { BookingDTO, BookingEventModel } from "./bookings";

export type LayoutContextType = {
  buttonLabel: string;
  setButtonLabel: (label: string) => void;
  onButtonClick: (() => void) | null;
  setOnButtonClick: (fn: (() => void) | null) => void;
   selectedBooking: BookingDTO;
   setSelectedBooking: (booking: BookingDTO) => void;
};