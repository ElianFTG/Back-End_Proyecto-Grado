import { AppDataSource } from "../db/Mysql";
import { Client } from "../../domain/client/Client";
import { ClientRepository } from "../../domain/client/ClientRepository";
import { ClientEntity } from "../persistence/typeorm/entities/ClientEntity";
import { Repository } from "typeorm";

export class MysqlClientRepository implements ClientRepository {

    repo : Repository<ClientEntity>
    constructor(){
        this.repo = AppDataSource.getRepository(ClientEntity)
    }
    private parseWktPoint(wkt: string): { lat: number; lng: number } {
        const match = wkt.match(/POINT\(([-\d.]+)\s+([-\d.]+)\)/);
        if (!match) return { lat: 0, lng: 0 };
        return { lng: Number(match[1]), lat: Number(match[2]) };
    }

    private toDomain(row: ClientEntity): Client {
        const { lat, lng } = this.parseWktPoint(row.position);

        return new Client(
            row.full_name,
            { lat, lng },
            row.nit_ci,
            row.business_name,
            row.phone,
            row.business_type,
            row.client_type,
            row.area_id ?? null,
            row.status,
            row.address,
            row.path_image,
            row.id
        );
    }

    async create(client: Client, userId: number): Promise<Client | null> {
        try {
            const wkt = `POINT(${client.position.lng} ${client.position.lat})`;
            const entity = this.repo.create({
                full_name: client.fullName,
                position: wkt,
                nit_ci: client.nitCi,
                business_name: client.businessName,
                phone: client.phone,
                business_type: client.businessType,
                client_type: client.clientType,
                area_id: client.areaId ?? null,
                address: client.address ?? null,
                status: client.status ?? true,
                path_image: client.pathImage ?? null,
                user_id: userId,
            });

            const saved = await this.repo.save(entity);
            return this.toDomain(saved);
        } catch (e) {
            console.log(e);
            return null;
        }
    }


    async getAll(onlyActive: boolean = true): Promise<Client[]> {
        const rows = await this.repo.find({
            where: onlyActive ? { status: true } : {},
            order: { id: "DESC" },
        });
        return rows.map((r) => this.toDomain(r));
    }

    async findById(id: number): Promise<Client | null> {
        const row = await this.repo.findOne({ where: { id } });
        return row ? this.toDomain(row) : null;
    }

    async update(id: number, client: Partial<Client>, userId: number): Promise<Client | null> {
        const patch: Partial<ClientEntity> = {
            ...(client.fullName !== undefined ? { full_name: client.fullName } : {}),
            ...(client.position !== undefined
              ? { position: `POINT(${client.position.lng} ${client.position.lat})` }
              : {}),
            ...(client.nitCi !== undefined ? { nit_ci: client.nitCi } : {}),
            ...(client.businessName !== undefined ? { business_name: client.businessName } : {}),
            ...(client.phone !== undefined ? { phone: client.phone } : {}),
            ...(client.businessType !== undefined ? { business_type: client.businessType } : {}),
            ...(client.clientType !== undefined ? { client_type: client.clientType } : {}),
            ...(client.areaId !== undefined ? { area_id: client.areaId ?? null } : {}),
            ...(client.address !== undefined ? { address: client.address ?? null } : {}),
            ...(client.status !== undefined ? { status: client.status } : {}),
            ...(client.pathImage !== undefined ? { path_image: client.pathImage ?? null } : {}),
            user_id: userId,
        };

        await this.repo.update({ id }, patch);
        const updated = await this.repo.findOne({ where: { id } });
        return updated ? this.toDomain(updated) : null;
    }

    async softDelete(id: number, userId: number): Promise<boolean> {
        try {
            await this.repo.update({ id }, { status: false, user_id: userId });
            return true;    
        } catch (error) {
            console.log(error);
            return false;
        }
        
    }

    async getClientsByArea(areaId: number): Promise<Client[]> {
        try {
            const rows = await this.repo.find({
                where: { status: true, area_id: areaId },
                order: { id: "DESC" },
            });
            return rows.map((r) => this.toDomain(r));
        } catch (error) {
            console.log(error);
            return [];
        }
    }
}
