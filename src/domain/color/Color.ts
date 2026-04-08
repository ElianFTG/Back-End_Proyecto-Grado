export class Color {
    id?: number | undefined;
    name: string;
    state: boolean;
    userId: number;

    constructor(
        name: string,
        userId: number,
        state: boolean = true,
        id?: number
    ) {
        this.id = id;
        this.name = name;
        this.state = state;
        this.userId = userId;
    }
}
