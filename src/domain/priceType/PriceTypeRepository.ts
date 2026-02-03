import { PriceType } from "./PriceType";

export interface PriceTypeRepository {
  create(type: PriceType, userId: number | null): Promise<PriceType | null>;
  getAll(): Promise<PriceType[]>;
  count(): Promise<number>;
}
