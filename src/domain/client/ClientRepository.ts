import { Client } from "./Client";

export interface ClientRepository {
    create(client: Client, userId: number): Promise<Client | null>;
    getAll(onlyActive?: boolean): Promise<Client[]>;
    findById(id: number): Promise<Client | null>;
    update(id: number, client: Partial<Client>, userId: number): Promise<Client | null>;
    softDelete(id: number, userId: number): Promise<boolean>; 
}
