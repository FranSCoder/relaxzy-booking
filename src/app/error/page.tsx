"use server";

import { cookies } from "next/headers";

export default async function ErrorPage() {
    const cookieStore = await cookies();
    const errorMsg = cookieStore.get("errorSignUp")?.value ?? "Unknown error";
    cookieStore.delete("errorSignUp")

    return (
        <div className="w-full h-screen flex flex-col items-center justify-center">
            <h1 className="text-4xl">Oops... something went wrong:</h1>
            <h2 className="text-2xl">{errorMsg}</h2>
        </div>
    );
}
