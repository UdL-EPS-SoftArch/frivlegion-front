"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/components/authentication";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type FormValues = {
    username: string;
    email: string;
    password: string;
};

export default function RegistrationPage() {
    const { register: registerAccount } = useAuth();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const router = useRouter();

    const onSubmit: SubmitHandler<FormValues> = async (data) => {
        setErrorMessage(null);
        try {
            await registerAccount(
                data.username.trim(),
                data.email.trim(),
                data.password
            );
            router.push("/");
        } catch (err) {
            setErrorMessage(
                err instanceof Error ? err.message : "Registration failed"
            );
        }
    };

    return (
        <div className="flex min-h-[calc(100vh-72px)] items-center justify-center px-4 py-12">
            <Card className="w-full max-w-md bg-slate-900/90 border-cyan-500/30 text-slate-100">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-cyan-400">
                        Create Account
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="grid gap-4"
                        noValidate
                    >
                        {errorMessage && (
                            <p
                                role="alert"
                                className="text-sm text-rose-300 bg-rose-500/15 border border-rose-500/40 rounded-md px-3 py-2"
                            >
                                {errorMessage}
                            </p>
                        )}

                        <div className="grid gap-1.5">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                {...register("username", {
                                    required: "Username is required",
                                })}
                            />
                            {errors.username && (
                                <p className="text-sm text-rose-400 mt-1">
                                    {errors.username.message}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-1.5">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                {...register("email", {
                                    required: "Email is required",
                                })}
                            />
                            {errors.email && (
                                <p className="text-sm text-rose-400 mt-1">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-1.5">
                            <Label htmlFor="password">Password (8+ characters)</Label>
                            <Input
                                id="password"
                                type="password"
                                {...register("password", {
                                    required: "Password is required",
                                })}
                            />
                            {errors.password && (
                                <p className="text-sm text-rose-400 mt-1">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="mt-2 bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Creating Account..." : "Register"}
                        </Button>

                        <p className="text-sm text-slate-400 text-center mt-2">
                            Already registered?{" "}
                            <Link
                                href="/login"
                                className="text-cyan-400 font-semibold hover:underline"
                            >
                                Sign in
                            </Link>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
