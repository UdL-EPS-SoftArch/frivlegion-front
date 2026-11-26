import { getHal, mergeHal, patchHal, postHal } from "./halClient";
import type { AuthProvider } from "@/lib/authProvider";
import { GameState } from "@/types/gameState";

export function getGameStateSelfUri(state: GameState): string {
    return (
        (typeof state.link === "function" && state.link("self")?.href) ||
        state._links?.self?.href ||
        state.uri ||
        (state.id !== undefined
            ? `/gameStates/${encodeURIComponent(String(state.id))}`
            : "")
    );
}

export class GameStateService {
    constructor(private authProvider?: AuthProvider) {}

    async findMine(gameId: string): Promise<GameState | null> {
        try {
            const resource = await getHal(
                `/gameStates/search/findMine?gameId=${encodeURIComponent(gameId)}`,
                this.authProvider
            );
            return mergeHal<GameState>(resource);
        } catch (err) {
            const status = (err as { status?: number })?.status;
            if (status === 404) {
                return null;
            }
            throw err;
        }
    }

    async createGameState(gameUri: string, payload: string): Promise<GameState> {
        const resource = await postHal(
            "/gameStates",
            {
                game: gameUri,
                payload,
            },
            this.authProvider
        );
        return mergeHal<GameState>(resource);
    }

    async updateGameState(selfUri: string, payload: string): Promise<GameState> {
        const resource = await patchHal(
            selfUri,
            {
                payload,
            },
            this.authProvider
        );
        return mergeHal<GameState>(resource);
    }

    async saveMine(
        gameId: string,
        gameUri: string,
        state: unknown
    ): Promise<GameState> {
        const serializedPayload =
            typeof state === "string" ? state : JSON.stringify(state);
        const existing = await this.findMine(gameId);
        if (!existing) {
            return this.createGameState(gameUri, serializedPayload);
        }
        const selfUri = getGameStateSelfUri(existing);
        if (!selfUri) {
            return this.createGameState(gameUri, serializedPayload);
        }
        return this.updateGameState(selfUri, serializedPayload);
    }
}
