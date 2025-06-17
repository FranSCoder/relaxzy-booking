"use client";

import Cookies from 'js-cookie'

export default function ErrorPage() {

    const errorMsg = Cookies.get("errorSignUp") ?? "Unknown error";
    Cookies.remove("errorSignUp")

    return (
        <div className="w-full h-screen flex flex-col items-center justify-center">
            <h1 className="text-4xl">Oops... something went wrong:</h1>
            <h2 className="text-2xl">{errorMsg}</h2>
        </div>
    );
}
