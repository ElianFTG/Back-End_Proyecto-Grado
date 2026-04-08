import { ClientType } from "./ClientType";

export interface ClientTypeRepository{
    create(type: ClientType, userId: number | null): Promise<ClientType | null>;
    getAll(): Promise<ClientType[]>;
    count(): Promise<number>;
}