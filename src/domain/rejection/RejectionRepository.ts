import { Rejection } from "./Rejection";

export interface RejectionRepository {
  create(rejection: Rejection, userId: number | null): Promise<Rejection | null>;
  getAll(): Promise<Rejection[]>;
}
