"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { GameService } from "@/api/gameApi";
import { ScoreService } from "@/api/scoreApi";
import { GameStateService } from "@/api/gameStateApi";
import { clientAuthProvider, getStoredToken } from "@/lib/authProvider";
import { useAuth } from "@/app/components/authentication";
import { Game } from "@/types/game";

function resolveGameHalUri(game: Game | null, fallbackId: string): string {
    if (game) {
        const selfHref =
            (typeof game.link === "function" && game.link("self")?.href) ||
            game._links?.self?.href ||
            game.uri;
        if (selfHref) {
            return selfHref;
        }
    }
    return `/games/${encodeURIComponent(fallbackId)}`;
}

export default function GamePlayerPage() {
    const params = useParams();
    const id = (params?.id as string) || "";
    const { isAuthenticated } = useAuth();

    const [game, setGame] = useState<Game | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [notFound, setNotFound] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
    const [isIframeLoaded, setIsIframeLoaded] = useState<boolean>(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [lastSubmittedScore, setLastSubmittedScore] = useState<number | null>(
        null
    );

    const containerRef = useRef<HTMLDivElement | null>(null);
    const iframeRef = useRef<HTMLIFrameElement | null>(null);
    const hasLoadedStateRef = useRef<boolean>(false);
    const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const showToast = useCallback((message: string) => {
        setToastMessage(message);
        if (toastTimeoutRef.current) {
            clearTimeout(toastTimeoutRef.current);
        }
        toastTimeoutRef.current = setTimeout(() => {
            setToastMessage(null);
        }, 4000);
    }, []);

    useEffect(() => {
        return () => {
            if (toastTimeoutRef.current) {
                clearTimeout(toastTimeoutRef.current);
            }
        };
    }, []);

    // Fetch game details by [id] from GET /games/{id}
    useEffect(() => {
        let mounted = true;
        hasLoadedStateRef.current = false;

        (async () => {
            if (!id) {
                if (mounted) {
                    setIsIframeLoaded(false);
                    setNotFound(true);
                    setLoading(false);
                }
                return;
            }

            setIsIframeLoaded(false);
            setLoading(true);
            setNotFound(false);
            setError(null);
            try {
                const gameService = new GameService(clientAuthProvider());
                const fetchedGame = await gameService.getGameById(id);
                if (mounted) {
                    setGame(fetchedGame);
                }
            } catch (err) {
                if (!mounted) return;
                const status = (err as { status?: number })?.status;
                if (status === 404) {
                    setNotFound(true);
                } else {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Failed to load game details"
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
    }, [id]);

    // Sync fullscreen state with browser Fullscreen API
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(Boolean(document.fullscreenElement));
        };
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => {
            document.removeEventListener(
                "fullscreenchange",
                handleFullscreenChange
            );
        };
    }, []);

    const toggleFullscreen = async () => {
        try {
            if (!document.fullscreenElement) {
                if (containerRef.current?.requestFullscreen) {
                    await containerRef.current.requestFullscreen();
                }
            } else if (document.exitFullscreen) {
                await document.exitFullscreen();
            }
        } catch {
            // Ignore errors in environments where Fullscreen API is blocked
        }
    };

    const loadSavedStateIntoIframe = useCallback(async () => {
        const targetWindow = iframeRef.current?.contentWindow;
        if (!targetWindow || !id) return;
        const hasAuth = isAuthenticated || Boolean(getStoredToken());
        if (!hasAuth) return;

        try {
            const gameStateService = new GameStateService(clientAuthProvider());
            const savedState = await gameStateService.findMine(game?.id || id);
            if (savedState && savedState.payload) {
                const parsedState =
                    typeof savedState.payload === "string"
                        ? JSON.parse(savedState.payload)
                        : savedState.payload;
                targetWindow.postMessage(
                    {
                        type: "FRIVLEGION_LOAD_STATE",
                        data: { state: parsedState },
                    },
                    window.location.origin
                );
            }
        } catch {
            // Ignore missing or unparsable saved state on initial load
        }
    }, [game, id, isAuthenticated]);

    const handleIframeLoad = useCallback(() => {
        setIsIframeLoaded(true);
        const hasAuth = isAuthenticated || Boolean(getStoredToken());
        if (hasAuth) {
            hasLoadedStateRef.current = true;
            void loadSavedStateIntoIframe();
        }
    }, [isAuthenticated, loadSavedStateIntoIframe]);

    useEffect(() => {
        const hasAuth = isAuthenticated || Boolean(getStoredToken());
        if (isIframeLoaded && hasAuth && !hasLoadedStateRef.current) {
            hasLoadedStateRef.current = true;
            void loadSavedStateIntoIframe();
        }
    }, [isIframeLoaded, isAuthenticated, loadSavedStateIntoIframe]);

    // Listen to postMessage events from the minigame iframe
    useEffect(() => {
        const handleMessage = async (event: MessageEvent) => {
            if (event.origin !== window.location.origin) {
                return;
            }

            const message = event.data;
            if (!message || typeof message !== "object") {
                return;
            }

            const messageType = (message as { type?: unknown }).type;
            if (typeof messageType !== "string") {
                return;
            }

            const hasAuth = isAuthenticated || Boolean(getStoredToken());
            if (!hasAuth) {
                return;
            }

            const payloadData =
                (message as { data?: unknown }).data &&
                typeof (message as { data?: unknown }).data === "object"
                    ? ((message as { data: Record<string, unknown> }).data ?? {})
                    : (message as Record<string, unknown>);

            const effectiveGameId =
                (typeof payloadData.gameId === "string" && payloadData.gameId) ||
                game?.id ||
                id;
            const gameHalUri = resolveGameHalUri(game, effectiveGameId);

            if (messageType === "FRIVLEGION_SCORE") {
                const rawScore = payloadData.score ?? payloadData.scoreValue;
                const scoreValue =
                    typeof rawScore === "number" ? rawScore : Number(rawScore);
                if (Number.isNaN(scoreValue)) {
                    return;
                }

                try {
                    const scoreService = new ScoreService(clientAuthProvider());
                    await scoreService.submitScore(gameHalUri, scoreValue);
                    setLastSubmittedScore(scoreValue);
                    showToast(`Score saved: ${scoreValue} pts`);
                } catch {
                    showToast("Unable to submit score");
                }
            } else if (messageType === "FRIVLEGION_SAVE_STATE") {
                const stateToSave =
                    "state" in payloadData
                        ? payloadData.state
                        : "payload" in payloadData
                          ? payloadData.payload
                          : undefined;
                if (stateToSave === undefined) {
                    return;
                }

                try {
                    const gameStateService = new GameStateService(
                        clientAuthProvider()
                    );
                    await gameStateService.saveMine(
                        effectiveGameId,
                        gameHalUri,
                        stateToSave
                    );
                } catch {
                    // Silent background save error handling
                }
            }
        };

        window.addEventListener("message", handleMessage);
        return () => {
            window.removeEventListener("message", handleMessage);
        };
    }, [game, id, isAuthenticated, showToast]);

    if (loading) {
        return (
            <main className="max-w-6xl mx-auto px-6 py-10">
                <div
                    role="status"
                    className="rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center text-slate-400"
                >
                    Loading game...
                </div>
            </main>
        );
    }

    if (notFound) {
        return (
            <main className="max-w-4xl mx-auto px-6 py-12">
                <div
                    role="alert"
                    className="rounded-2xl border border-rose-500/30 bg-slate-900/80 p-10 text-center space-y-4"
                >
                    <div className="text-xs font-bold uppercase tracking-widest text-rose-400">
                        404 — Not Found
                    </div>
                    <h1 className="text-2xl font-extrabold text-white">
                        Game not found
                    </h1>
                    <p className="text-sm text-slate-400">
                        The requested minigame &ldquo;{id}&rdquo; does not exist
                        or is unavailable.
                    </p>
                    <div className="pt-2">
                        <Link
                            href="/"
                            className="inline-flex items-center px-5 py-2.5 rounded-lg bg-cyan-500 text-sm font-bold text-slate-950 hover:bg-cyan-400 transition"
                        >
                            Back to catalog
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    if (error || !game) {
        return (
            <main className="max-w-4xl mx-auto px-6 py-12">
                <div
                    role="alert"
                    className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-8 text-center space-y-4"
                >
                    <h1 className="text-xl font-bold text-rose-200">
                        Unable to load game
                    </h1>
                    <p className="text-sm text-rose-300/90">
                        {error || "Unexpected error loading game details."}
                    </p>
                    <div className="pt-2">
                        <Link
                            href="/"
                            className="inline-flex items-center px-4 py-2 rounded-lg border border-slate-700 bg-slate-900 text-sm font-semibold text-slate-200 hover:border-cyan-400 transition"
                        >
                            Back to catalog
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="max-w-6xl mx-auto px-6 py-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-extrabold text-white">
                            {game.title}
                        </h1>
                        {game.category && (
                            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-400/40 text-cyan-300">
                                {game.category}
                            </span>
                        )}
                        {lastSubmittedScore !== null && (
                            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-emerald-300">
                                Last Score: {lastSubmittedScore}
                            </span>
                        )}
                    </div>
                    {game.description && (
                        <p className="text-sm text-slate-400 mt-1">
                            {game.description}
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href="/"
                        className="inline-flex items-center px-4 py-2 rounded-lg border border-slate-700 bg-slate-900 text-sm font-semibold text-slate-200 hover:border-cyan-400 transition"
                    >
                        Back to catalog
                    </Link>
                    <button
                        type="button"
                        onClick={toggleFullscreen}
                        className="inline-flex items-center px-4 py-2 rounded-lg bg-cyan-500 text-sm font-bold text-slate-950 hover:bg-cyan-400 transition cursor-pointer"
                    >
                        {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                    </button>
                </div>
            </div>

            {toastMessage && (
                <div
                    role="status"
                    aria-live="polite"
                    className="mb-4 rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-4 py-2.5 text-sm font-semibold text-emerald-200 shadow-lg flex items-center justify-between"
                >
                    <span>{toastMessage}</span>
                    <button
                        type="button"
                        onClick={() => setToastMessage(null)}
                        aria-label="Dismiss notification"
                        className="text-xs text-emerald-300 hover:text-white ml-4"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            <div
                ref={containerRef}
                className="relative w-full rounded-2xl border border-cyan-500/30 bg-slate-950 p-3 shadow-xl flex flex-col"
            >
                <iframe
                    ref={iframeRef}
                    title={game.title || `Minigame ${game.id}`}
                    src={
                        game.gameUrl ||
                        `/minigames/${encodeURIComponent(game.id || id)}/index.html`
                    }
                    onLoad={handleIframeLoad}
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                    allowFullScreen
                    className="w-full h-[640px] flex-1 rounded-xl border-0 bg-slate-950"
                />
            </div>
        </main>
    );
}
