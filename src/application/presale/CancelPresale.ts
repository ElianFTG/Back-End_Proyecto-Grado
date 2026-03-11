import { PresaleRepository } from '../../domain/presale/PresaleRepository';
import { Presale } from '../../domain/presale/Presale';

export class CancelPresale {
    constructor(private readonly repository: PresaleRepository) {}

    async run(presaleId: number, reason: string | null, userId: number): Promise<Presale | null> {
        if (!presaleId) {
            throw new Error('El ID de la preventa es obligatorio');
        }

        return this.repository.cancelPresale(presaleId, reason, userId);
    }
}
