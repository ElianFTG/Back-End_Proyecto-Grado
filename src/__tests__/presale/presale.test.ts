import { CreatePresale } from '../../application/presale/CreatePresale';
import { UpdatePresale } from '../../application/presale/UpdatePresale';
import { GetPresales } from '../../application/presale/GetPresales';
import { GetPresaleById } from '../../application/presale/GetPresaleById';
import { CancelPresale } from '../../application/presale/CancelPresale';
import { AssignDistributor } from '../../application/presale/AssignDistributor';
import { ConfirmDelivery } from '../../application/presale/ConfirmDelivery';
import { MarkAsNotDelivered } from '../../application/presale/MarkAsNotDelivered';
import { ReturnPresaleProducts } from '../../application/presale/ReturnPresaleProducts';
import { GetDeliveriesByDistributor } from '../../application/presale/GetDeliveriesByDistributor';
import { CreateDirectSale } from '../../application/presale/CreateDirectSale';
import { Presale, PresaleDetail } from '../../domain/presale/Presale';
import { PresaleRepository } from '../../domain/presale/PresaleRepository';
import {
  CreatePresaleDTO,
  ConfirmDeliveryDTO,
  UpdatePresaleDTO,
  ReturnPresaleProductsDTO,
  PaginatedPresalesResult,
  PresaleFilters,
} from '../../domain/presale/PresaleFilter';

// ─── Mocks ───────────────────────────────────────────────────────────────────

const makeRepo = (overrides: Partial<PresaleRepository> = {}): PresaleRepository => ({
  create: jest.fn().mockResolvedValue(null),
  createDirectSale: jest.fn().mockResolvedValue(null),
  update: jest.fn().mockResolvedValue(null),
  getAll: jest.fn().mockResolvedValue({ data: [], total: 0, page: 1, limit: 10, totalPages: 0 }),
  getById: jest.fn().mockResolvedValue(null),
  getByIdWithDetails: jest.fn().mockResolvedValue(null),
  assignDistributor: jest.fn().mockResolvedValue(null),
  confirmDelivery: jest.fn().mockResolvedValue(null),
  cancelPresale: jest.fn().mockResolvedValue(null),
  markAsNotDelivered: jest.fn().mockResolvedValue(null),
  updateDetail: jest.fn().mockResolvedValue(null),
  getDetailsByPresaleId: jest.fn().mockResolvedValue([]),
  getStatusHistory: jest.fn().mockResolvedValue([]),
  softDelete: jest.fn().mockResolvedValue(false),
  canDistributorAccess: jest.fn().mockResolvedValue(false),
  getDeliveriesByDistributor: jest.fn().mockResolvedValue([]),
  returnProducts: jest.fn().mockResolvedValue(null),
  findBusinessIdsByDistributorAndDate: jest.fn().mockResolvedValue([]),
  getReport: jest.fn().mockResolvedValue({ data: [], total: 0, page: 1, limit: 10, totalPages: 0 }),
  ...overrides,
});

const tomorrow = (): string => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

const yesterday = (): string => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
};

const makeCreateDTO = (overrides: Partial<CreatePresaleDTO> = {}): CreatePresaleDTO => ({
  clientId: 1,
  branchId: 1,
  deliveryDate: tomorrow(),
  status: 'pendiente',
  userId: 10,
  deliveredAt: null,
  details: [
    { productId: 1, quantityRequested: 2, priceTypeId: 1, unitPrice: 10 },
  ],
  ...overrides,
});

const makePresale = (overrides: Partial<Presale> = {}): Presale => ({
  id: 1,
  clientId: 1,
  businessId: null,
  presellerId: 5,
  distributorId: null,
  branchId: 1,
  deliveryDate: new Date(tomorrow()),
  deliveredAt: null,
  status: 'pendiente',
  subtotal: 20,
  total: 20,
  notes: null,
  deliveryNotes: null,
  userId: 10,
  state: true,
  ...overrides,
} as Presale);

const makePaginatedResult = (presales: Presale[] = []): PaginatedPresalesResult => ({
  data: presales,
  total: presales.length,
  page: 1,
  limit: 10,
  totalPages: Math.ceil(presales.length / 10),
});

// ─── Presale domain model ─────────────────────────────────────────────────────

