export class ClientType{
    id? : number | undefined;
    name : string;

    constructor(name : string, id?: number){
        this.name = name;
        this.id = id;
    }
}