"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUser = void 0;
const User_1 = require("../../domain/user/User");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
class CreateUser {
    constructor(repository) {
        this.repository = repository;
    }
    async run(ci, names, lastName, secondLastName, role, branchId, userName, password, userId) {
        const passwordHashed = await bcryptjs_1.default.hash(password, Number(process.env.SALT));
        return this.repository.create(new User_1.User(ci, names, lastName, secondLastName, role, branchId, userName), passwordHashed, userId);
    }
}
exports.CreateUser = CreateUser;
//# sourceMappingURL=CreateUser.js.map