import { mergeHal, postHal } from "./halClient";
import type { AuthProvider } from "@/lib/authProvider";
import { Score } from "@/types/score";

export class ScoreService {
    constructor(private authProvider?: AuthProvider) {}

    async submitScore(gameUri: string, scoreValue: number): Promise<Score> {
        const resource = await postHal(
            "/scores",
            {
                game: gameUri,
                scoreValue,
            },
            this.authProvider
        );
        return mergeHal<Score>(resource);
    }
}
