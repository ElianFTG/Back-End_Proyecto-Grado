import { Request, Response } from 'express';
import {
    createPresale,
    updatePresale,
    getPresales,
    getPresaleById,
    assignDistributor,
    confirmDelivery,
    cancelPresale,
    getPresaleHistory,
    getDeliveriesByDistributor,
    returnPresaleProducts,
    presaleRepository
} from '../../../shared/service_containers/presale/PresaleServiceContainer';
import { PresaleStatus } from '../../../domain/presale/Presale';

export class PresaleController {

    async create(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.auth?.userId;
            if (!userId) {
                res.status(401).json({ error: 'Usuario no autenticado' });
                return;
            }

            const dto = {
                ...req.body,
                presellerId: userId,
                userId
            };

            const presale = await createPresale.run(dto);

            res.status(201).json(presale);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Error al crear preventa';
            res.status(400).json({ error: message });
        }
    }

    async update(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.auth?.userId;
            if (!userId) {
                res.status(401).json({ error: 'Usuario no autenticado' });
                return;
            }

            const id = Number(req.params.id);
            if (!id || isNaN(id)) {
                res.status(400).json({ error: 'ID de preventa inválido' });
                return;
            }

            const presale = await updatePresale.run(id, req.body, userId);

            if (!presale) {
                res.status(404).json({ error: 'Preventa no encontrada' });
                return;
            }
            res.json(presale);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Error al editar preventa';
            res.status(400).json({ error: message });
        }
    }

    async getAll(req: Request, res: Response): Promise<void> {
        try {
            const statusParam = req.query.status as string | undefined;
            const validStatuses: PresaleStatus[] = [
                'pendiente', 'asignado', 'entregado', 'parcial', 'cancelado'
            ];

            const filters = {
                status: statusParam && validStatuses.includes(statusParam as PresaleStatus)
                    ? (statusParam as PresaleStatus)
                    : undefined,
                presellerId: req.query.presellerId ? Number(req.query.presellerId) : undefined,
                distributorId: req.query.distributorId ? Number(req.query.distributorId) : undefined,
                clientId: req.query.clientId ? Number(req.query.clientId) : undefined,
                branchId: req.query.branchId ? Number(req.query.branchId) : undefined,
                deliveryDate: req.query.deliveryDate as string | undefined,
                deliveryDateFrom: req.query.deliveryDateFrom as string | undefined,
                deliveryDateTo: req.query.deliveryDateTo as string | undefined,
                search: req.query.search as string | undefined,
                page: req.query.page ? Number(req.query.page) : 1,
                limit: req.query.limit ? Number(req.query.limit) : 10
            };

            const result = await getPresales.run(filters);
            res.json(result);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Error al obtener preventas';
            res.status(400).json({ error: message });
        }
    }

    async getById(req: Request, res: Response): Promise<void> {
        try {
            const id = Number(req.params.id);
            if (!id || isNaN(id)) {
                res.status(400).json({ error: 'ID de preventa inválido' });
                return;
            }

            const withDetails = req.query.withDetails === 'true';
            const presale = await getPresaleById.run(id, withDetails);

            if (!presale) {
                res.status(404).json({ error: 'Preventa no encontrada' });
                return;
            }

            res.json(presale);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Error al obtener preventa';
            res.status(500).json({ error: message });
        }
    }

    async assign(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.auth?.userId;
            if (!userId) {
                res.status(401).json({ error: 'Usuario no autenticado' });
                return;
            }

            const id = Number(req.params.id);
            if (!id || isNaN(id)) {
                res.status(400).json({ error: 'ID de preventa inválido' });
                return;
            }

            const { distributorId } = req.body;
            if (!distributorId) {
                res.status(400).json({ error: 'El distributorId es obligatorio' });
                return;
            }

            const presale = await assignDistributor.run(id, distributorId, userId);

            if (!presale) {
                res.status(404).json({ error: 'Preventa no encontrada' });
                return;
            }

            res.json(presale);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Error al asignar distribuidor';
            res.status(400).json({ error: message });
        }
    }

    async confirmDelivery(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.auth?.userId;
            if (!userId) {
                res.status(401).json({ error: 'Usuario no autenticado' });
                return;
            }

            const id = Number(req.params.id);
            if (!id || isNaN(id)) {
                res.status(400).json({ error: 'ID de preventa inválido' });
                return;
            }

            const dto = req.body;
            const presale = await confirmDelivery.run(id, dto, userId);

            if (!presale) {
                res.status(404).json({ error: 'Preventa no encontrada' });
                return;
            }

            res.json(presale);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Error al confirmar entrega';
            res.status(400).json({ error: message });
        }
    }

    async cancel(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.auth?.userId;
            if (!userId) {
                res.status(401).json({ error: 'Usuario no autenticado' });
                return;
            }

            const id = Number(req.params.id);
            if (!id || isNaN(id)) {
                res.status(400).json({ error: 'ID de preventa inválido' });
                return;
            }

            const { reason } = req.body;
            const presale = await cancelPresale.run(id, reason ?? null, userId);

            if (!presale) {
                res.status(404).json({ error: 'Preventa no encontrada' });
                return;
            }

            res.json({ presale });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Error al cancelar preventa';
            res.status(400).json({ error: message });
        }
    }

    async getHistory(req: Request, res: Response): Promise<void> {
        try {
            const id = Number(req.params.id);
            if (!id || isNaN(id)) {
                res.status(400).json({ error: 'ID de preventa inválido' });
                return;
            }

            const history = await getPresaleHistory.run(id);
            res.json(history);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Error al obtener historial';
            res.status(500).json({ error: message });
        }
    }

    async getMyDeliveries(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.auth?.userId;
            if (!userId) {
                res.status(401).json({ error: 'Usuario no autenticado' });
                return;
            }

            const { deliveryDate } = req.query;
            if (!deliveryDate || typeof deliveryDate !== 'string') {
                res.status(400).json({ error: 'El parámetro deliveryDate es obligatorio (formato YYYY-MM-DD)' });
                return;
            }

            const deliveries = await getDeliveriesByDistributor.run(userId, deliveryDate);
            res.json(deliveries);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Error al obtener entregas';
            res.status(400).json({ error: message });
        }
    }

    async returnProducts(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.auth?.userId;
            if (!userId) {
                res.status(401).json({ error: 'Usuario no autenticado' });
                return;
            }

            const id = Number(req.params.id);
            if (!id || isNaN(id)) {
                res.status(400).json({ error: 'ID de preventa inválido' });
                return;
            }

            const result = await returnPresaleProducts.run(id, req.body ?? {}, userId);
            res.json(result);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Error al procesar devolución';
            res.status(400).json({ error: message });
        }
    }

    async delete(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.auth?.userId;
            if (!userId) {
                res.status(401).json({ error: 'Usuario no autenticado' });
                return;
            }

            const id = Number(req.params.id);
            if (!id || isNaN(id)) {
                res.status(400).json({ error: 'ID de preventa inválido' });
                return;
            }

            const deleted = await presaleRepository.softDelete(id, userId);

            if (!deleted) {
                res.status(404).json({ error: 'Preventa no encontrada' });
                return;
            }

            res.json({ message: 'Preventa eliminada correctamente' });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Error al eliminar preventa';
            res.status(400).json({ error: message });
        }
    }
}
