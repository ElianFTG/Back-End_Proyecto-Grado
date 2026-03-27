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
    requireRole('prevendedor', 'transportista', 'administrador', 'propietario'),
    controller.create
);

router.put(
    '/presales/:id',
    requireRole('prevendedor', 'administrador', 'propietario'),
    controller.update
);

router.get(
    '/presales',
    requireRole('prevendedor', 'administrador', 'propietario', 'transportista'),
    controller.getAll
);

router.get(
    '/presales/history/:id',
    requireRole('administrador', 'propietario', 'prevendedor', 'transportista'),
    controller.getHistory
);

router.get(
    '/presales/:id',
    requireRole('prevendedor', 'administrador', 'propietario', 'transportista'),
    controller.getById
);

router.get(
    '/my-deliveries',
    requireRole('transportista'),
    controller.getMyDeliveries
);

router.patch(
    '/presales/:id/assign',
    requireRole('administrador', 'propietario'),
    controller.assign
);

router.patch(
    '/presales/:id/deliver',
    requireRole('transportista', 'administrador', 'propietario'),
    controller.confirmDelivery
);

router.patch(
    '/presales/:id/cancel',
    requireRole('transportista', 'prevendedor', 'administrador', 'propietario'),
    controller.cancel
);

router.patch(
    '/presales/:id/return',
    requireRole('administrador', 'propietario'),
    controller.returnProducts
);

router.delete(
    '/presales/:id',
    requireRole('administrador', 'propietario'),
    controller.delete
);

export default router;
