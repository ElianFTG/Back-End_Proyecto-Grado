export class Activity {
  id?: number | undefined;
  assignedDate?: Date | undefined;
  responsibleUserId: number;

  constructor(
    responsibleUserId: number,
    id?: number,
    assignedDate?: Date
  ) {
    this.id = id;
    this.responsibleUserId = responsibleUserId;
    this.assignedDate = assignedDate;
  }
}

export class ActivityDetail {
  id?: number | undefined;
  action: string;
  rejectionId?: number | undefined;
  activityId: number;
  businessId: number;

  constructor(
    action: string,
    activityId: number,
    businessId: number,
    id?: number,
    rejectionId?: number,
    
  ) {
    this.id = id;
    this.action = action;
    this.rejectionId = rejectionId;
    this.activityId = activityId;
    this.businessId = businessId;
  }
}