"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePasswordUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
class UpdatePasswordUser {
    constructor(repository) {
        this.repository = repository;
    }
    async run(id, newPassword, userId) {
        const hashed = await bcryptjs_1.default.hash(newPassword, Number(process.env.SALT));
        const updated = await this.repository.updatePassword(id, hashed, userId);
        return !!updated;
    }
}
exports.UpdatePasswordUser = UpdatePasswordUser;
//# sourceMappingURL=UpdatePasswordUser.js.map