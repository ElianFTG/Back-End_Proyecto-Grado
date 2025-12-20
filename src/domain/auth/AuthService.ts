import { AuthToken } from "./AuthToken";

export interface AuthService {
  sign(payload: Record<string, any>): AuthToken;
  verify<T = any>(token: string): T;
}