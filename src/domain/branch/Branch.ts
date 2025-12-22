export class Branch {
    id?: number | undefined;
    name: string;
    state: boolean;
    userId?: number | null;

    constructor(
        name: string,
        state: boolean = true,
        userId?: number | null,
        id?: number
    ) {
        this.id = id;
        this.name = name;
        this.state = state;
        this.userId = userId ?? null;
    }
}
