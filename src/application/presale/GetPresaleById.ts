/**
 * ============================================
 * USE CASE: GET PRESALE BY ID
 * ============================================
 * Obtiene una preventa por su ID con detalles
 */

import { PresaleRepository } from '../../domain/presale/PresaleRepository';
import { Presale } from '../../domain/presale/Presale';

export class GetPresaleById {
    constructor(private readonly repository: PresaleRepository) {}

    async run(id: number, withDetails: boolean = false): Promise<Presale | null> {
        if (withDetails) {
            return this.repository.getByIdWithDetails(id);
        }
        return this.repository.getById(id);
    }
}
