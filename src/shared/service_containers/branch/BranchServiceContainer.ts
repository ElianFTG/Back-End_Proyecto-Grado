import { GetAllBranches } from "../../../application/branch/GetAllBranches";
import { CreateBranch } from "../../../application/branch/CreateBranch";
import { FindByIdBranch } from "../../../application/branch/FindByIdBranch";
import { UpdateBranch } from "../../../application/branch/UpdateBranch";
import { UpdateStateBranch } from "../../../application/branch/UpdateStateBranch";
import { MysqlBranchRepository } from "../../../infrastructure/repositories/MysqlBranchRepository";

const BranchRepository = new MysqlBranchRepository();

export const BranchServiceContainer = {
    branch: {
        getAll: new GetAllBranches(BranchRepository),
        create: new CreateBranch(BranchRepository),
        findById: new FindByIdBranch(BranchRepository),
        update: new UpdateBranch(BranchRepository),
        updateState: new UpdateStateBranch(BranchRepository),
    }
};
