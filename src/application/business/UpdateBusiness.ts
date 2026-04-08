import { Business } from "../../domain/business/Business";
import { BusinessRepository } from "../../domain/business/BusinessRepository";

export class UpdateBusiness {
  constructor(private repo: BusinessRepository) {}
  async run(id: number, patch: Partial<Business>, userId: number | null): Promise<Business | null> {
    return this.repo.update(id, patch, userId);
  }
}
