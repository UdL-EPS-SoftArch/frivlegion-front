"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/components/authentication";
import { Avatar } from "@/components/ui/avatar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";

export default function Loginbar() {
    const router = useRouter();
    const { user, isAdmin, logout: clearAuth } = useAuth();

    function handleLogout() {
        clearAuth();
        router.push("/");
    }

    if (user) {
        return (
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <Avatar className="rounded-lg flex items-center justify-center bg-slate-800 text-cyan-400 border border-cyan-500/40">
                        <FontAwesomeIcon icon={faUser} className="h-4 w-4" />
                    </Avatar>
                    <Link
                        href="/profile"
                        className="text-cyan-400 text-md font-semibold hover:underline"
                    >
                        {user.username ?? "User"}
                    </Link>
                    {isAdmin && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-400/50 text-purple-200 font-semibold">
                            ADMIN
                        </span>
                    )}
                </div>
                <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center px-3 py-1.5 bg-rose-600/80 text-white rounded text-sm font-medium hover:bg-rose-600 transition"
                >
                    Logout
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <Link
                href="/login"
                className="inline-flex items-center px-3 py-1.5 bg-slate-800 border border-slate-700 text-slate-100 rounded text-sm font-medium hover:border-cyan-400 transition"
            >
                Login
            </Link>
            <Link
                href="/register"
                className="inline-flex items-center px-3 py-1.5 bg-cyan-500 text-slate-950 rounded text-sm font-bold hover:bg-cyan-400 transition"
            >
                Register
            </Link>
        </div>
    );
}
