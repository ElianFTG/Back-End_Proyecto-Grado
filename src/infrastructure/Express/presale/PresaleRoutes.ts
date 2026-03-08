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
    '/',
    requireRole('prevendedor', 'administrador', 'propietario'),
    controller.create
);

router.put(
    '/:id',
    requireRole('prevendedor', 'administrador', 'propietario'),
    controller.update
);
router.get(
    '/',
    requireRole('prevendedor', 'administrador', 'propietario', 'transportista'),
    controller.getAll
);

router.get(
    '/:id',
    requireRole('prevendedor', 'administrador', 'propietario', 'transportista'),
    controller.getById
);

router.get(
    '/:id/history',
    requireRole('administrador', 'propietario'),
    controller.getHistory
);

router.patch(
    '/:id/assign',
    requireRole('administrador', 'propietario'),
    controller.assign
);

router.patch(
    '/:id/start-delivery',
    requireRole('transportista', 'administrador', 'propietario'),
    controller.startDelivery
);

router.patch(
    '/:id/deliver',
    requireRole('transportista', 'administrador', 'propietario'),
    controller.confirmDelivery
);

router.patch(
    '/:id/cancel',
    requireRole('prevendedor', 'administrador', 'propietario'),
    controller.cancel
);


router.delete(
    '/:id',
    requireRole('administrador', 'propietario'),
    controller.delete
);

export default router;
