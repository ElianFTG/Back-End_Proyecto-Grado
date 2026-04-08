import { BusinessType } from "./BusinessType";

export interface BusinessTypeRepository {
  create(type: BusinessType, userId: number | null): Promise<BusinessType | null>;
  getAll(onlyActive?: boolean): Promise<BusinessType[]>;
  count(): Promise<number>;
}
