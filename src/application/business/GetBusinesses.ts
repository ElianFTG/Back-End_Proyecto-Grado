import { PaginatedBusinessesResult, BusinessRepository } from "../../domain/business/BusinessRepository";

export class GetBusinesses {
  constructor(private repo: BusinessRepository) {}

  async run(filters: { search?: string; areaId?: number; state?: boolean; page?: number; limit?: number }): Promise<PaginatedBusinessesResult> {
    return this.repo.getAll(filters);
  }
}