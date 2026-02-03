import { PriceType } from "../../domain/priceType/PriceType";
import { PriceTypeRepository } from "../../domain/priceType/PriceTypeRepository";

export class CreatePriceType {
  constructor(private repository: PriceTypeRepository) {}

  async run(type: PriceType, userId: number | null): Promise<PriceType | null> {
    return this.repository.create(type, userId);
  }
}
