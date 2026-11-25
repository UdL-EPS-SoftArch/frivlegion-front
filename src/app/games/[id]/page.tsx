"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function GamePlayerPage() {
    const params = useParams();
    const id = params?.id as string;

    return (
        <main className="max-w-6xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-extrabold text-white">
                        Playing: {id}
                    </h1>
                    <p className="text-sm text-slate-400">
                        Iframe game player container shell (Issue 4.1).
                    </p>
                </div>
                <Link
                    href="/"
                    className="inline-flex items-center px-4 py-2 rounded-lg border border-slate-700 bg-slate-900 text-sm font-semibold text-slate-200 hover:border-cyan-400 transition"
                >
                    Back to Catalog
                </Link>
            </div>

            <div className="rounded-2xl border border-cyan-500/30 bg-slate-950 p-3 shadow-xl">
                {id ? (
                    <iframe
                        title={`Minigame ${id}`}
                        src={`/minigames/${encodeURIComponent(id)}/index.html`}
                        className="w-full h-[620px] rounded-xl border-0"
                    />
                ) : (
                    <div className="p-10 text-center text-slate-400">
                        No game ID specified.
                    </div>
                )}
            </div>
        </main>
    );
}
