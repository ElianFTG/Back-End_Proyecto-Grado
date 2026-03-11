import { PresaleRepository } from '../../domain/presale/PresaleRepository';
import { ConfirmDeliveryDTO } from '../../domain/presale/PresaleFilter';
import { Presale } from '../../domain/presale/Presale';

export class ConfirmDelivery {
    constructor(private readonly repository: PresaleRepository) {}

    async run(presaleId: number, dto: ConfirmDeliveryDTO, userId: number): Promise<Presale | null> {
        if (!presaleId) {
            throw new Error('El ID de la preventa es obligatorio');
        }

        if (!dto.details || dto.details.length === 0) {
            throw new Error('Debe especificar los detalles de entrega');
        }

        // Validar que todas las cantidades entregadas sean >= 0
        for (const detail of dto.details) {
            if (detail.quantityDelivered < 0) {
                throw new Error('La cantidad entregada no puede ser negativa');
            }
        }

        return this.repository.confirmDelivery(presaleId, dto, userId);
    }
}
