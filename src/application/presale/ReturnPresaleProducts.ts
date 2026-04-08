import { PresaleRepository } from '../../domain/presale/PresaleRepository';
import {
    ReturnPresaleProductsDTO,
    ReturnPresaleProductsResult
} from '../../domain/presale/PresaleFilter';

export class ReturnPresaleProducts {
    constructor(private readonly repository: PresaleRepository) {}

    async run(
        presaleId: number,
        dto: ReturnPresaleProductsDTO,
        userId: number
    ): Promise<ReturnPresaleProductsResult> {
        if (!presaleId || isNaN(presaleId)) {
            throw new Error('El ID de la preventa es obligatorio');
        }

        const presale = await this.repository.getById(presaleId);

        if (!presale) {
            throw new Error('Preventa no encontrada');
        }

        if (!['parcial', 'cancelado'].includes(presale.status)) {
            throw new Error(
                'Solo se pueden devolver productos de preventas en estado parcial o cancelado'
            );
        }

        if (dto.products !== undefined) {
            if (!Array.isArray(dto.products) || dto.products.length === 0) {
                throw new Error(
                    'El campo products debe ser un array con al menos un elemento'
                );
            }

            for (const item of dto.products) {
                if (!item.detailId || isNaN(item.detailId)) {
                    throw new Error('Cada producto debe incluir un detailId válido');
                }
                if (item.quantityToReturn === undefined || item.quantityToReturn <= 0) {
                    throw new Error(
                        `La cantidad a devolver para el detalle ${item.detailId} debe ser mayor a 0`
                    );
                }
            }
        }

        return this.repository.returnProducts(presaleId, dto, userId);
    }
}
