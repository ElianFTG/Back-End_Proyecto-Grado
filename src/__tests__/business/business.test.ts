import { CreateBusiness } from '../../application/business/CreateBusiness';
import { UpdateBusiness } from '../../application/business/UpdateBusiness';
import { FindByIdBusiness } from '../../application/business/FindByIdBusiness';
import { GetBusinesses } from '../../application/business/GetBusinesses';
import { SoftDeleteBusiness } from '../../application/business/SoftDeleteBusiness';
import { GetDistanceInMetersBetweenPoints } from '../../application/business/GetDistanceInMetersBetweenPoints';
import { GetBusinessActivitiesByRoute } from '../../application/business/GetBusinessActivityByRoute';
import { Business } from '../../domain/business/Business';
import { BusinessRepository, PaginatedBusinessesResult } from '../../domain/business/BusinessRepository';
import { RouteRepository } from '../../domain/route/RouteRepository';
import { Route } from '../../domain/route/Route';
import { Position } from '../../domain/customs/Position';

// ─── Mocks ───────────────────────────────────────────────────────────────────

const makeBusinessRepo = (overrides: Partial<BusinessRepository> = {}): BusinessRepository => ({
  create: jest.fn().mockResolvedValue(null),
  getAll: jest.fn().mockResolvedValue({ data: [], total: 0, page: 1, limit: 10, totalPages: 0 }),
  findById: jest.fn().mockResolvedValue(null),
  update: jest.fn().mockResolvedValue(null),
  softDelete: jest.fn().mockResolvedValue(false),
  getDistanceInMetersBetweenPoints: jest.fn().mockResolvedValue(null),
  getBusinessActivitiesByRoute: jest.fn().mockResolvedValue([]),
  getBusinessesActivityForPreseller: jest.fn().mockResolvedValue(null),
  getBusinessesActivityForDistributor: jest.fn().mockResolvedValue(null),
  ...overrides,
});

const makeRouteRepo = (overrides: Partial<RouteRepository> = {}): RouteRepository => ({
  create: jest.fn().mockResolvedValue(null),
  findById: jest.fn().mockResolvedValue(null),
  findAreaForRouteByUserAndDate: jest.fn().mockResolvedValue(null),
  getRoutes: jest.fn().mockResolvedValue([]),
  update: jest.fn().mockResolvedValue(null),
  ...overrides,
});

const makeBusiness = (overrides: Partial<Business> = {}): Business =>
  new Business(
    'Tienda El Sol',
    1,
    1,
    1,
    2,
    '12345',
    { lat: -17.39, lng: -66.15 },
    null,
    'Av. Heroínas 123',
    true,
    1,
  );

const makePaginated = (data: Business[] = []): PaginatedBusinessesResult => ({
  data,
  total: data.length,
  page: 1,
  limit: 10,
  totalPages: Math.ceil(data.length / 10),
});

const makeRoute = (): Route => new Route('2026-04-07', 5, 2, 1);

// ─── Business domain model ────────────────────────────────────────────────────

describe('Business domain model', () => {
  it('crea un negocio con todos los campos', () => {
    const b = makeBusiness();
    expect(b.name).toBe('Tienda El Sol');
    expect(b.isActive).toBe(true);
    expect(b.id).toBe(1);
    expect(b.position).toEqual({ lat: -17.39, lng: -66.15 });
  });

  it('crea un negocio sin id (nuevo)', () => {
    const b = new Business('Mini Mercado', 2, 3, null, null, null, null, null, null);
    expect(b.id).toBeUndefined();
    expect(b.isActive).toBe(true);
    expect(b.nit).toBeNull();
    expect(b.position).toBeNull();
  });
});

// ─── Route domain model ───────────────────────────────────────────────────────

describe('Route domain model', () => {
  it('crea una ruta con id', () => {
    const route = new Route('2026-04-07', 5, 2, 1);
    expect(route.assignedDate).toBe('2026-04-07');
    expect(route.assignedIdUser).toBe(5);
    expect(route.assignedIdArea).toBe(2);
    expect(route.id).toBe(1);
  });

  it('crea una ruta sin id', () => {
    const route = new Route('2026-04-08', 3, 1);
    expect(route.id).toBeUndefined();
  });
});

// ─── CreateBusiness ───────────────────────────────────────────────────────────

