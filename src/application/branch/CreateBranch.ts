import { Branch } from "../../domain/branch/Branch";
import { BranchRepository } from "../../domain/branch/BranchRepository";

export class CreateBranch {
    constructor(private repository: BranchRepository) {}

    async run(name: string, userId?: number): Promise<Branch | null> {
        const branch = new Branch(name, true, userId ?? null);
        return this.repository.create(branch);
    }
}