describe('Presale domain model', () => {
  it('crea una preventa con estado por defecto pendiente', () => {
    const presale = new Presale(1, 1, new Date(), 10, 5);
    expect(presale.status).toBe('pendiente');
    expect(presale.state).toBe(true);
    expect(presale.total).toBe(0);
  });

  it('crea un detalle de preventa con subtotal calculado', () => {
    const detail = new PresaleDetail(1, 1, 3, 1, 10, 5);
    expect(detail.subtotalRequested).toBe(30); // 3 * 10
  });

  it('crea detalle con subtotal explícito', () => {
    const detail = new PresaleDetail(1, 1, 3, 1, 10, 5, null, null, 99);
    expect(detail.subtotalRequested).toBe(99);
  });
});

// ─── CreatePresale ────────────────────────────────────────────────────────────

describe('CreatePresale', () => {
  it('crea una preventa correctamente', async () => {
    const presale = makePresale();
    const repo = makeRepo({ create: jest.fn().mockResolvedValue(presale) });
    const uc = new CreatePresale(repo);
    const result = await uc.run(makeCreateDTO());
    expect(result).toEqual(presale);
  });

  it('lanza error si no hay clientId', async () => {
    const repo = makeRepo();
    const uc = new CreatePresale(repo);
    await expect(uc.run(makeCreateDTO({ clientId: 0 }))).rejects.toThrow('El cliente es obligatorio');
  });

  it('lanza error si no hay branchId', async () => {
    const repo = makeRepo();
    const uc = new CreatePresale(repo);
    await expect(uc.run(makeCreateDTO({ branchId: 0 }))).rejects.toThrow('La sucursal es obligatoria');
  });

  it('lanza error si no hay deliveryDate', async () => {
    const repo = makeRepo();
    const uc = new CreatePresale(repo);
    await expect(uc.run(makeCreateDTO({ deliveryDate: '' }))).rejects.toThrow('La fecha de entrega es obligatoria');
  });

  it('lanza error si no hay detalles', async () => {
    const repo = makeRepo();
    const uc = new CreatePresale(repo);
    await expect(uc.run(makeCreateDTO({ details: [] }))).rejects.toThrow('al menos un producto');
  });

  it('lanza error si la fecha es anterior a hoy', async () => {
    const repo = makeRepo();
    const uc = new CreatePresale(repo);
    await expect(uc.run(makeCreateDTO({ deliveryDate: yesterday() }))).rejects.toThrow('anterior a hoy');
  });

  it('lanza error si la fecha tiene formato inválido', async () => {
    const repo = makeRepo();
    const uc = new CreatePresale(repo);
    await expect(uc.run(makeCreateDTO({ deliveryDate: 'not-a-date' }))).rejects.toThrow('no es válida');
  });

  it('lanza error si la cantidad solicitada es 0', async () => {
    const repo = makeRepo();
    const uc = new CreatePresale(repo);
    await expect(
      uc.run(makeCreateDTO({ details: [{ productId: 1, quantityRequested: 0, priceTypeId: 1, unitPrice: 10 }] }))
    ).rejects.toThrow('mayor a 0');
  });

  it('lanza error si el precio unitario es 0', async () => {
    const repo = makeRepo();
    const uc = new CreatePresale(repo);
    await expect(
      uc.run(makeCreateDTO({ details: [{ productId: 1, quantityRequested: 1, priceTypeId: 1, unitPrice: 0 }] }))
    ).rejects.toThrow('precio unitario debe ser mayor a 0');
  });

  it('lanza error si falta productId en detalle', async () => {
    const repo = makeRepo();
    const uc = new CreatePresale(repo);
    await expect(
      uc.run(makeCreateDTO({ details: [{ productId: 0, quantityRequested: 1, priceTypeId: 1, unitPrice: 10 }] }))
    ).rejects.toThrow('producto es obligatorio');
  });

  it('lanza error si falta priceTypeId en detalle', async () => {
    const repo = makeRepo();
    const uc = new CreatePresale(repo);
    await expect(
      uc.run(makeCreateDTO({ details: [{ productId: 1, quantityRequested: 1, priceTypeId: 0, unitPrice: 10 }] }))
    ).rejects.toThrow('tipo de precio es obligatorio');
  });
});

// ─── CreateDirectSale ─────────────────────────────────────────────────────────

