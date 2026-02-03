/**
 * ============================================
 * USE CASE: ASSIGN DISTRIBUTOR
 * ============================================
 * Asigna un distribuidor a una preventa pendiente
 */

import { PresaleRepository } from '../../domain/presale/PresaleRepository';
import { Presale } from '../../domain/presale/Presale';

export class AssignDistributor {
    constructor(private readonly repository: PresaleRepository) {}

    async run(presaleId: number, distributorId: number, userId: number): Promise<Presale | null> {
        if (!presaleId) {
            throw new Error('El ID de la preventa es obligatorio');
        }

        if (!distributorId) {
            throw new Error('El ID del distribuidor es obligatorio');
        }

        return this.repository.assignDistributor(presaleId, distributorId, userId);
    }
}
