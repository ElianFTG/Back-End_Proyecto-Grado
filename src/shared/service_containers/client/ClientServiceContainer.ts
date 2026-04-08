import { MysqlClientRepository } from "../../../infrastructure/repositories/MysqlClientRepository";


import { CreateClient } from "../../../application/client/CreateClient";
import { GetClients } from "../../../application/client/GetClients";
import { FindByIdClient } from "../../../application/client/FindByIdClient";
import { UpdateClient } from "../../../application/client/UpdateClient";
import { SoftDeleteClient } from "../../../application/client/SoftDeleteClient";
import { SearchClients } from "../../../application/client/SearchClients";

const clientRepo = new MysqlClientRepository();

export const ClientServiceContainer =  {
    
    client: {
        createClient : new CreateClient(clientRepo),
        getClients : new GetClients(clientRepo),
        findByIdClient : new FindByIdClient(clientRepo),
        updateClient : new UpdateClient(clientRepo),
        softDeleteClient : new SoftDeleteClient(clientRepo),
        searchClients : new SearchClients(clientRepo),
    }
    
};
