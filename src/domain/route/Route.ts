export class Route {
  id?: number | undefined;
  assignedDate: Date;
  assignedIdUser: number;
  assignedIdArea: number;

  constructor(
    assignedDate: Date,
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
