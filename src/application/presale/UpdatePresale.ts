import { PresaleRepository } from '../../domain/presale/PresaleRepository';
import { UpdatePresaleDTO } from '../../domain/presale/PresaleFilter';
import { Presale } from '../../domain/presale/Presale';

export class UpdatePresale {
    constructor(private readonly repository: PresaleRepository) {}

    async run(id: number, dto: UpdatePresaleDTO, userId: number): Promise<Presale | null> {
        if (!id) {
            throw new Error('El ID de la preventa es obligatorio');
        }
        const existing = await this.repository.getById(id);

        if (!existing) {
            throw new Error('Preventa no encontrada');
        }

        if (existing.status !== 'pendiente') {
            throw new Error('Solo se pueden editar preventas en estado pendiente');
        }

        if (dto.deliveryDate) {
            const deliveryDate = new Date(dto.deliveryDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (isNaN(deliveryDate.getTime())) {
                throw new Error('La fecha de entrega no es válida');
            }

            if (deliveryDate < today) {
                throw new Error('La fecha de entrega no puede ser anterior a hoy');
            }
        }

        if (dto.details?.add && dto.details.add.length > 0) {
            for (const detail of dto.details.add) {
                if (detail.quantityRequested <= 0) {
                    throw new Error('La cantidad solicitada debe ser mayor a 0');
                }
                if (detail.unitPrice <= 0) {
                    throw new Error('El precio unitario debe ser mayor a 0');
                }
            }
        }

        if (dto.details?.update && dto.details.update.length > 0) {
            for (const detail of dto.details.update) {
                if (detail.quantityRequested <= 0) {
                    throw new Error('La cantidad solicitada debe ser mayor a 0');
                }
                if (detail.unitPrice <= 0) {
                    throw new Error('El precio unitario debe ser mayor a 0');
                }
            }
        }
        return this.repository.update(id, dto, userId);
    }
}
