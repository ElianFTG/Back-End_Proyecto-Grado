import { ActivityDetail } from "../../domain/activity/Activity";
import { ActivityRepository } from "../../domain/activity/ActivityRepository";

export class CreateActivityDetail {
  constructor(private repo: ActivityRepository) {}

  async run(activityDetail: ActivityDetail, activityId: number): Promise<ActivityDetail | null> {
    return this.repo.createActivityDetail(activityDetail, activityId);
  }
}
