"use client"; // Important!

import { useEffect } from "react";
import { registerLocale, setDefaultLocale } from "react-datepicker";
import { es } from "date-fns/locale/es";

export default function DatepickerLocaleProvider() {
  useEffect(() => {
    registerLocale("es", es);
    setDefaultLocale("es");
  }, []);

  return null; // it just sets config, doesn't render anything
}