describe('CreateDirectSale', () => {
  it('crea venta directa correctamente', async () => {
    const presale = makePresale({ status: 'entregado' });
    const repo = makeRepo({ createDirectSale: jest.fn().mockResolvedValue(presale) });
    const uc = new CreateDirectSale(repo);
    const result = await uc.run(makeCreateDTO());
    expect(result).toEqual(presale);
  });

  it('lanza error si no hay clientId', async () => {
    const repo = makeRepo();
    const uc = new CreateDirectSale(repo);
    await expect(uc.run(makeCreateDTO({ clientId: 0 }))).rejects.toThrow('El cliente es obligatorio');
  });

  it('lanza error si no hay detalles', async () => {
    const repo = makeRepo();
    const uc = new CreateDirectSale(repo);
    await expect(uc.run(makeCreateDTO({ details: [] }))).rejects.toThrow('al menos un producto');
  });

  it('lanza error si la cantidad es <= 0', async () => {
    const repo = makeRepo();
    const uc = new CreateDirectSale(repo);
    await expect(
      uc.run(makeCreateDTO({ details: [{ productId: 1, quantityRequested: -1, priceTypeId: 1, unitPrice: 5 }] }))
    ).rejects.toThrow('mayor a 0');
  });
});

// ─── UpdatePresale ────────────────────────────────────────────────────────────

describe('UpdatePresale', () => {
  it('actualiza una preventa en estado pendiente', async () => {
    const existing = makePresale({ status: 'pendiente' });
    const updated = makePresale({ notes: 'Actualizado' });
    const repo = makeRepo({
      getById: jest.fn().mockResolvedValue(existing),
      update: jest.fn().mockResolvedValue(updated),
    });
    const uc = new UpdatePresale(repo);
    const result = await uc.run(1, { notes: 'Actualizado' }, 10);
    expect(result).toEqual(updated);
  });

  it('lanza error si no hay id', async () => {
    const repo = makeRepo();
    const uc = new UpdatePresale(repo);
    await expect(uc.run(0, {}, 10)).rejects.toThrow('ID de la preventa es obligatorio');
  });

  it('lanza error si la preventa no existe', async () => {
    const repo = makeRepo({ getById: jest.fn().mockResolvedValue(null) });
    const uc = new UpdatePresale(repo);
    await expect(uc.run(999, {}, 10)).rejects.toThrow('no encontrada');
  });

  it('lanza error si el estado no es pendiente', async () => {
    const repo = makeRepo({ getById: jest.fn().mockResolvedValue(makePresale({ status: 'asignado' })) });
    const uc = new UpdatePresale(repo);
    await expect(uc.run(1, {}, 10)).rejects.toThrow('estado pendiente');
  });

  it('lanza error si la fecha de actualización es anterior a hoy', async () => {
    const repo = makeRepo({ getById: jest.fn().mockResolvedValue(makePresale({ status: 'pendiente' })) });
    const uc = new UpdatePresale(repo);
    await expect(uc.run(1, { deliveryDate: yesterday() }, 10)).rejects.toThrow('anterior a hoy');
  });

  it('lanza error si detalle add tiene cantidad <= 0', async () => {
    const repo = makeRepo({ getById: jest.fn().mockResolvedValue(makePresale({ status: 'pendiente' })) });
    const uc = new UpdatePresale(repo);
    const dto: UpdatePresaleDTO = {
      details: { add: [{ productId: 1, quantityRequested: 0, priceTypeId: 1, unitPrice: 10 }] },
    };
    await expect(uc.run(1, dto, 10)).rejects.toThrow('mayor a 0');
  });

  it('lanza error si detalle update tiene precio <= 0', async () => {
    const repo = makeRepo({ getById: jest.fn().mockResolvedValue(makePresale({ status: 'pendiente' })) });
    const uc = new UpdatePresale(repo);
    const dto: UpdatePresaleDTO = {
      details: { update: [{ detailId: 1, quantityRequested: 2, unitPrice: 0 }] },
    };
    await expect(uc.run(1, dto, 10)).rejects.toThrow('precio unitario debe ser mayor a 0');
  });
});

// ─── GetPresales ──────────────────────────────────────────────────────────────

