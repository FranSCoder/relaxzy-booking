"use client";

import { useSearchParams } from "next/navigation";

export default function ErrorPage() {
    const searchParams = useSearchParams();
    const msg = searchParams.get("msg") || "Unknown error";

    return (
        <div className="w-full h-screen flex flex-col items-center justify-center">
            <h1 className="text-4xl">Oops... something went wrong:</h1>
            <h2 className="text-2xl">{msg}</h2>
        </div>
    );
}
