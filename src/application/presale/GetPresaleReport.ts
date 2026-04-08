import { PresaleRepository } from '../../domain/presale/PresaleRepository';
import { PresaleReportFilters, PresaleReportResult } from '../../domain/presale/PresaleFilter';

export class GetPresaleReport {
    constructor(private readonly presaleRepository: PresaleRepository) {}

    async run(filters: PresaleReportFilters): Promise<PresaleReportResult> {
        return this.presaleRepository.getReport(filters);
    }
}