import { Request, Response } from "express";
import { Activity, ActivityDetail } from "../../../domain/activity/Activity";
import { ActivityServiceContainer } from "../../../shared/service_containers/activity/ActivityServiceContainer";
import { UserServiceContainer } from "../../../shared/service_containers/user/UserServiceContainer";
import { MysqlActivityRepository } from "../../repositories/MysqlActivityRepository";
import { MysqlRejectionRepository } from "../../repositories/MysqlRejectionRepository";
import { BusinessServiceContainer } from "../../../shared/service_containers/business/BusinessServiceContainer";

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

      const business = await BusinessServiceContainer.business.findByIdBusiness.run(businessId);
      if (!business) { res.status(404).json({ message: `No existe un negocio con id ${businessId}` }); return; }

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

  async getForPreseller(req: Request, res: Response): Promise<void> {
    try {
      const presellerId = Number(req.query.userId ?? req.query.user_id);
      const assignedDate = (req.query.date ?? req.query.date) as string;


      if (!presellerId || isNaN(presellerId)) { res.status(400).json({ message: "userId inválido" }); return; }

      const user = await UserServiceContainer.user.findById.run(presellerId)
      if (!user || user.role != 'prevendedor') { res.status(400).json({ message: "El usuario no es un prevendedor" }); return; }

      if (!assignedDate) { res.status(400).json({ message: "date es requerido" }); return; }

      const result = await ActivityServiceContainer.activity.getBusinessesActivityForPreseller.run(
        presellerId,
        assignedDate
      );

      if (!result) { res.status(404).json({ message: "No se encontró ruta para ese preseller y fecha" }); return; }

      res.status(200).json(result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error al obtener actividad";
      res.status(500).json({ message });
    }
  }

  async getForDistributor(req: Request, res: Response): Promise<void> {
    try {
      const distributorId = Number(req.query.userId ?? req.query.user_id);
      const deliveryDate = (req.query.date ?? req.query.date) as string;

      if (!distributorId || isNaN(distributorId)) { res.status(400).json({ message: "userId inválido" }); return; }

      const user = await UserServiceContainer.user.findById.run(distributorId)
      if (!user || user.role != 'transportista') { res.status(400).json({ message: "El usuario no es un transportista" }); return; }

      if (!deliveryDate) { res.status(400).json({ message: "date es requerido" }); return; }

      const result = await ActivityServiceContainer.activity.getBusinessesActivityForDistributor.run(
        distributorId,
        deliveryDate
      );

      if (!result) { res.status(404).json({ message: "No se encontraron preventa para ese distribuidor y fecha" }); return; }

      res.status(200).json(result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error al obtener actividad";
      res.status(500).json({ message });
    }
  }

   async getActivityByDateAndUserId(req: Request, res: Response): Promise<void> {
    try {
      const body = req.body;

      const userId = Number(body.user_id);
      const assignedDate = body.assigned_date as string;

      console.log(body)

      if (!userId || isNaN(userId)) {
        res.status(400).json({ message: "user_id inválido" });
        return;
      }
      if (!assignedDate) {
        res.status(400).json({ message: "assigned_date es requerido" });
        return;
      }

      const activity = await ActivityServiceContainer.activity.getActivityByDateAndUserId.run(
        assignedDate,
        userId
      );

      if (!activity) {
        res.status(404).json({ message: "No se encontró actividad para ese usuario y fecha" });
        return;
      }

      res.status(200).json(activity);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error al obtener actividad";
      res.status(500).json({ message });
    }
  }
}