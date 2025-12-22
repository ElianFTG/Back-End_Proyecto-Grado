import { CreateUser } from "../../../application/user/CreateUser";
import { FindByCiUser } from "../../../application/user/FindByCiUser";
import { FindByIdUser } from "../../../application/user/FindByIdUser";
import { GetUsers } from "../../../application/user/GetUsers";
import { UpdateStateUser } from "../../../application/user/UpdateStateUser";
import { UpdateUser } from "../../../application/user/UpdateUser";
import { ResetPasswordUser } from "../../../application/user/ResetPasswordUser";
import { UpdatePasswordUser } from "../../../application/user/UpdatePasswordUser";
import { MysqlUserRepository } from "../../../infrastructure/repositories/MysqlUserRepository";


const UserRepository = new MysqlUserRepository();

export const UserServiceContainer = {
    user: {
        getUsers : new GetUsers(UserRepository),
        create: new CreateUser(UserRepository),
        findById: new FindByIdUser(UserRepository),
        findByCi: new FindByCiUser(UserRepository),
        update: new UpdateUser(UserRepository),
        updateState: new UpdateStateUser(UserRepository),
        resetPassword: new ResetPasswordUser(UserRepository),
        updatePassword: new UpdatePasswordUser(UserRepository)
    }
}