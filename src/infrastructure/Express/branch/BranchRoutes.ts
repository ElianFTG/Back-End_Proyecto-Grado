import { Router } from 'express';
import { BranchController } from './BranchController';

const controller = new BranchController();

const BranchRouter = Router();

BranchRouter.get('/branches', controller.getAll.bind(controller));
BranchRouter.post('/branches', controller.create.bind(controller));
BranchRouter.get('/branches/:id', controller.findById.bind(controller));
BranchRouter.put('/branches/:id', controller.update.bind(controller));
BranchRouter.patch('/branches/:id/state', controller.updateState.bind(controller));

export { BranchRouter };
