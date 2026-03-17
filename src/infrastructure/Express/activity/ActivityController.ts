import { Request, Response } from "express";
import { Activity } from "../../../domain/activity/Activity";
import { ActivityServiceContainer } from "../../../shared/service_containers/activity/ActivityServiceContainer";

export class ActivityController {
  async create(req: Request, res: Response) {
    const auditUserId = req.auth?.userId ?? null;
    const body: any = req.body;

    const assignedDate = body.assignedDate;
    const responsibleUserId = Number(body.responsibleUserId);

    if (!assignedDate) return res.status(400).json({ message: "La fecha de asignación es obligatoria" });
    if (Number.isNaN(responsibleUserId)) return res.status(400).json({ message: "responsibleUserId inválido" });

    const activity = new Activity(assignedDate, responsibleUserId);

    const created = await ActivityServiceContainer.activity.createActivity.run(activity, auditUserId);
    if (!created?.id) return res.status(400).json({ message: "No se pudo crear la actividad" });

    return res.status(201).json({
      id: created.id,
      responsibleUserId: created.responsibleUserId,
      assignedDate: created.assignedDate,
    });
  }
}
