import { Activity, ActivityDetail } from "./Activity";

export interface ActivityRepository {
  createActivity(activity: Activity, userId: number | null): Promise<Activity | null>;
  findById(id: number): Promise<Activity | null>;
  findByPreseller(presellerId: number, assignedDate: string): Promise<Activity | null>;
}

export interface ActivityDetailRepository {
  createActivityDetail(activityDetail: ActivityDetail, activityId: number): Promise<ActivityDetail | null>;
  findByActivityId(activityId: number): Promise<ActivityDetail[]>;
}