describe('GetPresales', () => {
  it('retorna preventas sin filtros', async () => {
    const result = makePaginatedResult([makePresale()]);
    const repo = makeRepo({ getAll: jest.fn().mockResolvedValue(result) });
    const uc = new GetPresales(repo);
    expect(await uc.run({})).toEqual(result);
  });

  it('lanza error si deliveryDate tiene formato incorrecto', async () => {
    const repo = makeRepo();
    const uc = new GetPresales(repo);
    await expect(uc.run({ deliveryDate: '07-04-2026' })).rejects.toThrow('YYYY-MM-DD');
  });

  it('lanza error si deliveryDateFrom tiene formato incorrecto', async () => {
    const repo = makeRepo();
    const uc = new GetPresales(repo);
    await expect(uc.run({ deliveryDateFrom: '2026/04/07' })).rejects.toThrow('deliveryDateFrom');
  });

  it('lanza error si deliveryDateTo tiene formato incorrecto', async () => {
    const repo = makeRepo();
    const uc = new GetPresales(repo);
    await expect(uc.run({ deliveryDateTo: '07/04/2026' })).rejects.toThrow('deliveryDateTo');
  });

  it('convierte deliveryDate en rango de fechas', async () => {
    const repo = makeRepo({ getAll: jest.fn().mockResolvedValue(makePaginatedResult()) });
    const uc = new GetPresales(repo);
    await uc.run({ deliveryDate: '2026-04-07' });
    const call = (repo.getAll as jest.Mock).mock.calls[0][0] as PresaleFilters;
    expect(call.deliveryDateFrom).toBe('2026-04-07');
    expect(call.deliveryDateTo).toBe('2026-04-07');
    expect(call.deliveryDate).toBeUndefined();
  });

  it('filtra por prevendedor', async () => {
    const repo = makeRepo({ getAll: jest.fn().mockResolvedValue(makePaginatedResult()) });
    const uc = new GetPresales(repo);
    await uc.run({ presellerId: 3 });
    expect(repo.getAll).toHaveBeenCalledWith({ presellerId: 3 });
  });
});

// ─── GetPresaleById ───────────────────────────────────────────────────────────

describe('GetPresaleById', () => {
  it('retorna la preventa sin detalles por defecto', async () => {
    const presale = makePresale();
    const repo = makeRepo({ getById: jest.fn().mockResolvedValue(presale) });
    const uc = new GetPresaleById(repo);
    expect(await uc.run(1)).toEqual(presale);
    expect(repo.getById).toHaveBeenCalledWith(1);
    expect(repo.getByIdWithDetails).not.toHaveBeenCalled();
  });

  it('retorna la preventa con detalles si withDetails=true', async () => {
    const presale = makePresale({ details: [] });
    const repo = makeRepo({ getByIdWithDetails: jest.fn().mockResolvedValue(presale) });
    const uc = new GetPresaleById(repo);
    expect(await uc.run(1, true)).toEqual(presale);
    expect(repo.getByIdWithDetails).toHaveBeenCalledWith(1);
  });

  it('retorna null si la preventa no existe', async () => {
    const repo = makeRepo({ getById: jest.fn().mockResolvedValue(null) });
    const uc = new GetPresaleById(repo);
    expect(await uc.run(999)).toBeNull();
  });
});

// ─── CancelPresale ────────────────────────────────────────────────────────────

describe('CancelPresale', () => {
  it('cancela una preventa correctamente', async () => {
    const cancelled = makePresale({ status: 'cancelado' });
    const repo = makeRepo({ cancelPresale: jest.fn().mockResolvedValue(cancelled) });
    const uc = new CancelPresale(repo);
    const result = await uc.run(1, 'Motivo del cancelado', 10);
    expect(result).toEqual(cancelled);
    expect(repo.cancelPresale).toHaveBeenCalledWith(1, 'Motivo del cancelado', 10);
  });

  it('lanza error si no hay presaleId', async () => {
    const repo = makeRepo();
    const uc = new CancelPresale(repo);
    await expect(uc.run(0, null, 10)).rejects.toThrow('ID de la preventa es obligatorio');
  });

  it('acepta reason null', async () => {
    const repo = makeRepo({ cancelPresale: jest.fn().mockResolvedValue(makePresale()) });
    const uc = new CancelPresale(repo);
    await uc.run(1, null, 10);
    expect(repo.cancelPresale).toHaveBeenCalledWith(1, null, 10);
  });
});

// ─── AssignDistributor ────────────────────────────────────────────────────────

describe('AssignDistributor', () => {
  it('asigna un distribuidor correctamente', async () => {
    const assigned = makePresale({ distributorId: 3, status: 'asignado' });
    const repo = makeRepo({ assignDistributor: jest.fn().mockResolvedValue(assigned) });
    const uc = new AssignDistributor(repo);
    const result = await uc.run(1, 3, 10);
    expect(result).toEqual(assigned);
    expect(repo.assignDistributor).toHaveBeenCalledWith(1, 3, 10);
  });

  it('lanza error si no hay presaleId', async () => {
    const repo = makeRepo();
    const uc = new AssignDistributor(repo);
    await expect(uc.run(0, 3, 10)).rejects.toThrow('ID de la preventa es obligatorio');
  });

  it('lanza error si no hay distributorId', async () => {
    const repo = makeRepo();
    const uc = new AssignDistributor(repo);
    await expect(uc.run(1, 0, 10)).rejects.toThrow('ID del distribuidor es obligatorio');
  });
});

