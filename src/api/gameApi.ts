import { getHal, mergeHal, mergeHalArray } from "./halClient";
import type { AuthProvider } from "@/lib/authProvider";
import { Game } from "@/types/game";

function normalizeGame(game: Game): Game {
    const selfHref =
        (typeof game.link === "function" && game.link("self")?.href) ||
        game._links?.self?.href ||
        game.uri ||
        "";
    const extractedId =
        game.id ||
        (selfHref
            ? decodeURIComponent(selfHref.split("/").filter(Boolean).pop() || "")
            : "");
    return Object.assign(game, { id: extractedId });
}

export class GameService {
    constructor(private authProvider?: AuthProvider) {}

    async getGames(): Promise<Game[]> {
        const resource = await getHal("/games", this.authProvider);
        const embedded = resource.embeddedArray("games") || [];
        return mergeHalArray<Game>(embedded).map(normalizeGame);
    }

    async getActiveGames(): Promise<Game[]> {
        const games = await this.getGames();
        return games.filter((g) => g.isActive !== false);
    }

    async getGameById(id: string): Promise<Game> {
        const resource = await getHal(
            `/games/${encodeURIComponent(id)}`,
            this.authProvider
        );
        return normalizeGame(mergeHal<Game>(resource));
    }
}
