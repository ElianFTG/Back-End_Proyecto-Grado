export class Activity {
  id?: number | undefined;
  assignedDate: Date;
  responsibleUserId: number;

  constructor(
    assignedDate: Date,
    responsibleUserId: number,
    id?: number,
  ) {
    this.id = id;
    this.responsibleUserId = responsibleUserId;
    this.assignedDate = assignedDate;
  }
}

export class ActivityDetail {
  id?: number | undefined;
  action: string;
  rejectionId: number | null;
  activityId: number;
  businessId: number;
  createdAt?: Date | null;

  constructor(
    action: string,
    activityId: number,
    businessId: number,
    rejectionId: number | null,
    id?: number,
    createdAt?: Date | null,
  ) {
    this.id = id;
    this.action = action;
    this.rejectionId = rejectionId;
    this.activityId = activityId;
    this.businessId = businessId;
    this.createdAt = createdAt ?? null;
  }
}