import { PresaleRepository } from '../../domain/presale/PresaleRepository';
import { DistributorDeliveryItem } from '../../domain/presale/DistributorDelivery';

export class GetDeliveriesByDistributor {
    constructor(private readonly repository: PresaleRepository) {}

    async run(distributorId: number, deliveryDate: string): Promise<DistributorDeliveryItem[]> {
        if (!distributorId) {
            throw new Error('El ID del distribuidor es obligatorio');
        }

        if (!deliveryDate) {
            throw new Error('La fecha de entrega es obligatoria');
        }

        if (!/^\d{4}-\d{2}-\d{2}$/.test(deliveryDate)) {
            throw new Error('El formato de fecha debe ser YYYY-MM-DD');
        }

        return this.repository.getDeliveriesByDistributor(distributorId, deliveryDate);
    }
}
