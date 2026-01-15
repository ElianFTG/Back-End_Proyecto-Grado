import { Business } from "../../domain/business/Business";
import { BusinessRepository } from "../../domain/business/BusinessRepository";

export class FindByIdBusiness {
  constructor(private repo: BusinessRepository) {}
  async run(id: number): Promise<Business | null> {
    return this.repo.findById(id);
  }
}
