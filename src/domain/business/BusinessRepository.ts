import { Business } from "./Business";

export interface BusinessRepository {
  create(business: Business, userId: number | null): Promise<Business | null>;
  getAll(onlyActive?: boolean): Promise<Business[]>;
  findById(id: number): Promise<Business | null>;
  update(id: number, business: Partial<Business>, userId: number | null): Promise<Business | null>;
  softDelete(id: number, userId: number | null): Promise<boolean>;
}
