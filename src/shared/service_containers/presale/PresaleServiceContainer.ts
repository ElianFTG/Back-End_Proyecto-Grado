import { MysqlPresaleRepository } from '../../../infrastructure/repositories/MysqlPresaleRepository';
import { CreatePresale } from '../../../application/presale/CreatePresale';
import { UpdatePresale } from '../../../application/presale/UpdatePresale';
import { GetPresales } from '../../../application/presale/GetPresales';
import { GetPresaleById } from '../../../application/presale/GetPresaleById';
import { AssignDistributor } from '../../../application/presale/AssignDistributor';
import { ConfirmDelivery } from '../../../application/presale/ConfirmDelivery';
import { CancelPresale } from '../../../application/presale/CancelPresale';
import { GetPresaleHistory } from '../../../application/presale/GetPresaleHistory';

const presaleRepository = new MysqlPresaleRepository();

export const createPresale = new CreatePresale(presaleRepository);
export const updatePresale = new UpdatePresale(presaleRepository);
export const getPresales = new GetPresales(presaleRepository);
export const getPresaleById = new GetPresaleById(presaleRepository);
export const assignDistributor = new AssignDistributor(presaleRepository);
export const confirmDelivery = new ConfirmDelivery(presaleRepository);
export const cancelPresale = new CancelPresale(presaleRepository);
export const getPresaleHistory = new GetPresaleHistory(presaleRepository);

export { presaleRepository };
