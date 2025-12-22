"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Login = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class Login {
    constructor(userRepository, authService) {
        this.userRepository = userRepository;
        this.authService = authService;
    }
    async run(userName, password) {
        const user = await this.userRepository.findByUserName(userName);
        if (!user)
            return null;
        if (!user.state)
            return null;
        const validPassword = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!validPassword)
            return null;
        const id = user.user.id;
        const role = user.user.role;
        const token = this.authService.sign({ id, role });
        return {
            token,
            user: user.user,
        };
    }
}
exports.Login = Login;
//# sourceMappingURL=Login.js.map