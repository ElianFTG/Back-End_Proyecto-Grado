

import { PresaleRepository } from '../../domain/presale/PresaleRepository';
import { PresaleFilters, PaginatedPresalesResult } from '../../domain/presale/PresaleFilter';

export class GetPresales {
    constructor(private readonly repository: PresaleRepository) {}

    async run(filters: PresaleFilters): Promise<PaginatedPresalesResult> {
        return this.repository.getAll(filters);
    }
}
