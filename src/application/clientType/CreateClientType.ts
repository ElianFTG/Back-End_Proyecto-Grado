import { ClientType } from "../../domain/clientType/ClientType";
import { ClientTypeRepository } from "../../domain/clientType/ClientTypeRepository";

export class CreateClientType{
    constructor(private repository: ClientTypeRepository){}
    async run(type: ClientType, userId: number | null): Promise<ClientType | null>{
        return this.repository.create(type, userId);
    }
}