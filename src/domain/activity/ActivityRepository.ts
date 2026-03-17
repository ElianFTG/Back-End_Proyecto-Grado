import { Activity, ActivityDetail } from "./Activity";

export interface ActivityRepository {
  createActivity(activity: Activity, userId: number | null): Promise<Activity | null>;
  createActivityDetail(activityDetail: ActivityDetail, activityId: number): Promise<ActivityDetail | null>;
}
