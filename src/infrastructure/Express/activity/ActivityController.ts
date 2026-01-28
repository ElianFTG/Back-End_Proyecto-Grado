import { Request, Response } from "express";
import { Activity } from "../../../domain/activity/Activity";
import { ActivityServiceContainer } from "../../../shared/service_containers/activity/ActivityServiceContainer";

export class ActivityController {
  async create(req: Request, res: Response) {
    const auditUserId = req.auth?.userId ?? null;
    const body: any = req.body;

    const action = body.action;
    const routeId = Number(body.routeId);
    const responsibleUserId = Number(body.responsibleUserId);
    const businessId = Number(body.businessId);

    if (!action) return res.status(400).json({ message: "action inválido" })
    if (Number.isNaN(routeId)) return res.status(400).json({ message: "routeId inválido" });
    if (Number.isNaN(responsibleUserId)) return res.status(400).json({ message: "responsibleUserId inválido" });
    if (Number.isNaN(businessId)) return res.status(400).json({ message: "businessId inválido" });

    let rejectionId: number | null = null;
    if (body.rejectionId !== undefined && body.rejectionId !== null && body.rejectionId !== "") {
      const r = Number(body.rejectionId);
      if (Number.isNaN(r)) return res.status(400).json({ message: "rejectionId inválido" });
      rejectionId = r;
    }

    const activity = new Activity(action, routeId, responsibleUserId, businessId, rejectionId);

    const created = await ActivityServiceContainer.activity.createActivity.run(activity, auditUserId);
    if (!created?.id) return res.status(400).json({ message: "No se pudo crear la actividad" });

    return res.status(201).json({
      id: created.id,
      createdAt: created.createdAt ?? null,
      action: created.action,
      routeId: created.routeId,
      responsibleUserId: created.responsibleUserId,
      businessId: created.businessId,
      rejectionId: created.rejectionId,
    });
  }
}
