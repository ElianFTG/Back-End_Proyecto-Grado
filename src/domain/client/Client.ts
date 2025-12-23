export type ClientPosition = { lat: number; lng: number };

export class Client {
    id?: number | undefined;
    fullName: string;
    position: ClientPosition;
    nitCi: string;
    businessName: string;
    phone: string;
    businessType: string;
    clientType: string;
    address?: string | null;
    status: boolean;
    pathImage?: string | null;
    
    constructor(
      fullName: string,
      position: ClientPosition,
      nitCi: string,
      businessName: string,
      phone: string,
      businessType: string,
      clientType: string,
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
      this.address = address ?? null;
      this.status = status;
      this.pathImage = pathImage ?? null;
    }
}
