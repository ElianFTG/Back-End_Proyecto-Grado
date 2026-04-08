import { MysqlPresentationRepository } from "../../../infrastructure/repositories/MysqlPresentationRepository";
import { CreatePresentation } from "../../../application/presentation/CreatePresentation";
import { GetAllPresentations } from "../../../application/presentation/GetAllPresentations";
import { FindByIdPresentation } from "../../../application/presentation/FindByIdPresentation";
import { UpdatePresentation } from "../../../application/presentation/UpdatePresentation";
import { UpdateStatePresentation } from "../../../application/presentation/UpdateStatePresentation";

const presentationRepository = new MysqlPresentationRepository();

export const PresentationServiceContainer = {
    presentation: {
        getAll: new GetAllPresentations(presentationRepository),
        create: new CreatePresentation(presentationRepository),
        findById: new FindByIdPresentation(presentationRepository),
        update: new UpdatePresentation(presentationRepository),
        updateState: new UpdateStatePresentation(presentationRepository),
    }
}
