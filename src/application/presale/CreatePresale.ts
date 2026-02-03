/**
 * ============================================
 * USE CASE: CREATE PRESALE
 * ============================================
 * Crea una nueva preventa con sus detalles
 */

import { PresaleRepository } from '../../domain/presale/PresaleRepository';
import { CreatePresaleDTO } from '../../domain/presale/PresaleFilter';
import { Presale } from '../../domain/presale/Presale';

export class CreatePresale {
    constructor(private readonly repository: PresaleRepository) {}

    async run(dto: CreatePresaleDTO): Promise<Presale> {
        // Validaciones de negocio
        if (!dto.details || dto.details.length === 0) {
            throw new Error('La preventa debe tener al menos un producto');
        }

        if (!dto.clientId) {
            throw new Error('El cliente es obligatorio');
        }

        if (!dto.branchId) {
            throw new Error('La sucursal es obligatoria');
        }

        if (!dto.deliveryDate) {
            throw new Error('La fecha de entrega es obligatoria');
        }

        // Validar fecha de entrega (debe ser hoy o futura)
        const deliveryDate = new Date(dto.deliveryDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (deliveryDate < today) {
            throw new Error('La fecha de entrega no puede ser anterior a hoy');
        }

        // Validar detalles
        for (const detail of dto.details) {
            if (detail.quantityRequested <= 0) {
                throw new Error('La cantidad solicitada debe ser mayor a 0');
            }
            if (detail.unitPrice <= 0) {
                throw new Error('El precio unitario debe ser mayor a 0');
            }
        }

        return this.repository.create(dto);
    }
}
