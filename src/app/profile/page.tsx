"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/components/authentication";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProfilePage() {
    const { user, roles, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace("/login");
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
        return (
            <main className="max-w-4xl mx-auto px-6 py-12">
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-10 text-center text-slate-400">
                    Loading your profile...
                </div>
            </main>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <main className="max-w-4xl mx-auto px-6 py-10">
            <div className="mb-6">
                <h1 className="text-3xl font-extrabold text-white">
                    {user.username}
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                    Authenticated identity information from{" "}
                    <code className="text-cyan-400">GET /identity</code>
                </p>
            </div>

            <Card className="bg-slate-900/80 border-cyan-500/25 text-slate-100">
                <CardHeader>
                    <CardTitle className="text-lg text-cyan-400">
                        Account Details
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-4">
                        <div className="text-xs uppercase tracking-wider text-slate-500">
                            Username
                        </div>
                        <div className="text-base font-bold text-white mt-1">
                            {user.username}
                        </div>
                    </div>

                    <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-4">
                        <div className="text-xs uppercase tracking-wider text-slate-500">
                            Email
                        </div>
                        <div className="text-base font-bold text-white mt-1">
                            {user.email ?? "—"}
                        </div>
                    </div>

                    <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-4">
                        <div className="text-xs uppercase tracking-wider text-slate-500">
                            Roles
                        </div>
                        <div className="text-base font-bold text-white mt-1">
                            {roles.length > 0 ? roles.join(", ") : "ROLE_USER"}
                        </div>
                    </div>

                    <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-4">
                        <div className="text-xs uppercase tracking-wider text-slate-500">
                            Member Since
                        </div>
                        <div className="text-base font-bold text-white mt-1">
                            {user.createdAt
                                ? new Date(user.createdAt).toLocaleDateString()
                                : "Active"}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}
