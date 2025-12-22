import { Branch } from './Branch';

export interface BranchRepository {
    getAll(): Promise<Branch[]>;
    findById(id: number): Promise<Branch | null>;
    create(branch: Branch): Promise<Branch | null>;
    update(id: number, patch: Partial<Branch>, userId?: number): Promise<Branch | null>;
    updateState(id: number, userId?: number): Promise<void>;
}
