import { User } from "./User"

export type UserAuthRecord = {
    user : User;
    passwordHash: string;
    state: boolean;
}