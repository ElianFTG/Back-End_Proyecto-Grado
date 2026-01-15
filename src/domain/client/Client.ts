export class Client {
  id?: number| undefined;
  name: string;
  lastName: string;
  secondLastName: string;
  phone: string;
  ci: string | null;
  clientTypeId: number;

  constructor(
    name: string,
    lastName: string,
    secondLastName: string,
    phone: string,
    clientTypeId: number,
    ci: string | null,
    id?: number
  ) {
    this.id = id;
    this.name = name;
    this.lastName = lastName;
    this.secondLastName = secondLastName;
    this.phone = phone;
    this.clientTypeId = clientTypeId;
    this.ci = ci;
  }
}