describe('CreateBusiness', () => {
  it('crea un negocio correctamente', async () => {
    const business = makeBusiness();
    const repo = makeBusinessRepo({ create: jest.fn().mockResolvedValue(business) });
    const uc = new CreateBusiness(repo);
    const result = await uc.run(business, 10);
    expect(result).toEqual(business);
    expect(repo.create).toHaveBeenCalledWith(business, 10);
  });

  it('retorna null si el repo retorna null', async () => {
    const repo = makeBusinessRepo({ create: jest.fn().mockResolvedValue(null) });
    const uc = new CreateBusiness(repo);
    expect(await uc.run(makeBusiness(), 1)).toBeNull();
  });

  it('acepta userId null', async () => {
    const business = makeBusiness();
    const repo = makeBusinessRepo({ create: jest.fn().mockResolvedValue(business) });
    const uc = new CreateBusiness(repo);
    await uc.run(business, null);
    expect(repo.create).toHaveBeenCalledWith(business, null);
  });
});

// ─── UpdateBusiness ───────────────────────────────────────────────────────────

describe('UpdateBusiness', () => {
  it('actualiza un negocio correctamente', async () => {
    const updated = makeBusiness();
    const repo = makeBusinessRepo({ update: jest.fn().mockResolvedValue(updated) });
    const uc = new UpdateBusiness(repo);
    const result = await uc.run(1, { name: 'Tienda Nueva' }, 5);
    expect(result).toEqual(updated);
    expect(repo.update).toHaveBeenCalledWith(1, { name: 'Tienda Nueva' }, 5);
  });

  it('retorna null si el negocio no existe', async () => {
    const repo = makeBusinessRepo({ update: jest.fn().mockResolvedValue(null) });
    const uc = new UpdateBusiness(repo);
    expect(await uc.run(999, { name: 'X' }, 1)).toBeNull();
  });

  it('acepta userId null', async () => {
    const repo = makeBusinessRepo({ update: jest.fn().mockResolvedValue(makeBusiness()) });
    const uc = new UpdateBusiness(repo);
    await uc.run(1, { address: 'Nueva Dirección' }, null);
    expect(repo.update).toHaveBeenCalledWith(1, { address: 'Nueva Dirección' }, null);
  });

  it('puede actualizar posición geográfica', async () => {
    const newPos: Position = { lat: -17.5, lng: -66.2 };
    const updated = makeBusiness();
    const repo = makeBusinessRepo({ update: jest.fn().mockResolvedValue(updated) });
    const uc = new UpdateBusiness(repo);
    await uc.run(1, { position: newPos }, 1);
    expect(repo.update).toHaveBeenCalledWith(1, { position: newPos }, 1);
  });
});

// ─── FindByIdBusiness ─────────────────────────────────────────────────────────

describe('FindByIdBusiness', () => {
  it('retorna el negocio si existe', async () => {
    const business = makeBusiness();
    const repo = makeBusinessRepo({ findById: jest.fn().mockResolvedValue(business) });
    const uc = new FindByIdBusiness(repo);
    expect(await uc.run(1)).toEqual(business);
  });

  it('retorna null si no existe', async () => {
    const repo = makeBusinessRepo({ findById: jest.fn().mockResolvedValue(null) });
    const uc = new FindByIdBusiness(repo);
    expect(await uc.run(999)).toBeNull();
  });
});

// ─── GetBusinesses ────────────────────────────────────────────────────────────

describe('GetBusinesses', () => {
  it('retorna negocios sin filtros', async () => {
    const result = makePaginated([makeBusiness()]);
    const repo = makeBusinessRepo({ getAll: jest.fn().mockResolvedValue(result) });
    const uc = new GetBusinesses(repo);
    expect(await uc.run({})).toEqual(result);
  });

  it('filtra por área', async () => {
    const repo = makeBusinessRepo({ getAll: jest.fn().mockResolvedValue(makePaginated()) });
    const uc = new GetBusinesses(repo);
    await uc.run({ areaId: 2 });
    expect(repo.getAll).toHaveBeenCalledWith({ areaId: 2 });
  });

  it('filtra por búsqueda textual', async () => {
    const repo = makeBusinessRepo({ getAll: jest.fn().mockResolvedValue(makePaginated()) });
    const uc = new GetBusinesses(repo);
    await uc.run({ search: 'Tienda' });
    expect(repo.getAll).toHaveBeenCalledWith({ search: 'Tienda' });
  });

  it('filtra por estado activo', async () => {
    const repo = makeBusinessRepo({ getAll: jest.fn().mockResolvedValue(makePaginated()) });
    const uc = new GetBusinesses(repo);
    await uc.run({ state: true });
    expect(repo.getAll).toHaveBeenCalledWith({ state: true });
  });

  it('aplica paginación', async () => {
    const repo = makeBusinessRepo({ getAll: jest.fn().mockResolvedValue(makePaginated()) });
    const uc = new GetBusinesses(repo);
    await uc.run({ page: 2, limit: 5 });
    expect(repo.getAll).toHaveBeenCalledWith({ page: 2, limit: 5 });
  });
});

