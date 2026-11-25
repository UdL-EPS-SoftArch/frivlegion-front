"use client";

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { AuthService } from "@/api/authApi";
import { UsersService } from "@/api/userApi";
import {
    clearStoredToken,
    clientAuthProvider,
    getStoredToken,
    setStoredToken,
} from "@/lib/authProvider";
import { User } from "@/types/user";

export type AuthContextType = {
    user: User | null;
    setUser: (u: User | null) => void;
    token: string | null;
    roles: string[];
    isAuthenticated: boolean;
    isAdmin: boolean;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<User | null>;
    register: (
        username: string,
        email: string,
        password: string
    ) => Promise<User | null>;
    logout: () => void;
    refreshIdentity: () => Promise<User | null>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [roles, setRoles] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const logout = useCallback(() => {
        clearStoredToken();
        setToken(null);
        setUser(null);
        setRoles([]);
    }, []);

    const refreshIdentity = useCallback(async (): Promise<User | null> => {
        const stored = getStoredToken();
        if (!stored) {
            setToken(null);
            setUser(null);
            setRoles([]);
            return null;
        }
        setToken(stored);

        try {
            const service = new UsersService(clientAuthProvider());
            const currentUser = await service.getCurrentUser();
            if (currentUser) {
                const derivedRoles =
                    currentUser.roles ??
                    currentUser.authorities?.map((a) => a.authority) ??
                    [];
                setUser(currentUser);
                setRoles(derivedRoles);
                return currentUser;
            }
            logout();
            return null;
        } catch {
            logout();
            return null;
        }
    }, [logout]);

    useEffect(() => {
        let mounted = true;
        (async () => {
            setIsLoading(true);
            await refreshIdentity();
            if (mounted) {
                setIsLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [refreshIdentity]);

    const login = useCallback(
        async (username: string, password: string): Promise<User | null> => {
            const authService = new AuthService(clientAuthProvider());
            const authRes = await authService.login(username, password);
            setStoredToken(authRes.token);
            setToken(authRes.token);
            if (Array.isArray(authRes.roles)) {
                setRoles(authRes.roles);
            }
            return await refreshIdentity();
        },
        [refreshIdentity]
    );

    const register = useCallback(
        async (
            username: string,
            email: string,
            password: string
        ): Promise<User | null> => {
            const authService = new AuthService(clientAuthProvider());
            const authRes = await authService.register(
                username,
                email,
                password
            );
            setStoredToken(authRes.token);
            setToken(authRes.token);
            if (Array.isArray(authRes.roles)) {
                setRoles(authRes.roles);
            }
            return await refreshIdentity();
        },
        [refreshIdentity]
    );

    const value = useMemo<AuthContextType>(() => {
        const effectiveRoles =
            user?.roles ??
            user?.authorities?.map((a) => a.authority) ??
            roles;
        return {
            user,
            setUser,
            token,
            roles: effectiveRoles,
            isAuthenticated: Boolean(user),
            isAdmin: effectiveRoles.includes("ROLE_ADMIN"),
            isLoading,
            login,
            register,
            logout,
            refreshIdentity,
        };
    }, [
        user,
        token,
        roles,
        isLoading,
        login,
        register,
        logout,
        refreshIdentity,
    ]);

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be inside AuthProvider");
    return ctx;
}
