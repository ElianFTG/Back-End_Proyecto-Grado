import { Position } from "../customs/Position";

export class Area {
  id?: number | undefined;
  name: string;
  area: Position[];

  constructor(name: string, area: Position[], id?: number) {
    this.id = id;
    this.name = name;
    this.area = area;
  }
}