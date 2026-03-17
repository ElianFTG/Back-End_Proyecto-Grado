import { Request, Response } from "express";
import { ActivityDetail } from "../../../domain/activity/Activity";
import { ActivityServiceContainer } from "../../../shared/service_containers/activity/ActivityServiceContainer";
import { MysqlActivityRepository } from "../../repositories/MysqlActivityRepository";
import { MysqlRejectionRepository } from "../../repositories/MysqlRejectionRepository";

const VALID_ACTIONS = ["visitado", "preventa", "venta"] as const;
type ActivityAction = typeof VALID_ACTIONS[number];

const activityRepo = new MysqlActivityRepository();
const rejectionRepo = new MysqlRejectionRepository();

export class ActivityController {
  async createDetail(req: Request, res: Response): Promise<void> {
    try {
      const body: any = req.body;

      const activityId = Number(body.activity_id);
      const action = body.action;
      const rejectionId = body.rejection_id !== undefined && body.rejection_id !== null
        ? Number(body.rejection_id)
        : null;
      const businessId = Number(body.business_id);

      if (!activityId || isNaN(activityId)) {
        res.status(400).json({ message: "activity_id inválido" });
        return;
      }
      if (!action) {
        res.status(400).json({ message: "action es requerido" });
        return;
      }
      if (!VALID_ACTIONS.includes(action as ActivityAction)) {
        res.status(400).json({ message: `action no válido. Valores permitidos: ${VALID_ACTIONS.join(", ")}` });
        return;
      }
      if (!businessId || isNaN(businessId)) {
        res.status(400).json({ message: "business_id inválido" });
        return;
      }

      const activity = await activityRepo.findById(activityId);
      if (!activity) {
        res.status(404).json({ message: `No existe una actividad con id ${activityId}` });
        return;
      }

      if (rejectionId !== null) {
        const rejection = await rejectionRepo.findById(rejectionId);
        if (!rejection) {
          res.status(404).json({ message: `No existe el rejectuion con id ${rejectionId}` });
          return;
        }
      }

      const activityDetail = new ActivityDetail(action, activityId, businessId, rejectionId);

      const created = await ActivityServiceContainer.activity.createActivityDetail.run(
        activityDetail,
        activityId
      );

      if (!created) {
        res.status(400).json({ message: "No se pudo registrar el detalle de actividad" });
        return;
      }

      res.status(201).json(created);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error al registrar el detalle de actividad";
      res.status(400).json({ message });
    }
  }
}