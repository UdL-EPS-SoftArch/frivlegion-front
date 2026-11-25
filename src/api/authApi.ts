import { getHal, mergeHal, postJson } from "./halClient";
import { AuthProvider, clientAuthProvider } from "@/lib/authProvider";
import { AuthResponse, IdentityResponse } from "@/types/api";

export class AuthService {
    constructor(private authProvider: AuthProvider = clientAuthProvider()) {}

    async login(username: string, password: string): Promise<AuthResponse> {
        return postJson<AuthResponse>("/auth/login", { username, password });
    }

    async register(
        username: string,
        email: string,
        password: string
    ): Promise<AuthResponse> {
        return postJson<AuthResponse>("/auth/register", {
            username,
            email,
            password,
        });
    }

    async getIdentity(): Promise<IdentityResponse | null> {
        const auth = await this.authProvider.getAuth();
        if (!auth) return null;
        const resource = await getHal("/identity", this.authProvider);
        return mergeHal<IdentityResponse>(resource);
    }
}
