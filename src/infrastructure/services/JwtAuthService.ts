import jwt from "jsonwebtoken";
import { AuthService } from "../../domain/auth/AuthService";
import { AuthToken } from "../../domain/auth/AuthToken";

export class JwtAuthService implements AuthService {
  private secret: string;
  private expiresInSeconds: number;

  constructor() {
    this.secret = process.env.JWT_SECRET || "dev_secret_change_me";
    this.expiresInSeconds = Number(process.env.JWT_EXPIRES_IN || 3600);
  }

  sign(payload: Record<string, any>): AuthToken {
    const accessToken = jwt.sign(payload, this.secret, {
      expiresIn: this.expiresInSeconds,
    });

    return { accessToken, expiresIn: this.expiresInSeconds };
  }

  verify<T = any>(token: string): T {
    return jwt.verify(token, this.secret) as T;
  }
}
