import halfred, { Resource } from "halfred";
import { clearStoredToken } from "@/lib/authProvider";

export const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.API_BASE_URL ||
    "http://localhost:8080";

export function mergeHal<T>(obj: Resource): T & Resource {
    return Object.assign(obj, halfred.parse(obj)) as T & Resource;
}

export function mergeHalArray<T>(objs: Resource[]): (T & Resource)[] {
    return objs.map((o) => Object.assign(o, halfred.parse(o)) as T & Resource);
}

async function handleErrorResponse(res: Response, path: string): Promise<never> {
    if (res.status === 401 && !path.includes("/auth/login")) {
        if (typeof window !== "undefined") {
            clearStoredToken();
        }
    }

    let message = `HTTP ${res.status} on ${path}`;
    try {
        const data = await res.json();
        if (data && typeof data.message === "string" && data.message.trim().length > 0) {
            message = data.message;
        } else if (data && Array.isArray(data.errors) && data.errors.length > 0) {
            message = data.errors
                .map((e: { property?: string; message?: string }) =>
                    e.property ? `${e.property}: ${e.message}` : e.message
                )
                .filter(Boolean)
                .join("; ");
        }
    } catch {
        // Ignore JSON parse errors on empty error bodies
    }

    const error = new Error(message) as Error & { status?: number };
    error.status = res.status;
    throw error;
}

export async function getHal(
    path: string,
    authProvider?: { getAuth: () => Promise<string | null> }
) {
    const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
    const authorization = authProvider ? await authProvider.getAuth() : null;
    const res = await fetch(url, {
        headers: {
            Accept: "application/hal+json, application/json",
            ...(authorization ? { Authorization: authorization } : {}),
        },
        cache: "no-store",
    });
    if (!res.ok) {
        await handleErrorResponse(res, path);
    }
    return halfred.parse(await res.json());
}

export async function postHal(
    path: string,
    body: unknown,
    authProvider?: { getAuth: () => Promise<string | null> }
) {
    const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
    const authorization = authProvider ? await authProvider.getAuth() : null;
    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/hal+json, application/json",
            ...(authorization ? { Authorization: authorization } : {}),
        },
        body: JSON.stringify(body),
        cache: "no-store",
    });
    if (!res.ok) {
        await handleErrorResponse(res, path);
    }
    const text = await res.text();
    return halfred.parse(text ? JSON.parse(text) : {});
}

export async function patchHal(
    path: string,
    body: unknown,
    authProvider?: { getAuth: () => Promise<string | null> }
) {
    const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
    const authorization = authProvider ? await authProvider.getAuth() : null;
    const res = await fetch(url, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/hal+json, application/json",
            ...(authorization ? { Authorization: authorization } : {}),
        },
        body: JSON.stringify(body),
        cache: "no-store",
    });
    if (!res.ok) {
        await handleErrorResponse(res, path);
    }
    const text = await res.text();
    return halfred.parse(text ? JSON.parse(text) : {});
}

export async function postJson<T>(
    path: string,
    body: unknown,
    authProvider?: { getAuth: () => Promise<string | null> }
): Promise<T> {
    const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
    const authorization = authProvider ? await authProvider.getAuth() : null;
    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...(authorization ? { Authorization: authorization } : {}),
        },
        body: JSON.stringify(body),
        cache: "no-store",
    });
    if (!res.ok) {
        await handleErrorResponse(res, path);
    }
    return (await res.json()) as T;
}
