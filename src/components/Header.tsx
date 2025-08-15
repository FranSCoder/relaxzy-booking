import React from "react";
import LogoutButton from "./LogoutButton";
import { createClient } from "@/utils/supabase/server";

export const Header = async () => {

    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    return (
        <header className="flex justify-between items-center p-4">
            <div></div>
            <h1 className="text-xl font-bold">Booking System</h1>
            {user ? <LogoutButton /> : <div></div>}
        </header>
    );
};
