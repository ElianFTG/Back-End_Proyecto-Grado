import { Color } from "./Color";

export interface ColorRepository {
    getAll(): Promise<Color[]>;
    create(color: Color): Promise<Color | null>;
    findById(id: number): Promise<Color | null>;
    update(id: number, color: Partial<Color>, userId: number): Promise<Color | null>;
    updateState(id: number, userId: number): Promise<void>;
}
