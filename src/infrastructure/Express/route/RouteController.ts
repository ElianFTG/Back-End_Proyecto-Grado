import { Request, Response } from "express";
import { Route } from "../../../domain/route/Route";
import { RouteServiceContainer } from "../../../shared/service_containers/route/RouteServiceContainer";

function toResponse(route: Route) {
  return {
    id: route.id,
    assignedDate: route.assignedDate,      
    assignedIdUser: route.assignedIdUser,  
    assignedIdArea: route.assignedIdArea,  
  };
}

function parseAssignedDate(raw: any): Date | null {
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

export class RouteController {
  async create(req: Request, res: Response) {
    const auditUserId = req.auth?.userId ?? null;
    const body: any = req.body;

    const assignedDate = parseAssignedDate(body.assignedDate ?? body.assigned_date);
    const assignedIdUser = Number(body.assignedIdUser ?? body.assigned_id_user);
    const assignedIdArea = Number(body.assignedIdArea ?? body.assigned_id_area);
    const validated = Number.isNaN(assignedIdUser) || Number.isNaN(assignedIdArea) || !assignedDate;
    if (validated) return res.status(400).json({ message: "Datos inválidos" });

    const route = new Route(assignedDate, assignedIdUser, assignedIdArea);

    const created = await RouteServiceContainer.route.createRoute.run(route, auditUserId);
    if (!created?.id) return res.status(400).json({ message: "No se pudo crear la ruta" });

    return res.status(201).json(toResponse(created));
  }

  

  async findById(req: Request, res: Response) {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: "ID inválido" });

    const route = await RouteServiceContainer.route.findByIdRoute.run(id);
    if (!route) return res.status(404).json({ message: "Ruta no encontrada" });

    return res.status(200).json(toResponse(route));
  }

  async getClientsByRouteUserDate(req: Request, res: Response) {
    const userId = req.auth?.userId;
    const date = String(req.query.date || "");

    if (!userId) return res.status(401).json({ message: "No autenticado" });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ message: "fecha inválida (YYYY-MM-DD)" });
    }

    // const clients = await RouteServiceContainer.route.getClientsByRouteUserDate.run(userId, date);
    // return res.status(200).json(clients);
  }

  
}
