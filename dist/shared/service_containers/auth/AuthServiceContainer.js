"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthServiceContainer = void 0;
const MysqlUserRepository_1 = require("../../../infrastructure/repositories/MysqlUserRepository");
const JwtAuthService_1 = require("../../../infrastructure/services/JwtAuthService");
const Login_1 = require("../../../application/auth/Login");
const AuthController_1 = require("../../../infrastructure/Express/auth/AuthController");
class AuthServiceContainer {
    static authController() {
        const userRepo = new MysqlUserRepository_1.MysqlUserRepository();
        const authService = new JwtAuthService_1.JwtAuthService();
        const login = new Login_1.Login(userRepo, authService);
        return new AuthController_1.AuthController(login);
    }
    ;
    static authService() {
        return new JwtAuthService_1.JwtAuthService();
    }
}
exports.AuthServiceContainer = AuthServiceContainer;
//# sourceMappingURL=AuthServiceContainer.js.map