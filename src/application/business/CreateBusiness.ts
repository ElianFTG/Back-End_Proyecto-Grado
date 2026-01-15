import { Business } from "../../domain/business/Business";
import { BusinessRepository } from "../../domain/business/BusinessRepository";

export class CreateBusiness {
  constructor(private repo: BusinessRepository) {}
  async run(b: Business, userId: number | null): Promise<Business | null> {
    return this.repo.create(b, userId);
  }
}
