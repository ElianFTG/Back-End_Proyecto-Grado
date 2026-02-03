import { PriceType } from "../../domain/priceType/PriceType";
import { PriceTypeRepository } from "../../domain/priceType/PriceTypeRepository";

export class GetPriceTypes {
  constructor(private repository: PriceTypeRepository) {}

  async run(): Promise<PriceType[]> {
    return this.repository.getAll();
  }
}
