"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserServiceContainer = void 0;
const CreateUser_1 = require("../../../application/user/CreateUser");
const FindByCiUser_1 = require("../../../application/user/FindByCiUser");
const FindByIdUser_1 = require("../../../application/user/FindByIdUser");
const GetUsers_1 = require("../../../application/user/GetUsers");
const UpdateStateUser_1 = require("../../../application/user/UpdateStateUser");
const UpdateUser_1 = require("../../../application/user/UpdateUser");
const ResetPasswordUser_1 = require("../../../application/user/ResetPasswordUser");
const UpdatePasswordUser_1 = require("../../../application/user/UpdatePasswordUser");
const MysqlUserRepository_1 = require("../../../infrastructure/repositories/MysqlUserRepository");
const UserRepository = new MysqlUserRepository_1.MysqlUserRepository();
exports.UserServiceContainer = {
    user: {
        getUsers: new GetUsers_1.GetUsers(UserRepository),
        create: new CreateUser_1.CreateUser(UserRepository),
        findById: new FindByIdUser_1.FindByIdUser(UserRepository),
        findByCi: new FindByCiUser_1.FindByCiUser(UserRepository),
        update: new UpdateUser_1.UpdateUser(UserRepository),
        updateState: new UpdateStateUser_1.UpdateStateUser(UserRepository),
        resetPassword: new ResetPasswordUser_1.ResetPasswordUser(UserRepository),
        updatePassword: new UpdatePasswordUser_1.UpdatePasswordUser(UserRepository)
    }
};
//# sourceMappingURL=UserServiceContainer.js.map