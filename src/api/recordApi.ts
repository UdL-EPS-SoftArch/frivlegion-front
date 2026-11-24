import { getHal, mergeHal, mergeHalArray, postHal } from "./halClient";
import type { AuthProvider } from "@/lib/authProvider";
import { Record } from "@/types/record";
import {User} from "@/types/user";

export class RecordService {
    constructor(private authProvider: AuthProvider) {
    }

    private async collectRecords(path: string): Promise<Record[]> {
        const records: Record[] = [];
        let resource = await getHal(path, this.authProvider);
        while (true) {
            records.push(...mergeHalArray<Record>(resource.embeddedArray('records') || []));
            const next = resource.link('next');
            if (!next) break;
            resource = await getHal(next.href, this.authProvider);
        }
        return records;
    }

    async getRecords(): Promise<Record[]> {
        return this.collectRecords('/records');
    }

    async getRecordById(id: string): Promise<Record> {
        const resource = await getHal(`/records/${id}`, this.authProvider);
        return mergeHal<Record>(resource);
    }

    async getRecordsByOwnedBy(owner: User): Promise<Record[]> {
        return this.collectRecords(`/records/search/findByOwnedBy?user=${owner.uri}`);
    }

    async createRecord(record: Record): Promise<Record> {
        const resource = await postHal('/records', record, this.authProvider);
        return mergeHal<Record>(resource);
    }

    async getRecordRelation<T>(record: Record, relation: string): Promise<T> {
        const resource = await getHal(record.link(relation).href, this.authProvider);
        return mergeHal<T>(resource);
    }
}
