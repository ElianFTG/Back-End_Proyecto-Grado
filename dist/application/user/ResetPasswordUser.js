"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetPasswordUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
class ResetPasswordUser {
    constructor(repository) {
        this.repository = repository;
    }
    async run(id, userId) {
        // fetch user to build password
        const user = await this.repository.findById(id);
        if (!user)
            return false;
        const lastName = user.lastName || '';
        const secondLast = user.secondLastName || '';
        const ci = user.ci || '';
        const first = lastName.trim().charAt(0).toLowerCase() || '';
        const second = secondLast.trim().charAt(0).toLowerCase() || '';
        const plain = `${first}.${second}${ci}sc`;
        const hashed = await bcryptjs_1.default.hash(plain, Number(process.env.SALT));
        const updated = await this.repository.resetPassword(id, hashed, userId);
        if (!updated)
            return false;
        return true;
    }
}
exports.ResetPasswordUser = ResetPasswordUser;
//# sourceMappingURL=ResetPasswordUser.js.map