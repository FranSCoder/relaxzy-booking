import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import DatepickerLocaleProvider from "../components/DatePickerLocaleProvider";
import { Header } from "@/components/Header";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Relaxzy Bookings",
    description: "Manage your Relaxzy bookings",
    icons: {
        icon: "/favicon32.png", // path relative to public/
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
                suppressHydrationWarning>
                <DatepickerLocaleProvider />
                <Header />
                {children}
            </body>
        </html>
    );
}
