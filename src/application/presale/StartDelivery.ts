/**
 * ============================================
 * USE CASE: START DELIVERY
 * ============================================
 * Cambia el estado de la preventa a "en tránsito"
 */

import { PresaleRepository } from '../../domain/presale/PresaleRepository';
import { Presale } from '../../domain/presale/Presale';

export class StartDelivery {
    constructor(private readonly repository: PresaleRepository) {}

    async run(presaleId: number, userId: number): Promise<Presale | null> {
        if (!presaleId) {
            throw new Error('El ID de la preventa es obligatorio');
        }

        return this.repository.startDelivery(presaleId, userId);
    }
}
