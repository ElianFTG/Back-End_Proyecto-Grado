import { User } from "../user/User";

export type AuthToken = {
  accessToken: string;
  expiresIn: number; 
};