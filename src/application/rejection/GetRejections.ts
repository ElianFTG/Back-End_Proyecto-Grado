import { Rejection } from "../../domain/rejection/Rejection";
import { RejectionRepository } from "../../domain/rejection/RejectionRepository";

export class GetRejections {
  constructor(private repo: RejectionRepository) {}

  async run(): Promise<Rejection[]> {
    return this.repo.getAll();
  }
}
