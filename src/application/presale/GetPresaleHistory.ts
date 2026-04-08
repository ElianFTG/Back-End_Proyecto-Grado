import { PresaleRepository } from '../../domain/presale/PresaleRepository';
import { PresaleStatusHistory } from '../../domain/presale/Presale';

export class GetPresaleHistory {
    constructor(private readonly repository: PresaleRepository) {}

    async run(presaleId: number): Promise<PresaleStatusHistory[]> {
        if (!presaleId) {
            throw new Error('El ID de la preventa es obligatorio');
        }

        return this.repository.getStatusHistory(presaleId);
    }
}
