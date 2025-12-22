"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUser = void 0;
class UpdateUser {
    constructor(repository) {
        this.repository = repository;
    }
    async run(id, user, userId) {
        return this.repository.update(id, user, userId);
    }
}
exports.UpdateUser = UpdateUser;
//# sourceMappingURL=UpdateUser.js.map