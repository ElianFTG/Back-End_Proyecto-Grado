import { Supplier } from "./Supplier";

export interface SupplierRepository {
    getAll(): Promise<Supplier[]>;
    create(supplier: Supplier): Promise<Supplier | null>;
    findById(id: number): Promise<Supplier | null>;
    update(id: number, supplier: Partial<Supplier>, userId: number): Promise<Supplier | null>;
    updateState(id: number, userId: number): Promise<void>;
}
