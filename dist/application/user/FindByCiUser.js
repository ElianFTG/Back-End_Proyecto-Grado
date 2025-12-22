"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FindByCiUser = void 0;
const UserNotFound_1 = require("../../domain/errors/user/UserNotFound");
class FindByCiUser {
    constructor(repository) {
        this.repository = repository;
    }
    async run(ci) {
        const user = await this.repository.findByCi(ci);
        if (!user)
            throw new UserNotFound_1.UserNotFound("User not found");
        return user;
    }
}
exports.FindByCiUser = FindByCiUser;
//# sourceMappingURL=FindByCiUser.js.map