// ─── SoftDeleteBusiness ───────────────────────────────────────────────────────

describe('SoftDeleteBusiness', () => {
  it('retorna true al eliminar correctamente', async () => {
    const repo = makeBusinessRepo({ softDelete: jest.fn().mockResolvedValue(true) });
    const uc = new SoftDeleteBusiness(repo);
    expect(await uc.run(1, 5)).toBe(true);
    expect(repo.softDelete).toHaveBeenCalledWith(1, 5);
  });

  it('retorna false si no se pudo eliminar', async () => {
    const repo = makeBusinessRepo({ softDelete: jest.fn().mockResolvedValue(false) });
    const uc = new SoftDeleteBusiness(repo);
    expect(await uc.run(999, 5)).toBe(false);
  });

  it('acepta userId null', async () => {
    const repo = makeBusinessRepo({ softDelete: jest.fn().mockResolvedValue(true) });
    const uc = new SoftDeleteBusiness(repo);
    await uc.run(1, null);
    expect(repo.softDelete).toHaveBeenCalledWith(1, null);
  });
});

// ─── GetDistanceInMetersBetweenPoints ─────────────────────────────────────────

describe('GetDistanceInMetersBetweenPoints', () => {
  it('retorna la distancia entre dos puntos', async () => {
    const distanceResult = { distanceMeters: 500 };
    const repo = makeBusinessRepo({
      getDistanceInMetersBetweenPoints: jest.fn().mockResolvedValue(distanceResult),
    });
    const uc = new GetDistanceInMetersBetweenPoints(repo);
    const point: Position = { lat: -17.40, lng: -66.16 };
    const result = await uc.run(1, point);
    expect(result).toEqual(distanceResult);
    expect(repo.getDistanceInMetersBetweenPoints).toHaveBeenCalledWith(1, point);
  });

  it('retorna null si el negocio no existe', async () => {
    const repo = makeBusinessRepo({
      getDistanceInMetersBetweenPoints: jest.fn().mockResolvedValue(null),
    });
    const uc = new GetDistanceInMetersBetweenPoints(repo);
    const result = await uc.run(999, { lat: -17.39, lng: -66.15 });
    expect(result).toBeNull();
  });
});

// ─── GetBusinessActivitiesByRoute ─────────────────────────────────────────────

describe('GetBusinessActivitiesByRoute', () => {
  it('retorna array vacío si no hay ruta para el usuario y fecha', async () => {
    const businessRepo = makeBusinessRepo();
    const routeRepo = makeRouteRepo({ findAreaForRouteByUserAndDate: jest.fn().mockResolvedValue(null) });
    const uc = new GetBusinessActivitiesByRoute(businessRepo, routeRepo);
    const result = await uc.run(5, '2026-04-07');
    expect(result).toEqual([]);
    expect(businessRepo.getBusinessActivitiesByRoute).not.toHaveBeenCalled();
  });

  it('retorna actividades de negocios si hay ruta', async () => {
    const route = makeRoute();
    const activities = [
      { business: makeBusiness(), activity: { id: 1 } },
      { business: makeBusiness(), activity: { id: 2 } },
    ];
    const businessRepo = makeBusinessRepo({
      getBusinessActivitiesByRoute: jest.fn().mockResolvedValue(activities),
    });
    const routeRepo = makeRouteRepo({
      findAreaForRouteByUserAndDate: jest.fn().mockResolvedValue(route),
    });
    const uc = new GetBusinessActivitiesByRoute(businessRepo, routeRepo);
    const result = await uc.run(5, '2026-04-07');
    expect(result).toEqual(activities);
    expect(businessRepo.getBusinessActivitiesByRoute).toHaveBeenCalledWith(route);
  });

  it('pasa la ruta correcta al repositorio de negocios', async () => {
    const route = makeRoute();
    const businessRepo = makeBusinessRepo({
      getBusinessActivitiesByRoute: jest.fn().mockResolvedValue([]),
    });
    const routeRepo = makeRouteRepo({
      findAreaForRouteByUserAndDate: jest.fn().mockResolvedValue(route),
    });
    const uc = new GetBusinessActivitiesByRoute(businessRepo, routeRepo);
    await uc.run(5, '2026-04-07');
    expect(routeRepo.findAreaForRouteByUserAndDate).toHaveBeenCalledWith(5, '2026-04-07');
    expect(businessRepo.getBusinessActivitiesByRoute).toHaveBeenCalledWith(route);
  });
});
