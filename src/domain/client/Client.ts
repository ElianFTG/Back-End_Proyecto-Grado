import { Position } from "../customs/Position";


export class Client {
    id?: number | undefined;
    fullName: string;
    position: Position;
    nitCi: string;
    businessName: string;
    phone: string;
    businessType: string;
    clientType: string;
    areaId?: number | null;
    address?: string | null;
    status: boolean;
    pathImage?: string | null;

    constructor(
        fullName: string,
        position: Position,
        nitCi: string,
        businessName: string,
        phone: string,
        businessType: string,
        clientType: string,
        areaId: number | null,
        status: boolean = true,
        address?: string | null,
        pathImage?: string | null,
        id?: number
    ) {
        this.id = id;
        this.fullName = fullName;
        this.position = position;
        this.nitCi = nitCi;
        this.businessName = businessName;
        this.phone = phone;
        this.businessType = businessType;
        this.clientType = clientType;
        this.areaId = areaId;
        this.address = address ?? null;
        this.status = status;
        this.pathImage = pathImage ?? null;
    }
}
