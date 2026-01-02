import { Presentation } from "../../domain/presentation/Presentation";
import { PresentationRepository } from "../../domain/presentation/PresentationRepository";

export class FindByIdPresentation {
    constructor(private presentationRepository: PresentationRepository) {}

    async run(id: number): Promise<Presentation | null> {
        return this.presentationRepository.findById(id);
    }
}
