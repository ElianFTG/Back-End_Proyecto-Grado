import { PresaleRepository } from '../../domain/presale/PresaleRepository';
import { Presale } from '../../domain/presale/Presale';

export class MarkAsNotDelivered {
    constructor(private readonly repository: PresaleRepository) {}

    async run(id: number, userId: number): Promise<Presale | null> {
        if (!id) throw new Error('El ID de la preventa es obligatorio');
        return this.repository.markAsNotDelivered(id, userId);
    }
}