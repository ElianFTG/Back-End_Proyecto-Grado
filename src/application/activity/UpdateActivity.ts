import { Activity } from "../../domain/activity/Activity";
import { ActivityRepository } from "../../domain/activity/ActivityRepository";

export class UpdateActivity {
  constructor(private repo: ActivityRepository) {}

  async run(
    id: number,
    fields: { assignedDate?: string; responsibleUserId?: number },
    userId: number | null
  ): Promise<Activity | null> {
    return this.repo.updateActivity(id, fields, userId);
  }
}