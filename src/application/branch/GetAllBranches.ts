import { Branch } from "../../domain/branch/Branch";
import { BranchRepository } from "../../domain/branch/BranchRepository";

export class GetAllBranches {
    constructor(private repository: BranchRepository) {}

    async run(): Promise<Branch[]> {
        return this.repository.getAll();
    }
}
