"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import { LayoutContextType } from "@/types/layoutContextType";
import { BookingDTO, BookingEventModel } from "@/types/bookings";

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [buttonLabel, setButtonLabel] = useState("");
  const [onButtonClick, setOnButtonClick] = useState<(() => void) | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<BookingDTO>({});


  return (
    <LayoutContext.Provider
      value={{ buttonLabel, setButtonLabel, onButtonClick, setOnButtonClick, selectedBooking, setSelectedBooking}}
    >
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const ctx = useContext(LayoutContext);
  if (!ctx) throw new Error("useLayout debe usarse dentro de LayoutProvider");
  return ctx;
}
