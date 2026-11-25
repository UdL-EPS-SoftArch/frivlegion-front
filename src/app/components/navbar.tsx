"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/components/authentication";
import Loginbar from "@/app/components/loginbar";

export default function Navbar() {
    const pathname = usePathname();
    const { user, roles } = useAuth();

    const navLinks = [
        { href: "/", label: "Catalog" },
        { href: "/profile", label: "Profile", requiresAuth: true },
        { href: "/records", label: "Records" },
        { href: "/users", label: "Users", roles: ["ROLE_ADMIN"] },
    ];

    return (
        <nav className="bg-slate-950 border-b border-cyan-500/30 text-slate-100 shadow-md">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-6">
                <Link
                    href="/"
                    className="flex items-center gap-2 font-extrabold text-xl tracking-wider text-cyan-400"
                >
                    <span>FRIVLEGION</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-200 uppercase">
                        Arcade
                    </span>
                </Link>

                <div className="flex gap-4">
                    {navLinks
                        .filter(({ requiresAuth, roles: requiredRoles }) => {
                            if (requiresAuth && !user) return false;
                            if (requiredRoles) {
                                return requiredRoles.some((r) =>
                                    roles.includes(r)
                                );
                            }
                            return true;
                        })
                        .map(({ href, label }) => {
                            const active = pathname === href;
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className={
                                        active
                                            ? "text-cyan-400 font-semibold border-b-2 border-cyan-400 pb-1"
                                            : "text-slate-300 hover:text-white transition"
                                    }
                                >
                                    {label}
                                </Link>
                            );
                        })}
                </div>

                <div className="ml-auto">
                    <Loginbar />
                </div>
            </div>
        </nav>
    );
}
