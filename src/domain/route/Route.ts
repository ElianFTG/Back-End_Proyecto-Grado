export class Route {
  id?: number | undefined;
  assignedDate: string;
  assignedIdUser: number;
  assignedIdArea: number;

  constructor(
    assignedDate: string,
    assignedIdUser: number,
    assignedIdArea: number,
    id?: number
  ) {
    this.id = id;
    this.assignedDate = assignedDate;
    this.assignedIdUser = assignedIdUser;
    this.assignedIdArea = assignedIdArea;
  }
}
