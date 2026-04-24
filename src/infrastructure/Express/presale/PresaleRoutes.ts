import { Router } from 'express';
import { PresaleController } from './PresaleController';
import { authJwt } from '../middlewares/authJwt';
import { requireRole } from '../middlewares/requireRole';
import { AuthServiceContainer } from '../../../shared/service_containers/auth/AuthServiceContainer';

const router = Router();
const authService = AuthServiceContainer.authService();
const controller = new PresaleController();

router.use(authJwt(authService));

router.post(
    '/presales',
    requireRole('prevendedor', 'administrador', 'gerente'),
    controller.create
);

router.post(
    '/presales/direct-sale',
    requireRole('transportista'),
    controller.createDirectSale
);

router.put(
    '/presales/:id',
    requireRole('prevendedor', 'administrador', 'gerente'),
    controller.update
);

router.get(
    '/presales',
    requireRole('prevendedor', 'administrador', 'gerente', 'transportista'),
    controller.getAll
);

router.get(
    '/presales/report',
    requireRole('administrador', 'gerente'),
    controller.getReport
);

router.get(
    '/presales/report/pdf',
    requireRole('administrador', 'gerente'),
    controller.getReportPdf
);

router.get(
    '/presales/report/excel',
    requireRole('administrador', 'gerente'),
    controller.getReportExcel
);

router.get(
    '/presales/history/:id',
    requireRole('administrador', 'gerente', 'prevendedor', 'transportista'),
    controller.getHistory
);

router.get(
    '/presales/:id',
    requireRole('prevendedor', 'administrador', 'gerente', 'transportista'),
    controller.getById
);

router.get(
    '/my-deliveries',
    requireRole('transportista'),
    controller.getMyDeliveries
);

router.patch(
    '/presales/:id/assign',
    requireRole('administrador', 'gerente'),
    controller.assign
);

router.patch(
    '/presales/:id/deliver',
    requireRole('transportista', 'administrador', 'gerente'),
    controller.confirmDelivery
);

router.patch(
    '/presales/:id/cancel',
    requireRole('transportista', 'prevendedor', 'administrador', 'gerente'),
    controller.cancel
);

router.patch(
    '/presales/:id/not-delivered',
    requireRole('transportista', 'administrador', 'gerente'),
    controller.notDelivered
);

router.patch(
    '/presales/:id/return',
    requireRole('administrador', 'gerente'),
    controller.returnProducts
);

router.delete(
    '/presales/:id',
    requireRole('administrador', 'gerente'),
    controller.delete
);

router.get(
    '/presales/:id/pdf',
    requireRole('administrador', 'gerente'),
    controller.generatePdf
);
export default router;
