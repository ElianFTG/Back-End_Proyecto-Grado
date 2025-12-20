import { MysqlUserRepository } from "../../../infrastructure/repositories/MysqlUserRepository";
import { JwtAuthService } from "../../../infrastructure/services/JwtAuthService";
import { Login } from "../../../application/auth/Login";
import { AuthController } from "../../../infrastructure/Express/auth/AuthController";

export class AuthServiceContainer {
  static authController(): AuthController {
    const userRepo = new MysqlUserRepository();
    const authService = new JwtAuthService();
    const login = new Login(userRepo, authService);

    return new AuthController(login);
  }
}