// ─── ConfirmDelivery ──────────────────────────────────────────────────────────

describe('ConfirmDelivery', () => {
  const makeConfirmDTO = (overrides: Partial<ConfirmDeliveryDTO> = {}): ConfirmDeliveryDTO => ({
    details: [{ detailId: 1, quantityDelivered: 2 }],
    ...overrides,
  });

  it('confirma entrega correctamente', async () => {
    const delivered = makePresale({ status: 'entregado' });
    const repo = makeRepo({ confirmDelivery: jest.fn().mockResolvedValue(delivered) });
    const uc = new ConfirmDelivery(repo);
    const result = await uc.run(1, makeConfirmDTO(), 10);
    expect(result).toEqual(delivered);
  });

  it('lanza error si no hay presaleId', async () => {
    const repo = makeRepo();
    const uc = new ConfirmDelivery(repo);
    await expect(uc.run(0, makeConfirmDTO(), 10)).rejects.toThrow('ID de la preventa es obligatorio');
  });

  it('lanza error si no hay detalles', async () => {
    const repo = makeRepo();
    const uc = new ConfirmDelivery(repo);
    await expect(uc.run(1, makeConfirmDTO({ details: [] }), 10)).rejects.toThrow('detalles de entrega');
  });

  it('lanza error si cantidad entregada es negativa', async () => {
    const repo = makeRepo();
    const uc = new ConfirmDelivery(repo);
    await expect(
      uc.run(1, makeConfirmDTO({ details: [{ detailId: 1, quantityDelivered: -1 }] }), 10)
    ).rejects.toThrow('negativa');
  });

  it('permite cantidad entregada = 0 (entrega parcial)', async () => {
    const repo = makeRepo({ confirmDelivery: jest.fn().mockResolvedValue(makePresale()) });
    const uc = new ConfirmDelivery(repo);
    await expect(
      uc.run(1, makeConfirmDTO({ details: [{ detailId: 1, quantityDelivered: 0 }] }), 10)
    ).resolves.not.toThrow();
  });
});

// ─── MarkAsNotDelivered ───────────────────────────────────────────────────────

describe('MarkAsNotDelivered', () => {
  it('marca como no entregada correctamente', async () => {
    const presale = makePresale({ status: 'no entregado' });
    const repo = makeRepo({ markAsNotDelivered: jest.fn().mockResolvedValue(presale) });
    const uc = new MarkAsNotDelivered(repo);
    const result = await uc.run(1, 10);
    expect(result).toEqual(presale);
    expect(repo.markAsNotDelivered).toHaveBeenCalledWith(1, 10);
  });

  it('lanza error si no hay id', async () => {
    const repo = makeRepo();
    const uc = new MarkAsNotDelivered(repo);
    await expect(uc.run(0, 10)).rejects.toThrow('ID de la preventa es obligatorio');
  });
});

// ─── GetDeliveriesByDistributor ───────────────────────────────────────────────

describe('GetDeliveriesByDistributor', () => {
  it('retorna entregas correctamente', async () => {
    const items = [{ presaleId: 1, clientName: 'Juan', businessName: 'Tienda A', address: 'Calle 1', position: null, presaleStatus: 'pendiente', products: [] }];
    const repo = makeRepo({ getDeliveriesByDistributor: jest.fn().mockResolvedValue(items) });
    const uc = new GetDeliveriesByDistributor(repo);
    const result = await uc.run(3, '2026-04-07');
    expect(result).toEqual(items);
  });

  it('lanza error si no hay distributorId', async () => {
    const repo = makeRepo();
    const uc = new GetDeliveriesByDistributor(repo);
    await expect(uc.run(0, '2026-04-07')).rejects.toThrow('ID del distribuidor es obligatorio');
  });

  it('lanza error si no hay fecha', async () => {
    const repo = makeRepo();
    const uc = new GetDeliveriesByDistributor(repo);
    await expect(uc.run(1, '')).rejects.toThrow('fecha de entrega es obligatoria');
  });

  it('lanza error si el formato de fecha es incorrecto', async () => {
    const repo = makeRepo();
    const uc = new GetDeliveriesByDistributor(repo);
    await expect(uc.run(1, '07-04-2026')).rejects.toThrow('YYYY-MM-DD');
  });

  it('acepta fecha en formato correcto', async () => {
    const repo = makeRepo({ getDeliveriesByDistributor: jest.fn().mockResolvedValue([]) });
    const uc = new GetDeliveriesByDistributor(repo);
    await uc.run(1, '2026-04-07');
    expect(repo.getDeliveriesByDistributor).toHaveBeenCalledWith(1, '2026-04-07');
  });
});

