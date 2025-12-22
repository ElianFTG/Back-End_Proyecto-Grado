"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUsers = void 0;
class GetUsers {
    constructor(repository) {
        this.repository = repository;
    }
    async run() {
        return this.repository.getUsers();
    }
}
exports.GetUsers = GetUsers;
//# sourceMappingURL=GetUsers.js.map