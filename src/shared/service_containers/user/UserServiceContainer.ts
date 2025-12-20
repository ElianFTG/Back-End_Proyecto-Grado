import { CreateUser } from "../../../application/user/CreateUser";
import { FindByIdUser } from "../../../application/user/FindByIdUser";
import { GetUsers } from "../../../application/user/GetUsers";
import { UpdateStateUser } from "../../../application/user/UpdateStateUser";
import { UpdateUser } from "../../../application/user/UpdateUser";
import { MysqlUserRepository } from "../../../infrastructure/repositories/MysqlUserRepository";


const UserRepository = new MysqlUserRepository();

export const UserServiceContainer = {
    user: {
        getUsers : new GetUsers(UserRepository),
        create: new CreateUser(UserRepository),
        findById: new FindByIdUser(UserRepository),
        update: new UpdateUser(UserRepository),
        updateState: new UpdateStateUser(UserRepository)
    }
}