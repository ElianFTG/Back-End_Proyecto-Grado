import { Presentation } from "../../domain/presentation/Presentation";
import { PresentationRepository } from "../../domain/presentation/PresentationRepository";

export class GetAllPresentations {
    constructor(private presentationRepository: PresentationRepository) {}

    async run(): Promise<Presentation[]> {
        return this.presentationRepository.getAll();
    }
}
