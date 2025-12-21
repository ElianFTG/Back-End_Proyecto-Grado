import { Router } from "express";
import { CountryController } from "./CountryController";

const controller = new CountryController();

const CountryRouter = Router();

CountryRouter.get("/countries", controller.getAll.bind(controller));

export { CountryRouter };
