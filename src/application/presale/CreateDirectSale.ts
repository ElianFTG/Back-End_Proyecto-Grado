import { PresaleRepository } from '../../domain/presale/PresaleRepository';
import { CreatePresaleDTO } from '../../domain/presale/PresaleFilter';
import { Presale } from '../../domain/presale/Presale';

export class CreateDirectSale {
    constructor(private readonly repository: PresaleRepository) {}

    async run(dto: CreatePresaleDTO): Promise<Presale> {
        if (!dto.clientId) {
            throw new Error('El cliente es obligatorio');
        }
        if (!dto.branchId) {
            throw new Error('La sucursal es obligatoria');
        }
        if (!dto.deliveryDate) {
            throw new Error('La fecha de entrega es obligatoria');
        }
        if (!dto.details || dto.details.length === 0) {
            throw new Error('La venta debe tener al menos un producto');
        }
        for (const detail of dto.details) {
            if (detail.quantityRequested <= 0) {
                throw new Error('La cantidad solicitada debe ser mayor a 0');
            }
            if (detail.unitPrice <= 0) {
                throw new Error('El precio unitario debe ser mayor a 0');
            }
            if (!detail.productId) {
                throw new Error('El producto es obligatorio en cada detalle');
            }
            if (!detail.priceTypeId) {
                throw new Error('El tipo de precio es obligatorio en cada detalle');
            }
        }
        return this.repository.createDirectSale(dto);
    }
}