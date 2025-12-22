import { BranchRepository } from "../../domain/branch/BranchRepository";

export class UpdateStateBranch {
    constructor(private repository: BranchRepository) {}

    async run(id: number, userId?: number): Promise<void> {
        return this.repository.updateState(id, userId);
    }
}
