import { Branch } from "../../domain/branch/Branch";
import { BranchRepository } from "../../domain/branch/BranchRepository";

export class FindByIdBranch {
    constructor(private repository: BranchRepository) {}

    async run(id: number): Promise<Branch | null> {
        return this.repository.findById(id);
    }
}
