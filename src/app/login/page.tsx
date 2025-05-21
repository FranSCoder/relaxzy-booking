"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { login, signup } from './actions'

export default function LoginPage() {
    const supabase = createClient()

    const [isLogin, setIsLogin] = useState(true);
    const [message, setMessage] = useState("");

    const handleGoogleSignIn = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${location.origin}/auth/callback`,

            },
        });
    
        if (error) {
            console.error("Google sign-in error:", error.message);
            // Optionally show a message to the user
        } else {
            setMessage(
                isLogin ? "Logging in..." : "Check your email to confirm sign-up"
            );
        }
    };

    return (
        <>
            <div className="p-6 max-w-md mx-auto">
                <h2 className="text-xl font-semibold mb-4">
                    {isLogin ? "Login" : "Sign Up"}
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
                        formAction={isLogin ? login : signup}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded">
                        {isLogin ? "Log In" : "Sign Up"}
                    </button>
                </form>

                <p className="mt-4 text-sm text-gray-600">
                    {isLogin
                        ? "Don’t have an account?"
                        : "Already have an account?"}{" "}
                    <button
                        className="text-blue-600 hover:text-blue-700 underline"
                        onClick={() => setIsLogin(!isLogin)}>
                        {isLogin ? "Sign Up" : "Log In"}
                    </button>
                </p>

                {message && <p className="mt-4 text-red-600">{message}</p>}
            </div>

            <div className="flex flex-col gap-4 w-full p-6 max-w-md mx-auto">
                {/* Email/password form here... */}

                <button
                    onClick={handleGoogleSignIn}
                    className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded">
                    Sign in with Google
                </button>
            </div>
        </>
    );
}
