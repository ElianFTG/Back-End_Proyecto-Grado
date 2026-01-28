import { Activity } from "../activity/Activity"
import { Business } from "../business/Business"


export type ActivityWork = {
    business: Partial<Business>
    activity: Partial<Activity>
}