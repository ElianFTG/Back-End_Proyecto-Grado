import { Business } from "../../domain/business/Business";
import { BusinessRepository } from "../../domain/business/BusinessRepository";

export class GetBusinesses {
  constructor(private repo: BusinessRepository) {}
  async run(): Promise<Business[]> {
    return this.repo.getAll();
  }
}
