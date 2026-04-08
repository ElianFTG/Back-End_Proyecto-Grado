import { Rejection } from "../../domain/rejection/Rejection";
import { RejectionRepository } from "../../domain/rejection/RejectionRepository";

export class CreateRejection {
  constructor(private repo: RejectionRepository) {}

  async run(name: string, userId: number | null): Promise<Rejection | null> {
    const rejection = new Rejection(name);
    return this.repo.create(rejection, userId);
  }
}
