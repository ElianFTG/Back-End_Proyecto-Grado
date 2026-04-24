import { Request, Response } from "express";
import { Route } from "../../../domain/route/Route";
import { RouteServiceContainer } from "../../../shared/service_containers/route/RouteServiceContainer";
import { Activity } from "../../../domain/activity/Activity";
import { ActivityServiceContainer } from "../../../shared/service_containers/activity/ActivityServiceContainer";

function toResponse(route: Route) {
  return {
    id: route.id,
    assignedDate: route.assignedDate,
    assignedIdUser: route.assignedIdUser,
    assignedIdArea: route.assignedIdArea,
  };
}

// Normaliza cualquier valor de fecha (string ISO, Date, o "YYYY-MM-DD") a "YYYY-MM-DD"
function toDateString(value: string | Date): string {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  // Puede venir como "2026-04-25T00:00:00.000Z" desde TypeORM en runtime
  return String(value).slice(0, 10);
}

export class RouteController {
  async create(req: Request, res: Response) {
    try {
      const auditUserId = (req as any).auth?.userId ?? null;
      const body: any = req.body;

      const assignedDate = body.assignedDate;
      const assignedIdUser = Number(body.assignedIdUser ?? body.assigned_id_user);
      const assignedIdArea = Number(body.assignedIdArea ?? body.assigned_id_area);
      const validated = Number.isNaN(assignedIdUser) || Number.isNaN(assignedIdArea) || !assignedDate;
      if (validated) return res.status(400).json({ message: "Datos inválidos" });

      const route = new Route(assignedDate, assignedIdUser, assignedIdArea);
      const created = await RouteServiceContainer.route.createRoute.run(route, auditUserId);
      if (!created?.id) return res.status(400).json({ message: "No se pudo crear la ruta" });

      const activity = new Activity(assignedDate, assignedIdUser);
      await ActivityServiceContainer.activity.createActivity.run(activity, auditUserId);

      return res.status(201).json({ created });
    } catch (error: any) {
      console.log(error);
      if (error?.message === "ROUTE_USER_DATE_DUPLICATE") {
        return res.status(409).json({ message: "Ya existe una ruta asignada para ese usuario en esa fecha" });
      }
      return res.status(500).json({ message: "Error interno" });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const auditUserId = (req as any).auth?.userId ?? null;
      const id = Number(req.params.id);
      if (Number.isNaN(id)) return res.status(400).json({ message: "ID inválido" });

      const body: any = req.body;

      const fields: Partial<Pick<Route, "assignedDate" | "assignedIdUser" | "assignedIdArea">> = {};

      if (body.assignedDate !== undefined) {
        fields.assignedDate = body.assignedDate;
      }
      if (body.assignedIdUser !== undefined || body.assigned_id_user !== undefined) {
        const val = Number(body.assignedIdUser ?? body.assigned_id_user);
        if (Number.isNaN(val)) return res.status(400).json({ message: "assignedIdUser inválido" });
        fields.assignedIdUser = val;
      }
      if (body.assignedIdArea !== undefined || body.assigned_id_area !== undefined) {
        const val = Number(body.assignedIdArea ?? body.assigned_id_area);
        if (Number.isNaN(val)) return res.status(400).json({ message: "assignedIdArea inválido" });
        fields.assignedIdArea = val;
      }

      if (Object.keys(fields).length === 0) {
        return res.status(400).json({ message: "No se proporcionaron campos para actualizar" });
      }

      const existing = await RouteServiceContainer.route.findByIdRoute.run(id);
      if (!existing) return res.status(404).json({ message: "Ruta no encontrada" });

      const existingDateStr = toDateString(existing.assignedDate);
      const incomingDateStr = fields.assignedDate ? toDateString(fields.assignedDate) : undefined;

      const dateChanged = incomingDateStr !== undefined && incomingDateStr !== existingDateStr;
      const userChanged = fields.assignedIdUser !== undefined && fields.assignedIdUser !== existing.assignedIdUser;

      const updated = await RouteServiceContainer.route.updateRoute.run(id, fields, auditUserId);
      if (!updated) return res.status(400).json({ message: "No se pudo actualizar la ruta" });

      if (dateChanged || userChanged) {
        const activity = await ActivityServiceContainer.activity.getActivityByDateAndUserId.run(
          existingDateStr,
          existing.assignedIdUser
        );

        if (activity?.id) {
          const activityFields: { assignedDate?: string; responsibleUserId?: number } = {};

          if (dateChanged) activityFields.assignedDate = incomingDateStr;
          if (userChanged && fields.assignedIdUser !== undefined) {
            activityFields.responsibleUserId = fields.assignedIdUser;
          }

          await ActivityServiceContainer.activity.updateActivity.run(
            activity.id,
            activityFields,
            auditUserId
          );
        }
      }

      return res.status(200).json({ updated: toResponse(updated) });
    } catch (error: any) {
      console.log(error);
      if (error?.message === "ROUTE_USER_DATE_DUPLICATE") {
        return res.status(409).json({ message: "Ya existe una ruta asignada para ese usuario en esa fecha" });
      }
      return res.status(500).json({ message: "Error interno" });
    }
  }

  async findById(req: Request, res: Response) {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: "ID inválido" });

    const route = await RouteServiceContainer.route.findByIdRoute.run(id);
    if (!route) return res.status(404).json({ message: "Ruta no encontrada" });

    return res.status(200).json(toResponse(route));
  }

  async getRoutes(req: Request, res: Response) {
    const routes = await RouteServiceContainer.route.getRoutes.run();
    if (!routes) return res.status(404).json({ message: "No hay rutas registradas" });
    return res.status(200).json(routes);
  }
}