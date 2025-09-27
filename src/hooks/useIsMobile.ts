"use client";

import { useState, useEffect } from "react";
import { useTheme, useMediaQuery } from "@mui/material";

/**
 * Detects if the device is a mobile/phone.
 * Uses MUI breakpoints, works SSR-friendly by providing a default.
 */
export default function useIsMobile(defaultValue = false) {
  const theme = useTheme();

  // useMediaQuery will be false during SSR unless you provide a default
  const matches = useMediaQuery(theme.breakpoints.down("sm"), {
    noSsr: true, // ensures hook updates after hydration
  });

  const [isMobile, setIsMobile] = useState(defaultValue);

  useEffect(() => {
    setIsMobile(matches);
  }, [matches]);

  return isMobile;
}
