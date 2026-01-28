import { Activity } from "../../domain/activity/Activity";
import { ActivityRepository } from "../../domain/activity/ActivityRepository";

export class CreateActivity {
  constructor(private repo: ActivityRepository) {}

  async run(activity: Activity, userId: number | null): Promise<Activity | null> {
    return this.repo.create(activity, userId);
  }
}
