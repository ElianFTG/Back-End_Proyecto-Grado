import { MysqlPresaleRepository } from '../../../infrastructure/repositories/MysqlPresaleRepository';
import { CreatePresale } from '../../../application/presale/CreatePresale';
import { UpdatePresale } from '../../../application/presale/UpdatePresale';
import { GetPresales } from '../../../application/presale/GetPresales';
import { GetPresaleById } from '../../../application/presale/GetPresaleById';
import { AssignDistributor } from '../../../application/presale/AssignDistributor';
import { ConfirmDelivery } from '../../../application/presale/ConfirmDelivery';
import { CancelPresale } from '../../../application/presale/CancelPresale';
import { GetPresaleHistory } from '../../../application/presale/GetPresaleHistory';
import { GetDeliveriesByDistributor } from '../../../application/presale/GetDeliveriesByDistributor';
import { ReturnPresaleProducts } from '../../../application/presale/ReturnPresaleProducts';
import { CreateDirectSale } from '../../../application/presale/CreateDirectSale';
import { MarkAsNotDelivered } from '../../../application/presale/MarkAsNotDelivered';
import { GetPresaleReport } from '../../../application/presale/GetPresaleReport';

const presaleRepository = new MysqlPresaleRepository();

export const createPresale = new CreatePresale(presaleRepository);
export const createDirectSale = new CreateDirectSale(presaleRepository);
export const updatePresale = new UpdatePresale(presaleRepository);
export const getPresales = new GetPresales(presaleRepository);
export const getPresaleById = new GetPresaleById(presaleRepository);
export const assignDistributor = new AssignDistributor(presaleRepository);
export const confirmDelivery = new ConfirmDelivery(presaleRepository);
export const cancelPresale = new CancelPresale(presaleRepository);
export const markAsNotDelivered = new MarkAsNotDelivered(presaleRepository);
export const getPresaleHistory = new GetPresaleHistory(presaleRepository);
export const getDeliveriesByDistributor = new GetDeliveriesByDistributor(presaleRepository);
export const returnPresaleProducts = new ReturnPresaleProducts(presaleRepository);
export const getPresaleReport = new GetPresaleReport(presaleRepository);

export { presaleRepository };