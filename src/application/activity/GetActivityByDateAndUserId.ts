import { Activity } from "../../domain/activity/Activity";
import { ActivityRepository } from "../../domain/activity/ActivityRepository";

export class GetActivityByDateAndUserId {
  constructor(private repo: ActivityRepository) {}

  async run(date: string, userId: number): Promise<Activity | null> {
    if( !date ) throw Error("Es obligatorio ingresar la fecha");
    if ( !userId ) throw Error("Es obligatorio ingresar el id del usuario");
    return this.repo.findActivityByDateAndUserId(userId, date);
  }
}
