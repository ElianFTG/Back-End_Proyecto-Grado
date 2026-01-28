import { Request, Response } from "express";
import { RejectionServiceContainer } from "../../../shared/service_containers/rejection/RejectionServiceContainer";

export class RejectionController {
  async create(req: Request, res: Response) {
    const userId = req.auth?.userId ?? null;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "name requerido" });
    }

    const created = await RejectionServiceContainer.rejection.createRejection.run(
      name,
      userId
    );

    if (!created) {
      return res.status(400).json({ message: "No se pudo crear" });
    }

    return res.status(201).json(created);
  }

  async getAll(_req: Request, res: Response) {
    const list = await RejectionServiceContainer.rejection.getRejections.run();
    return res.status(200).json(list);
  }
}
