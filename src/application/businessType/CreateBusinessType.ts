import { BusinessType } from "../../domain/businessType/BusinessType";
import { BusinessTypeRepository } from "../../domain/businessType/BusinessTypeRepository";

export class CreateBusinessType {
  constructor(private repo: BusinessTypeRepository) {}
  async run(t: BusinessType, userId: number | null): Promise<BusinessType | null> {
    return this.repo.create(t, userId);
  }
}
