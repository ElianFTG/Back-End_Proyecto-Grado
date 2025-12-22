import { Branch } from "../../domain/branch/Branch";
import { BranchRepository } from "../../domain/branch/BranchRepository";

export class UpdateBranch {
    constructor(private repository: BranchRepository) {}

    async run(id: number, patch: Partial<Branch>, userId?: number): Promise<Branch | null> {
        return this.repository.update(id, patch, userId);
    }
}
