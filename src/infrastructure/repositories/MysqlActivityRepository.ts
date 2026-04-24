import { Repository } from "typeorm";
import { AppDataSource } from "../db/Mysql";

import { ActivityRepository } from "../../domain/activity/ActivityRepository";
import { Activity } from "../../domain/activity/Activity";
import { ActivityEntity } from "../persistence/typeorm/entities/ActivityEntity";

export class MysqlActivityRepository implements ActivityRepository {
  private readonly repo: Repository<ActivityEntity>;

  constructor() {
    this.repo = AppDataSource.getRepository(ActivityEntity);
  }

  private toDomain(row: ActivityEntity): Activity {
    return new Activity(
      row.assigned_date,
      row.responsible_user_id,
      row.id,
    );
  }

  async createActivity(activity: Activity, userId: number | null): Promise<Activity | null> {
    try {
      const saved = await this.repo.save({
        assigned_date: activity.assignedDate,
        responsible_user_id: activity.responsibleUserId,
        user_id: userId,
      });
      const created = await this.repo.findOneBy({ id: saved.id } as any);
      return created ? this.toDomain(created) : null;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async findById(id: number): Promise<Activity | null> {
    try {
      const row = await this.repo.findOneBy({ id } as any);
      return row ? this.toDomain(row) : null;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async findActivityByDateAndUserId(presellerId: number, assignedDate: string): Promise<Activity | null> {
    try {
      const row = await this.repo.createQueryBuilder("a")
        .where("a.responsible_user_id = :presellerId", { presellerId })
        .andWhere("a.assigned_date = :assignedDate", { assignedDate })
        .getOne();
      return row ? this.toDomain(row) : null;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async updateActivity(
    id: number,
    fields: { assignedDate?: string; responsibleUserId?: number },
    userId: number | null
  ): Promise<Activity | null> {
    try {
      const toUpdate: Partial<ActivityEntity> = { user_id: userId !== undefined ? userId : null };
 
      if (fields.assignedDate !== undefined) {
        toUpdate.assigned_date = fields.assignedDate as any;
      }
      if (fields.responsibleUserId !== undefined) {
        toUpdate.responsible_user_id = fields.responsibleUserId;
      }
 
      await this.repo.update(id, toUpdate);
      const updated = await this.repo.findOneBy({ id } as any);
      return updated ? this.toDomain(updated) : null;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}