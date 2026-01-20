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
    console.log(body)

    if (!body.name || !body.last_name || !body.second_last_name || !body.phone) {
      return res.status(400).json({ message: "Campos requeridos: name, lastName, secondLastName, phone" });
    }

    const clientTypeId = Number(body.client_type_id);
    if (Number.isNaN(clientTypeId)) return res.status(400).json({ message: "clientTypeId inválido" });

    const client = new Client(
      body.name,
      body.last_name,
      body.second_last_name,
      body.phone,
      clientTypeId,
      body.ci ?? null
    );

    const created = await ClientServiceContainer.client.createClient.run(client, userId);
    if (!created?.id) return res.status(400).json({ message: "No se pudo crear el cliente" });

    return res.status(201).json(toResponse(created));
  }

  async getAll(req: Request, res: Response) {
    const onlyActive = req.query.onlyActive !== "false";
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
    if (body.last_name !== undefined) patch.lastName = body.last_name;
    if (body.second_last_name !== undefined) patch.secondLastName = body.second_last_name;
    if (body.phone !== undefined) patch.phone = body.phone;
    if (body.ci !== undefined) patch.ci = body.ci;

    if (body.client_type_id !== undefined) {
      const ct = Number(body.client_type_id);
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

  /**
   * Búsqueda dinámica de clientes
   * 
   * GET /clients/search?q=Juan&limit=10
   * 
   * Query params:
   * - q: Término de búsqueda (busca en apellidos paterno/materno, nombres, CI, teléfono)
   * - limit: Máximo de resultados a retornar (por defecto 10, máximo 50)
   * 
   * Response: Array de clientes que coinciden, ordenados por apellido paterno, apellido materno, nombres
   * [
   *   {
   *     "id": 1,
   *     "name": "Juan",
   *     "lastName": "Pérez",
   *     "secondLastName": "García",
   *     "phone": "77712345",
   *     "ci": "12345678",
   *     "clientTypeId": 1
   *   },
   *   ...
   * ]
   */
  async search(req: Request, res: Response) {
    const search = String(req.query.q || '').trim();
    let limit = Number(req.query.limit) || 10;
    
    // Limitar máximo a 50 para evitar sobrecarga
    if (limit > 50) limit = 50;
    if (limit < 1) limit = 10;

    const clients = await ClientServiceContainer.client.searchClients.run({ search, limit });
    return res.status(200).json(clients.map(toResponse));
  }
}
