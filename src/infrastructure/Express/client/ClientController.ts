import { Request, Response } from "express";
import { Client } from "../../../domain/client/Client";
import { ClientServiceContainer } from "../../../shared/service_containers/client/ClientServiceContainer";

function toResponse(c: Client) {
  return {
    id: c.id,
    name: c.name,
    lastName: c.lastName,
    secondLastName: c.secondLastName,
    phone: c.phone,
    ci: c.ci,
    clientTypeId: c.clientTypeId,
  };
}

export class ClientController {
  async create(req: Request, res: Response) {
    const userId = req.auth?.userId ?? null;
    const body: any = req.body;

    if (!body.name || !body.lastName || !body.secondLastName || !body.phone) {
      return res.status(400).json({ message: "Campos requeridos: name, lastName, secondLastName, phone" });
    }

    const clientTypeId = Number(body.clientTypeId);
    if (Number.isNaN(clientTypeId)) return res.status(400).json({ message: "clientTypeId inválido" });

    const client = new Client(
      body.name,
      body.lastName,
      body.secondLastName,
      body.phone,
      clientTypeId,
      body.ci ?? null
    );

    const created = await ClientServiceContainer.client.createClient.run(client, userId);
    if (!created?.id) return res.status(400).json({ message: "No se pudo crear el cliente" });

    return res.status(201).json(toResponse(created));
  }

  async getAll(req: Request, res: Response) {
    const clients = await ClientServiceContainer.client.getClients.run();
    return res.status(200).json(clients.map(toResponse));
  }

  async findById(req: Request, res: Response) {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: "ID inválido" });

    const client = await ClientServiceContainer.client.findByIdClient.run(id);
    if (!client) return res.status(404).json({ message: "Cliente no encontrado" });

    return res.status(200).json(toResponse(client));
  }

  async update(req: Request, res: Response) {
    const userId = req.auth?.userId ?? null;
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: "ID inválido" });

    const body: any = req.body;
    const patch: any = {};

    if (body.name !== undefined) patch.name = body.name;
    if (body.lastName !== undefined) patch.lastName = body.lastName;
    if (body.secondLastName !== undefined) patch.secondLastName = body.secondLastName;
    if (body.phone !== undefined) patch.phone = body.phone;
    if (body.ci !== undefined) patch.ci = body.ci;

    if (body.clientTypeId !== undefined) {
      const ct = Number(body.clientTypeId);
      if (Number.isNaN(ct)) return res.status(400).json({ message: "clientTypeId inválido" });
      patch.clientTypeId = ct;
    }

    const updated = await ClientServiceContainer.client.updateClient.run(id, patch, userId);
    if (!updated) return res.status(404).json({ message: "Cliente no encontrado" });

    return res.status(200).json(toResponse(updated));
  }

  async softDelete(req: Request, res: Response) {
    const userId = req.auth?.userId ?? null;
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: "ID inválido" });

    const ok = await ClientServiceContainer.client.softDeleteClient.run(id, userId);
    if (!ok) return res.status(404).json({ message: "Cliente no encontrado" });

    return res.status(200).json({ message: "Eliminado" });
  }

  async search(req: Request, res: Response) {
    const search = String(req.query.q || '').trim();
    let limit = Number(req.query.limit) || 10;
    
    if (limit > 50) limit = 50;
    if (limit < 1) limit = 10;

    const clients = await ClientServiceContainer.client.searchClients.run({ search, limit });
    return res.status(200).json(clients.map(toResponse));
  }
}
