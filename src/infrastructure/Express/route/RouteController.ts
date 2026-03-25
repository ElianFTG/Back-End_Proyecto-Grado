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

      const activity = new Activity(assignedDate, assignedIdUser)
      await ActivityServiceContainer.activity.createActivity.run(activity, auditUserId)

      return res.status(201).json({ created })
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
