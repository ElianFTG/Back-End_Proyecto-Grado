import { Request, Response } from "express";
import { BusinessType } from "../../../domain/businessType/BusinessType";
import { BusinessTypeServiceContainer } from "../../../shared/service_containers/businessType/BusinessTypeServiceContainer";

export class BusinessTypeController {
  async create(req: Request, res: Response) {
    const userId = req.auth?.userId ?? null;
    const body: any = req.body;
    if (!body.name) return res.status(400).json({ message: "name requerido" });

    const created = await BusinessTypeServiceContainer.businessType.createBusinessType.run(new BusinessType(body.name), userId);
    if (!created?.id) return res.status(400).json({ message: "No se pudo crear" });

    return res.status(201).json({ id: created.id, name: created.name });
  }

  async getAll(req: Request, res: Response) {
    const list = await BusinessTypeServiceContainer.businessType.getBusinessTypes.run();
    return res.status(200).json(list.map((x) => ({ id: x.id, name: x.name })));
  }
}
