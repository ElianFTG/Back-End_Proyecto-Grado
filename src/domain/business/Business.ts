import { Position } from "../customs/Position";

export class Business {
  id?: number| undefined;
  name: string;
  nit: string | null;
  position: Position | null;
  pathImage: string | null;
  address: string | null;

  businessTypeId: number;
  clientId: number;
  areaId: number;
  isActive: boolean;
  constructor(
    name: string,
    businessTypeId: number,
    clientId: number,
    areaId: number,
    nit: string | null,
    position: Position | null,
    pathImage: string | null,
    address: string | null,
    isActive: boolean = true,
    id?: number
  ) {
    this.id = id;
    this.name = name;
    this.businessTypeId = businessTypeId;
    this.clientId = clientId;
    this.areaId = areaId;
    this.nit = nit;
    this.position = position;
    this.pathImage = pathImage;
    this.address = address;
    this.isActive = isActive;
  }
}