// ─── ReturnPresaleProducts ────────────────────────────────────────────────────

describe('ReturnPresaleProducts', () => {
  const makeReturnDTO = (overrides: Partial<ReturnPresaleProductsDTO> = {}): ReturnPresaleProductsDTO => ({
    products: [{ detailId: 1, quantityToReturn: 2 }],
    notes: 'Producto dañado',
    ...overrides,
  });

  const makeReturnResult = () => ({
    presaleId: 1,
    status: 'parcial',
    returnedProducts: [{ detailId: 1, productId: 1, productName: 'Prod A', quantityReturned: 2 }],
    notes: 'Producto dañado',
  });

  it('devuelve productos de una preventa parcial', async () => {
    const presale = makePresale({ status: 'parcial' });
    const returnResult = makeReturnResult();
    const repo = makeRepo({
      getById: jest.fn().mockResolvedValue(presale),
      returnProducts: jest.fn().mockResolvedValue(returnResult),
    });
    const uc = new ReturnPresaleProducts(repo);
    const result = await uc.run(1, makeReturnDTO(), 10);
    expect(result).toEqual(returnResult);
  });

  it('devuelve productos de una preventa cancelada', async () => {
    const presale = makePresale({ status: 'cancelado' });
    const repo = makeRepo({
      getById: jest.fn().mockResolvedValue(presale),
      returnProducts: jest.fn().mockResolvedValue(makeReturnResult()),
    });
    const uc = new ReturnPresaleProducts(repo);
    await expect(uc.run(1, makeReturnDTO(), 10)).resolves.not.toThrow();
  });

  it('lanza error si presaleId no es válido', async () => {
    const repo = makeRepo();
    const uc = new ReturnPresaleProducts(repo);
    await expect(uc.run(0, makeReturnDTO(), 10)).rejects.toThrow('ID de la preventa es obligatorio');
  });

  it('lanza error si la preventa no existe', async () => {
    const repo = makeRepo({ getById: jest.fn().mockResolvedValue(null) });
    const uc = new ReturnPresaleProducts(repo);
    await expect(uc.run(1, makeReturnDTO(), 10)).rejects.toThrow('no encontrada');
  });

  it('lanza error si el estado no es parcial ni cancelado', async () => {
    const presale = makePresale({ status: 'pendiente' });
    const repo = makeRepo({ getById: jest.fn().mockResolvedValue(presale) });
    const uc = new ReturnPresaleProducts(repo);
    await expect(uc.run(1, makeReturnDTO(), 10)).rejects.toThrow('parcial o cancelado');
  });

  it('lanza error si products es array vacío', async () => {
    const presale = makePresale({ status: 'parcial' });
    const repo = makeRepo({ getById: jest.fn().mockResolvedValue(presale) });
    const uc = new ReturnPresaleProducts(repo);
    await expect(uc.run(1, makeReturnDTO({ products: [] }), 10)).rejects.toThrow('al menos un elemento');
  });

  it('lanza error si detailId no es válido', async () => {
    const presale = makePresale({ status: 'parcial' });
    const repo = makeRepo({ getById: jest.fn().mockResolvedValue(presale) });
    const uc = new ReturnPresaleProducts(repo);
    await expect(
      uc.run(1, { products: [{ detailId: 0, quantityToReturn: 2 }] }, 10)
    ).rejects.toThrow('detailId válido');
  });

  it('lanza error si quantityToReturn es <= 0', async () => {
    const presale = makePresale({ status: 'parcial' });
    const repo = makeRepo({ getById: jest.fn().mockResolvedValue(presale) });
    const uc = new ReturnPresaleProducts(repo);
    await expect(
      uc.run(1, { products: [{ detailId: 1, quantityToReturn: 0 }] }, 10)
    ).rejects.toThrow('mayor a 0');
  });
});
