import { Request, Response } from "express";
import { ClientType } from "../../../domain/clientType/ClientType";
import { ClientTypeServiceContainer } from "../../../shared/service_containers/clientType/ClientTypeServiceContainer";

export class ClientTypeController {
  async create(req: Request, res: Response) {
    const userId = req.auth?.userId ?? null;
    const body: any = req.body;
    if (!body.name) return res.status(400).json({ message: "name requerido" });

    const created = await ClientTypeServiceContainer.clientType.createClientType.run(new ClientType(body.name), userId);
    if (!created?.id) return res.status(400).json({ message: "No se pudo crear" });

    return res.status(201).json({ id: created.id, name: created.name });
  }

  async getAll(req: Request, res: Response) {
    const list = await ClientTypeServiceContainer.clientType.getClientTypes.run();
    return res.status(200).json(list.map((x) => ({ id: x.id, name: x.name })));
  }
}
