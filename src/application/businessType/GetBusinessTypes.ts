import { BusinessType } from "../../domain/businessType/BusinessType";
import { BusinessTypeRepository } from "../../domain/businessType/BusinessTypeRepository";

export class GetBusinessTypes {
  constructor(private repo: BusinessTypeRepository) {}
  async run(): Promise<BusinessType[]> {
    return this.repo.getAll();
  }
}
