import { Activity, ActivityDetail } from "./Activity";

export interface ActivityRepository {
  createActivity(activity: Activity, userId: number | null): Promise<Activity | null>;
  // findActivityByDateAndUserId(date: string, userId: number): Promise<Activity>;
  findById(id: number): Promise<Activity | null>;
  findActivityByDateAndUserId(presellerId: number, assignedDate: string): Promise<Activity | null>;
}

export interface ActivityDetailRepository {
  createActivityDetail(activityDetail: ActivityDetail, activityId: number): Promise<ActivityDetail | null>;
  findByActivityId(activityId: number): Promise<ActivityDetail[]>;
}