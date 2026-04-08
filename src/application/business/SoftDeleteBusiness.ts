import { BusinessRepository } from "../../domain/business/BusinessRepository";

export class SoftDeleteBusiness {
  constructor(private repo: BusinessRepository) {}
  async run(id: number, userId: number | null): Promise<boolean> {
    return this.repo.softDelete(id, userId);
  }
}
