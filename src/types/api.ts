import { Resource } from "halfred";

export interface HalLink {
    href: string;
    templated?: boolean;
}

export type HalLinks = Record<string, HalLink>;

export interface AuthResponse {
    token: string;
    roles: string[];
    username?: string;
    tokenType?: string;
    expiresIn?: number;
    playerId?: number;
    email?: string;
}

export interface IdentityEntity {
    id: number | string;
    uri: string;
    username: string;
    email: string;
    createdAt: string;
    roles: string[];
    _links?: HalLinks;
}

export type IdentityResponse = IdentityEntity & Partial<Resource>;

export interface GameEntity {
    id: string;
    uri?: string;
    title: string;
    description?: string;
    category: string;
    thumbnailUrl: string;
    gameUrl: string;
    isActive: boolean;
    _links?: HalLinks;
}

export type Game = GameEntity & Resource;

export interface ScoreEntity {
    id?: number;
    uri?: string;
    scoreValue: number;
    achievedAt?: string;
    player?: string;
    game?: string;
    _links?: HalLinks;
}

export type Score = ScoreEntity & Resource;

export interface GameStateEntity {
    id?: number;
    uri?: string;
    payload: string;
    updatedAt?: string;
    player?: string;
    game?: string;
    _links?: HalLinks;
}

export type GameState = GameStateEntity & Resource;

export interface ApiError {
    message: string;
}
