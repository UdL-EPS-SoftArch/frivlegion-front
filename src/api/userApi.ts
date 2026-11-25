import { getHal, mergeHal, mergeHalArray, postHal } from "./halClient";
import type { AuthProvider } from "@/lib/authProvider";
import { User } from "@/types/user";

export class UsersService {
    constructor(private authProvider: AuthProvider) {}

    async getUsers(): Promise<User[]> {
        const resource = await getHal("/players", this.authProvider);
        const embedded =
            resource.embeddedArray("players") ||
            resource.embeddedArray("users") ||
            [];
        return mergeHalArray<User>(embedded);
    }

    async getUserById(id: string): Promise<User> {
        const resource = await getHal(`/players/${id}`, this.authProvider);
        return mergeHal<User>(resource);
    }

    async getCurrentUser(): Promise<User | null> {
        if (!(await this.authProvider.getAuth())) {
            return null;
        }
        const resource = await getHal("/identity", this.authProvider);
        const user = mergeHal<User>(resource);
        if (Array.isArray(user.roles) && !user.authorities) {
            user.authorities = user.roles.map((r) => ({ authority: r }));
        }
        return user;
    }

    async createUser(user: User): Promise<User> {
        const resource = await postHal("/auth/register", user, this.authProvider);
        return mergeHal<User>(resource);
    }
}
