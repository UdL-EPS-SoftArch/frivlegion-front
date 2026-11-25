"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { GameService } from "@/api/gameApi";
import { clientAuthProvider } from "@/lib/authProvider";
import { Game } from "@/types/game";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            setLoading(true);
            setError(null);
            try {
                const service = new GameService(clientAuthProvider());
                const activeGames = await service.getActiveGames();
                if (mounted) {
                    setGames(activeGames);
                }
            } catch (err) {
                if (mounted) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Failed to load game catalog"
                    );
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        })();

        return () => {
            mounted = false;
        };
    }, []);

    return (
        <main className="max-w-7xl mx-auto px-6 py-10">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold tracking-tight text-white">
                    Minigame Catalog
                </h1>
                <p className="text-slate-400 mt-1">
                    Pick an arcade challenge, climb the leaderboards, and save your progress.
                </p>
            </div>

            {loading && (
                <div
                    role="status"
                    className="rounded-xl border border-slate-800 bg-slate-900/60 p-10 text-center text-slate-400"
                >
                    Loading minigames...
                </div>
            )}

            {!loading && error && (
                <div
                    role="alert"
                    className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-6 text-rose-200"
                >
                    Unable to load game catalog: {error}
                </div>
            )}

            {!loading && !error && games.length === 0 && (
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-10 text-center text-slate-400">
                    No active minigames found in the catalog.
                </div>
            )}

            {!loading && !error && games.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {games.map((game) => (
                        <Card
                            key={game.id}
                            className="overflow-hidden bg-slate-900/80 border-cyan-500/25 hover:border-cyan-400 transition flex flex-col"
                        >
                            <div className="relative aspect-[4/3] w-full bg-slate-950 overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={
                                        game.thumbnailUrl ||
                                        `/minigames/${game.id}/thumbnail.png`
                                    }
                                    alt={game.title}
                                    className="w-full h-full object-cover"
                                />
                                {game.category && (
                                    <span className="absolute top-3 right-3 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-950/85 border border-cyan-400/40 text-cyan-300">
                                        {game.category}
                                    </span>
                                )}
                            </div>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xl text-white">
                                    {game.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col flex-1 gap-4">
                                {game.description && (
                                    <p className="text-sm text-slate-400 flex-1">
                                        {game.description}
                                    </p>
                                )}
                                <Link
                                    href={`/games/${encodeURIComponent(game.id)}`}
                                    className="inline-flex items-center justify-center rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-400 transition"
                                >
                                    Play Now
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </main>
    );
}
