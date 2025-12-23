import { Request, Response } from "express";
import { Client } from "../../../domain/client/Client";
import { ClientServiceContainer } from "../../../shared/service_containers/client/ClientServiceContainer";

export class ClientController {

  async create(req: Request, res: Response) {
    const userId = req.auth?.userId;
    if (!userId) return res.status(401).json({ message: "No autenticado" });

    const body = req.body;

    const client = new Client(
      body.fullName,
      body.position, // {lat,lng}
      body.nitCi,
      body.businessName,
      body.phone,
      body.businessType,
      body.clientType,
      true,
      body.address ?? null,
      body.pathImage ?? null
    );

    const created = await ClientServiceContainer.client.createClient.run(client, userId);
    if (!created) return res.status(400).json({ message: "No se pudo crear (nitCi duplicado?)" });

    return res.status(201).json(created);
  }

  async getAll(req: Request, res: Response) {
    const onlyActive = req.query.all === "true" ? false : true;
    const clients = await ClientServiceContainer.client.getClients.run(onlyActive);
    return res.status(200).json(clients);
  }

  async findById(req: Request, res: Response) {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: "ID inválido" });

    const client = await ClientServiceContainer.client.findByIdClient.run(id);
    if (!client) return res.status(404).json({ message: "Cliente no encontrado" });

    return res.status(200).json(client);
  }

  async update(req: Request, res: Response) {
    const userId = req.auth?.userId;
    if (!userId) return res.status(401).json({ message: "No autenticado" });

    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: "ID inválido" });

    const updated = await ClientServiceContainer.client.updateClient.run(id, req.body, userId);
    if (!updated) return res.status(404).json({ message: "Cliente no encontrado" });

    return res.status(200).json(updated);
  }

  async softDelete(req: Request, res: Response) {
    const userId = req.auth?.userId;
    if (!userId) return res.status(401).json({ message: "No autenticado" });

    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: "Cliente no encontrado" });

    const ok = await ClientServiceContainer.client.softDeleteClient.run(id, userId);
    if (!ok) return res.status(404).json({ message: "Cliente no encontrado" });

    return res.status(200).json({ message: "Eliminado" });
  }
}
