"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateStateBranch = void 0;
class UpdateStateBranch {
    constructor(repository) {
        this.repository = repository;
    }
    async run(id, userId) {
        return this.repository.updateState(id, userId);
    }
}
exports.UpdateStateBranch = UpdateStateBranch;
//# sourceMappingURL=UpdateStateBranch.js.map