import { Request, Response } from "express";
import { CountryServiceContainer } from "../../../shared/service_containers/country/CountryServiceContainer";

export class CountryController {
    async getAll(req: Request, res: Response) {
        const countries = await CountryServiceContainer.country.getAll.run();
        return res.status(200).json(countries);
    }
}
