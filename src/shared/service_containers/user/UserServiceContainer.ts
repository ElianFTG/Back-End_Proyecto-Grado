import { CreateUser } from "../../../application/user/CreateUser";
import { FindByCiUser } from "../../../application/user/FindByCiUser";
import { FindByIdUser } from "../../../application/user/FindByIdUser";
import { GetUsers } from "../../../application/user/GetUsers";
import { UpdateStateUser } from "../../../application/user/UpdateStateUser";
import { UpdateUser } from "../../../application/user/UpdateUser";
import { ResetPasswordUser } from "../../../application/user/ResetPasswordUser";
import { UpdatePasswordUser } from "../../../application/user/UpdatePasswordUser";
import { ChangeFirstLoginPassword } from "../../../application/user/ChangeFirstLoginPassword";
import { MysqlUserRepository } from "../../../infrastructure/repositories/MysqlUserRepository";
import { NodemailerEmailService } from "../../../infrastructure/services/NodemailerEmailService";


const UserRepository = new MysqlUserRepository();
const EmailService = new NodemailerEmailService();

export const UserServiceContainer = {
    user: {
        getUsers: new GetUsers(UserRepository),
        create: new CreateUser(UserRepository, EmailService),
        findById: new FindByIdUser(UserRepository),
        findByCi: new FindByCiUser(UserRepository),
        update: new UpdateUser(UserRepository),
        updateState: new UpdateStateUser(UserRepository),
        resetPassword: new ResetPasswordUser(UserRepository),
        updatePassword: new UpdatePasswordUser(UserRepository),
        changeFirstLoginPassword: new ChangeFirstLoginPassword(UserRepository)
    }
}