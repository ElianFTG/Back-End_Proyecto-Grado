
export class Supplier {
    id?: number | undefined;
    nit: string;
    name: string;
    phone: string;
    countryId: number | null;
    address: string;
    contactName: string;
    state: boolean;
    userId: number | null;

    constructor(
        nit: string,
        name: string,
        phone: string,
        countryId: number | null,
        address: string,
        contactName: string,
        state: boolean = true,
        userId: number | null = null,
        id?: number
    ) {
        this.id = id;
        this.nit = nit;
        this.name = name;
        this.phone = phone;
        this.countryId = countryId;
        this.address = address;
        this.contactName = contactName;
        this.state = state;
        this.userId = userId;
    }
}
