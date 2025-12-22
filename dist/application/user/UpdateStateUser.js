"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateStateUser = void 0;
class UpdateStateUser {
    constructor(repository) {
        this.repository = repository;
    }
    async run(id, user_id) {
        return this.repository.updateState(id, user_id);
    }
}
exports.UpdateStateUser = UpdateStateUser;
//# sourceMappingURL=UpdateStateUser.js.map