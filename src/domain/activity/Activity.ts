export class Activity {
  id?: number | undefined;
  createdAt?: Date | undefined;
  rejectionId: number | null;
  action: string;
  routeId: number;
  responsibleUserId: number;
  businessId: number;

  constructor(
    action : string,
    routeId: number,
    responsibleUserId: number,
    businessId: number,
    rejectionId: number | null = null,
    id?: number,
    createdAt?: Date
  ) {
    this.id = id;
    this.action = action;
    this.routeId = routeId;
    this.responsibleUserId = responsibleUserId;
    this.businessId = businessId;
    this.rejectionId = rejectionId;
    this.createdAt = createdAt;
  }
}
