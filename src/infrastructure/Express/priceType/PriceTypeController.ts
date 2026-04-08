import { Request, Response } from "express";
import { PriceType } from "../../../domain/priceType/PriceType";
import { PriceTypeServiceContainer } from "../../../shared/service_containers/priceType/PriceTypeServiceContainer";

export class PriceTypeController {
  async create(req: Request, res: Response) {
    const userId = req.auth?.userId ?? null;
    const body: any = req.body;
    if (!body.name) return res.status(400).json({ message: "name requerido" });

    const created = await PriceTypeServiceContainer.priceType.createPriceType.run(
      new PriceType(body.name),
      userId
    );
    if (!created?.id) return res.status(400).json({ message: "No se pudo crear" });

    return res.status(201).json({ id: created.id, name: created.name });
  }

  async getAll(req: Request, res: Response) {
    const list = await PriceTypeServiceContainer.priceType.getPriceTypes.run();
    return res.status(200).json(list.map((x) => ({ id: x.id, name: x.name })));
  }
}
