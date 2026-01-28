import { MysqlRejectionRepository } from "../../../infrastructure/repositories/MysqlRejectionRepository";
import { CreateRejection } from "../../../application/rejection/CreateRejection";
import { GetRejections } from "../../../application/rejection/GetRejections";

export class RejectionServiceContainer {
  static get rejection() {
    const repo = new MysqlRejectionRepository();

    return {
      createRejection: new CreateRejection(repo),
      getRejections: new GetRejections(repo),
    };
  }
}
