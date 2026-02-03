import { Router } from "express";
import { UserController } from "./UserController";
import { AuthServiceContainer } from "../../../shared/service_containers/auth/AuthServiceContainer";
import { authJwt } from "../middlewares/authJwt";
import { requireRole } from "../middlewares/requireRole";

const controller = new UserController();
const authService = AuthServiceContainer.authService();
 
const UserRouter = Router();

UserRouter.get("/users", authJwt(authService), requireRole("administrador", "propietario"), controller.getUsers);
UserRouter.get("/users/ci/:ci", controller.findByCi);
UserRouter.get("/users/:id", controller.findById);

UserRouter.post("/users", authJwt(authService), requireRole("administrador", "propietario"), controller.create);

UserRouter.patch("/users/:id", authJwt(authService), requireRole("administrador", "propietario"), controller.update);

UserRouter.patch("/users/:id/state", authJwt(authService), requireRole("administrador", "propietario"), controller.updateState);

UserRouter.post('/users/:id/reset-password', authJwt(authService), requireRole("administrador", "propietario"), controller.resetPassword);
UserRouter.patch('/users/:id/password', authJwt(authService), controller.updatePassword);

UserRouter.post('/users/change-first-login-password', authJwt(authService), controller.changeFirstLoginPassword);

export { UserRouter };