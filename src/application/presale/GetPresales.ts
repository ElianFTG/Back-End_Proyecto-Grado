import { PresaleRepository } from '../../domain/presale/PresaleRepository';
import { PresaleFilters, PaginatedPresalesResult } from '../../domain/presale/PresaleFilter';

export class GetPresales {
    constructor(private readonly repository: PresaleRepository) {}

    async run(filters: PresaleFilters): Promise<PaginatedPresalesResult> {
        // Validar formato de fechas si se proveen
        if (filters.deliveryDate && !/^\d{4}-\d{2}-\d{2}$/.test(filters.deliveryDate)) {
            throw new Error('El formato de deliveryDate debe ser YYYY-MM-DD');
        }
        if (filters.deliveryDateFrom && !/^\d{4}-\d{2}-\d{2}$/.test(filters.deliveryDateFrom)) {
            throw new Error('El formato de deliveryDateFrom debe ser YYYY-MM-DD');
        }
        if (filters.deliveryDateTo && !/^\d{4}-\d{2}-\d{2}$/.test(filters.deliveryDateTo)) {
            throw new Error('El formato de deliveryDateTo debe ser YYYY-MM-DD');
        }

        if (filters.deliveryDate) {
            return this.repository.getAll({
                ...filters,
                deliveryDateFrom: filters.deliveryDate,
                deliveryDateTo: filters.deliveryDate,
                deliveryDate: undefined
            });
        }

        return this.repository.getAll(filters);
    }
}

