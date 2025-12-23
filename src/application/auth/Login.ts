import bcrypt from "bcryptjs";
import { UserRepository } from "../../domain/user/UserRepository";
import { AuthService } from "../../domain/auth/AuthService";

export class Login {
  constructor(
    private userRepository: UserRepository,
    private authService: AuthService
  ) {}

  async run(userName: string, password: string)  {
    if (!userName || !password) {
      return null;
    }
    const user = await this.userRepository.findByUserName(userName);
    if (!user) return null;
    if (!user.state) return null; 
    const validPassword = await bcrypt.compare(
      password,
      user.passwordHash
    );
    if (!validPassword) return null;
    const userId = user.user.id;
    const role = user.user.role;
    const token = this.authService.sign({userId, role});
    return {
      token,
      user: user.user,
    };
  }
}
