import { PresaleRepository } from '../../domain/presale/PresaleRepository';
import { Presale } from '../../domain/presale/Presale';
import { GetPresalesByDateBusinessAndUserFilters } from '../../domain/presale/PresaleFilter';

export class GetPresalesByDateBusinessAndUser {
    constructor(private readonly repository: PresaleRepository) { }

    async run(filters: GetPresalesByDateBusinessAndUserFilters): Promise<Presale[]> {
        if (!filters.deliveryDate || !/^\d{4}-\d{2}-\d{2}$/.test(filters.deliveryDate)) {
            throw new Error('El formato de deliveryDate debe ser YYYY-MM-DD');
        }

        if (!filters.businessId || filters.businessId <= 0) {
            throw new Error('El businessId es requerido y debe ser un número válido');
        }

        if (!filters.userId || filters.userId <= 0) {
            throw new Error('El userId es requerido y debe ser un número válido');
        }

        return this.repository.getByDateBusinessAndUser(filters);
    }
}