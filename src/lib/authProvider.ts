import { deleteCookie, setCookie } from "cookies-next";

export const TOKEN_STORAGE_KEY = "frivlegion_token";
export const AUTH_COOKIE_KEY = "MYAPP_AUTH";

export type AuthProvider = {
    getAuth(): Promise<string | null>;
};

export function formatAuthHeader(raw: string | null | undefined): string | null {
    if (!raw) return null;
    const trimmed = raw.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith("Bearer ") || trimmed.startsWith("Basic ")) {
        return trimmed;
    }
    return `Bearer ${trimmed}`;
}

export function getStoredToken(): string | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (raw) {
        return raw.replace(/^Bearer\s+/i, "");
    }
    const cookieMatch = document.cookie.match(/MYAPP_AUTH=([^;]+)/)?.[1];
    if (cookieMatch) {
        return decodeURIComponent(cookieMatch).replace(/^Bearer\s+/i, "");
    }
    return null;
}

export function setStoredToken(token: string): void {
    const cleanToken = token.replace(/^Bearer\s+/i, "");
    if (typeof window !== "undefined") {
        localStorage.setItem(TOKEN_STORAGE_KEY, cleanToken);
    }
    setCookie(AUTH_COOKIE_KEY, `Bearer ${cleanToken}`, {
        path: "/",
        sameSite: "lax",
        httpOnly: false,
    });
}

export function clearStoredToken(): void {
    if (typeof window !== "undefined") {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(AUTH_COOKIE_KEY);
    }
    deleteCookie(AUTH_COOKIE_KEY, { path: "/" });
}

export const serverAuthProvider: AuthProvider = {
    async getAuth() {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        const raw =
            cookieStore.get(AUTH_COOKIE_KEY)?.value ??
            cookieStore.get(TOKEN_STORAGE_KEY)?.value ??
            null;
        return formatAuthHeader(raw);
    },
};

export function clientAuthProvider(): AuthProvider {
    return {
        async getAuth() {
            if (typeof window !== "undefined") {
                const jwt = localStorage.getItem(TOKEN_STORAGE_KEY);
                if (jwt) return formatAuthHeader(jwt);

                const cookie = document.cookie.match(/MYAPP_AUTH=([^;]+)/)?.[1];
                if (cookie) return formatAuthHeader(decodeURIComponent(cookie));

                return formatAuthHeader(localStorage.getItem(AUTH_COOKIE_KEY));
            }
            return null;
        },
    };
}
