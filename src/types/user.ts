import { Resource } from "halfred";

export interface AuthorityEntity {
    authority: string;
}

export interface UserEntity {
    id?: number | string;
    uri?: string;
    username: string;
    email?: string;
    password?: string;
    createdAt?: string;
    roles?: string[];
    authorities?: AuthorityEntity[];
}

export type User = UserEntity & Resource;
