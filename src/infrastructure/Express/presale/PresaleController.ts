
import { Request, Response } from 'express';
import {
    createPresale,
    getPresales,
    getPresaleById,
    assignDistributor,
    startDelivery,
    confirmDelivery,
    cancelPresale,
    getPresaleHistory
} from '../../../shared/service_containers/presale/PresaleServiceContainer';
import { PresaleStatus } from '../../../domain/presale/Presale';

export class PresaleController {

    /**
     * POST /presales
     * Crear una nueva preventa
     */
    static async create(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
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

            res.status(201).json({
                message: 'Preventa creada exitosamente',
                data: presale
            });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Error al crear preventa';
            res.status(400).json({ error: message });
        }
    }

    /**
     * GET /presales
     * Listar preventas con filtros y paginación
     * 
     * Query params:
     * - status: pending | assigned | in_transit | delivered | partial | cancelled
     * - presellerId: number
     * - distributorId: number
     * - clientId: number
     * - branchId: number
     * - deliveryDateFrom: YYYY-MM-DD
     * - deliveryDateTo: YYYY-MM-DD
     * - search: string
     * - page: number (default 1)
     * - limit: number (default 10)
     */
    static async getAll(req: Request, res: Response): Promise<void> {
        try {
            const statusParam = req.query.status as string | undefined;
            const validStatuses: PresaleStatus[] = ['pending', 'assigned', 'in_transit', 'delivered', 'partial', 'cancelled'];
            
            const filters = {
                status: statusParam && validStatuses.includes(statusParam as PresaleStatus) 
                    ? statusParam as PresaleStatus 
                    : undefined,
                presellerId: req.query.presellerId ? Number(req.query.presellerId) : undefined,
                distributorId: req.query.distributorId ? Number(req.query.distributorId) : undefined,
                clientId: req.query.clientId ? Number(req.query.clientId) : undefined,
                branchId: req.query.branchId ? Number(req.query.branchId) : undefined,
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
            res.status(500).json({ error: message });
        }
    }

    /**
     * GET /presales/:id
     * Obtener una preventa por ID
     * Query params:
     * - withDetails: boolean (default false)
     */
    static async getById(req: Request, res: Response): Promise<void> {
        try {
            const id = Number(req.params.id);
            const withDetails = req.query.withDetails === 'true';

            const presale = await getPresaleById.run(id, withDetails);

            if (!presale) {
                res.status(404).json({ error: 'Preventa no encontrada' });
                return;
            }

            res.json({ data: presale });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Error al obtener preventa';
            res.status(500).json({ error: message });
        }
    }

    /**
     * PATCH /presales/:id/assign
     * Asignar distribuidor a una preventa
     * Body: { distributorId: number }
     */
    static async assign(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                res.status(401).json({ error: 'Usuario no autenticado' });
                return;
            }

            const id = Number(req.params.id);
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

            res.json({
                message: 'Distribuidor asignado exitosamente',
                data: presale
            });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Error al asignar distribuidor';
            res.status(400).json({ error: message });
        }
    }

    /**
     * PATCH /presales/:id/start-delivery
     * Iniciar la entrega (cambiar estado a in_transit)
     */
    static async startDelivery(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                res.status(401).json({ error: 'Usuario no autenticado' });
                return;
            }

            const id = Number(req.params.id);

            const presale = await startDelivery.run(id, userId);

            if (!presale) {
                res.status(404).json({ error: 'Preventa no encontrada' });
                return;
            }

            res.json({
                message: 'Entrega iniciada',
                data: presale
            });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Error al iniciar entrega';
            res.status(400).json({ error: message });
        }
    }

    /**
     * PATCH /presales/:id/deliver
     * Confirmar la entrega
     * Body: {
     *   deliveryNotes?: string,
     *   details: [{ detailId, quantityDelivered, finalUnitPrice? }]
     * }
     */
    static async confirmDelivery(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                res.status(401).json({ error: 'Usuario no autenticado' });
                return;
            }

            const id = Number(req.params.id);
            const dto = req.body;

            const presale = await confirmDelivery.run(id, dto, userId);

            if (!presale) {
                res.status(404).json({ error: 'Preventa no encontrada' });
                return;
            }

            res.json({
                message: presale.status === 'partial' ? 'Entrega parcial completada' : 'Entrega completada',
                data: presale
            });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Error al confirmar entrega';
            res.status(400).json({ error: message });
        }
    }

    /**
     * PATCH /presales/:id/cancel
     * Cancelar una preventa
     * Body: { reason?: string }
     */
    static async cancel(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                res.status(401).json({ error: 'Usuario no autenticado' });
                return;
            }

            const id = Number(req.params.id);
            const { reason } = req.body;

            const presale = await cancelPresale.run(id, reason || null, userId);

            if (!presale) {
                res.status(404).json({ error: 'Preventa no encontrada' });
                return;
            }

            res.json({
                message: 'Preventa cancelada',
                data: presale
            });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Error al cancelar preventa';
            res.status(400).json({ error: message });
        }
    }

    /**
     * GET /presales/:id/history
     * Obtener historial de estados de una preventa
     */
    static async getHistory(req: Request, res: Response): Promise<void> {
        try {
            const id = Number(req.params.id);

            const history = await getPresaleHistory.run(id);

            res.json({ data: history });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Error al obtener historial';
            res.status(500).json({ error: message });
        }
    }

    /**
     * DELETE /presales/:id
     * Eliminar preventa (soft delete)
     */
    static async delete(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                res.status(401).json({ error: 'Usuario no autenticado' });
                return;
            }

            const id = Number(req.params.id);

            // Acceso directo al repositorio para soft delete
            const { presaleRepository } = await import('../../../shared/service_containers/presale/PresaleServiceContainer');
            const deleted = await presaleRepository.softDelete(id, userId);

            if (!deleted) {
                res.status(404).json({ error: 'Preventa no encontrada' });
                return;
            }

            res.json({ message: 'Preventa eliminada' });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Error al eliminar preventa';
            res.status(500).json({ error: message });
        }
    }
}
