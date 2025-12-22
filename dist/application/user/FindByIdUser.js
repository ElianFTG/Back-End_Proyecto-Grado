"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FindByIdUser = void 0;
const UserNotFound_1 = require("../../domain/errors/user/UserNotFound");
class FindByIdUser {
    constructor(repository) {
        this.repository = repository;
    }
    async run(id) {
        const user = await this.repository.findById(id);
        if (!user)
            throw new UserNotFound_1.UserNotFound("User not found");
        return user;
    }
}
exports.FindByIdUser = FindByIdUser;
//# sourceMappingURL=FindByIdUser.js.map