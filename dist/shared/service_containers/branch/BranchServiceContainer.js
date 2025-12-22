"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BranchServiceContainer = void 0;
const GetAllBranches_1 = require("../../../application/branch/GetAllBranches");
const CreateBranch_1 = require("../../../application/branch/CreateBranch");
const FindByIdBranch_1 = require("../../../application/branch/FindByIdBranch");
const UpdateBranch_1 = require("../../../application/branch/UpdateBranch");
const UpdateStateBranch_1 = require("../../../application/branch/UpdateStateBranch");
const MysqlBranchRepository_1 = require("../../../infrastructure/repositories/MysqlBranchRepository");
const BranchRepository = new MysqlBranchRepository_1.MysqlBranchRepository();
exports.BranchServiceContainer = {
    branch: {
        getAll: new GetAllBranches_1.GetAllBranches(BranchRepository),
        create: new CreateBranch_1.CreateBranch(BranchRepository),
        findById: new FindByIdBranch_1.FindByIdBranch(BranchRepository),
        update: new UpdateBranch_1.UpdateBranch(BranchRepository),
        updateState: new UpdateStateBranch_1.UpdateStateBranch(BranchRepository),
    }
};
//# sourceMappingURL=BranchServiceContainer.js.map