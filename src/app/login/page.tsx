"use client";

import { useState } from 'react';
import { login } from './actions'

export default function LoginPage() {

    const [message, setMessage] = useState("");

    return (
        <>
            <div className="p-6 max-w-md mx-auto">
                <h2 className="text-xl font-semibold mb-4">
                    Login
                </h2>
                <form className="space-y-4">
                    <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Email"
                        className="w-full p-2 border rounded"
                        required
                    />
                    <input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Password"
                        className="w-full p-2 border rounded"
                        required
                    />
                    <button
                        formAction={login}
                        type="submit"
                        onLoad={() => setMessage("Logging in...")}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded">
                        Log In
                    </button>
                </form>

                {message && <p className="mt-4 text-red-600">{message}</p>}
            </div>
        </>
    );
}
