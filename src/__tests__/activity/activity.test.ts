import { CreateActivity } from '../../application/activity/CreateActivity';
import { CreateActivityDetail } from '../../application/activity/CreateActivityDetail';
import { GetActivityByDateAndUserId } from '../../application/activity/GetActivityByDateAndUserId';
import { GetBusinessesActivityForPreseller } from '../../application/activity/GetBusinessesActivityForPreseller';
import { GetBusinessesActivityForDistributor } from '../../application/activity/GetBusinessesActivityForDistributor';
import { Activity, ActivityDetail } from '../../domain/activity/Activity';
import { ActivityRepository, ActivityDetailRepository } from '../../domain/activity/ActivityRepository';
import { BusinessRepository } from '../../domain/business/BusinessRepository';
import { RouteRepository } from '../../domain/route/RouteRepository';
import { PresaleRepository } from '../../domain/presale/PresaleRepository';

// ─── Mocks ───────────────────────────────────────────────────────────────────

const makeActivityRepo = (overrides: Partial<ActivityRepository> = {}): ActivityRepository => ({
  createActivity: jest.fn().mockResolvedValue(null),
  findById: jest.fn().mockResolvedValue(null),
  findActivityByDateAndUserId: jest.fn().mockResolvedValue(null),
  ...overrides,
});

const makeActivityDetailRepo = (overrides: Partial<ActivityDetailRepository> = {}): ActivityDetailRepository => ({
  createActivityDetail: jest.fn().mockResolvedValue(null),
  findByActivityId: jest.fn().mockResolvedValue([]),
  ...overrides,
});

const makeBusinessRepo = (overrides: Partial<BusinessRepository> = {}): BusinessRepository => ({
  create: jest.fn().mockResolvedValue(null),
  getAll: jest.fn().mockResolvedValue({ data: [], total: 0, page: 1, limit: 10, totalPages: 0 }),
  findById: jest.fn().mockResolvedValue(null),
  update: jest.fn().mockResolvedValue(null),
  softDelete: jest.fn().mockResolvedValue(false),
  getBusinessActivitiesByRoute: jest.fn().mockResolvedValue([]),
  getBusinessesActivityForPreseller: jest.fn().mockResolvedValue(null),
  getBusinessesActivityForDistributor: jest.fn().mockResolvedValue(null),
  getDistanceInMetersBetweenPoints: jest.fn().mockResolvedValue(null),
  ...overrides,
} as any);

const makeRouteRepo = (overrides: Partial<RouteRepository> = {}): RouteRepository => ({
  findAreaForRouteByUserAndDate: jest.fn().mockResolvedValue(null),
  ...overrides,
} as any);

const makePresaleRepo = (): Pick<any, 'findBusinessIdsByDistributorAndDate'> => ({
  findBusinessIdsByDistributorAndDate: jest.fn().mockResolvedValue([]),
});

const makeActivity = (overrides: Partial<Activity> = {}): Activity => ({
  id: 1,
  assignedDate: new Date('2026-04-07'),
  responsibleUserId: 5,
  ...overrides,
});

const makeActivityDetail = (overrides: Partial<ActivityDetail> = {}): ActivityDetail => ({
  id: 1,
  action: 'visita',
  activityId: 1,
  businessId: 10,
  rejectionId: null,
  ...overrides,
});

// ─── Activity domain model ────────────────────────────────────────────────────

describe('Activity domain model', () => {
  it('crea una actividad con todos los campos', () => {
    const activity = new Activity(new Date('2026-04-07'), 5, 1);
    expect(activity.assignedDate).toEqual(new Date('2026-04-07'));
    expect(activity.responsibleUserId).toBe(5);
    expect(activity.id).toBe(1);
  });

  it('crea actividad sin id', () => {
    const activity = new Activity(new Date(), 3);
    expect(activity.id).toBeUndefined();
  });
});

describe('ActivityDetail domain model', () => {
  it('crea un detalle de actividad', () => {
    const detail = new ActivityDetail('venta', 1, 10, null, 5);
    expect(detail.action).toBe('venta');
    expect(detail.activityId).toBe(1);
    expect(detail.businessId).toBe(10);
    expect(detail.rejectionId).toBeNull();
    expect(detail.id).toBe(5);
  });

  it('crea detalle con rechazo', () => {
    const detail = new ActivityDetail('rechazo', 2, 20, 3);
    expect(detail.rejectionId).toBe(3);
    expect(detail.id).toBeUndefined();
  });
});

// ─── CreateActivity ───────────────────────────────────────────────────────────

describe('CreateActivity', () => {
  it('crea una actividad correctamente', async () => {
    const activity = makeActivity();
    const repo = makeActivityRepo({ createActivity: jest.fn().mockResolvedValue(activity) });
    const uc = new CreateActivity(repo);
    const result = await uc.run(activity, 5);
    expect(result).toEqual(activity);
    expect(repo.createActivity).toHaveBeenCalledWith(activity, 5);
  });

  it('retorna null si el repo retorna null', async () => {
    const repo = makeActivityRepo({ createActivity: jest.fn().mockResolvedValue(null) });
    const uc = new CreateActivity(repo);
    expect(await uc.run(makeActivity(), 5)).toBeNull();
  });

  it('acepta userId null', async () => {
    const activity = makeActivity();
    const repo = makeActivityRepo({ createActivity: jest.fn().mockResolvedValue(activity) });
    const uc = new CreateActivity(repo);
    await uc.run(activity, null);
    expect(repo.createActivity).toHaveBeenCalledWith(activity, null);
  });
});

// ─── CreateActivityDetail ─────────────────────────────────────────────────────

describe('CreateActivityDetail', () => {
  it('crea un detalle de actividad correctamente', async () => {
    const detail = makeActivityDetail();
    const repo = makeActivityDetailRepo({ createActivityDetail: jest.fn().mockResolvedValue(detail) });
    const uc = new CreateActivityDetail(repo);
    const result = await uc.run(detail, 1);
    expect(result).toEqual(detail);
    expect(repo.createActivityDetail).toHaveBeenCalledWith(detail, 1);
  });

  it('lanza error si activityId es 0', async () => {
    const repo = makeActivityDetailRepo();
    const uc = new CreateActivityDetail(repo);
    await expect(uc.run(makeActivityDetail(), 0)).rejects.toThrow('id de la actividad');
  });

  it('lanza error si activityId es falsy', async () => {
    const repo = makeActivityDetailRepo();
    const uc = new CreateActivityDetail(repo);
    await expect(uc.run(makeActivityDetail(), null as any)).rejects.toThrow('id de la actividad');
  });

  it('retorna null si el repo retorna null', async () => {
    const repo = makeActivityDetailRepo({ createActivityDetail: jest.fn().mockResolvedValue(null) });
    const uc = new CreateActivityDetail(repo);
    expect(await uc.run(makeActivityDetail(), 1)).toBeNull();
  });
});

// ─── GetActivityByDateAndUserId ───────────────────────────────────────────────

describe('GetActivityByDateAndUserId', () => {
  it('retorna la actividad si existe', async () => {
    const activity = makeActivity();
    const repo = makeActivityRepo({ findActivityByDateAndUserId: jest.fn().mockResolvedValue(activity) });
    const uc = new GetActivityByDateAndUserId(repo);
    const result = await uc.run('2026-04-07', 5);
    expect(result).toEqual(activity);
    expect(repo.findActivityByDateAndUserId).toHaveBeenCalledWith(5, '2026-04-07');
  });

  it('retorna null si no hay actividad para esa fecha y usuario', async () => {
    const repo = makeActivityRepo({ findActivityByDateAndUserId: jest.fn().mockResolvedValue(null) });
    const uc = new GetActivityByDateAndUserId(repo);
    expect(await uc.run('2026-04-07', 5)).toBeNull();
  });

  it('lanza error si date está vacío', async () => {
    const repo = makeActivityRepo();
    const uc = new GetActivityByDateAndUserId(repo);
    await expect(uc.run('', 5)).rejects.toThrow('fecha');
  });

  it('lanza error si userId es 0', async () => {
    const repo = makeActivityRepo();
    const uc = new GetActivityByDateAndUserId(repo);
    await expect(uc.run('2026-04-07', 0)).rejects.toThrow('id del usuario');
  });

  it('lanza error si date y userId son falsy', async () => {
    const repo = makeActivityRepo();
    const uc = new GetActivityByDateAndUserId(repo);
    await expect(uc.run('', 0)).rejects.toThrow();
  });
});

// ─── GetBusinessesActivityForPreseller ───────────────────────────────────────

describe('GetBusinessesActivityForPreseller', () => {
  it('retorna null si no hay ruta asignada al prevendedor', async () => {
    const activityRepo = makeActivityRepo();
    const businessRepo = makeBusinessRepo();
    const routeRepo = makeRouteRepo({ findAreaForRouteByUserAndDate: jest.fn().mockResolvedValue(null) });
    const uc = new GetBusinessesActivityForPreseller(activityRepo, businessRepo, routeRepo);
    const result = await uc.run(5, '2026-04-07');
    expect(result).toBeNull();
    expect(businessRepo.getBusinessesActivityForPreseller).not.toHaveBeenCalled();
  });

  it('retorna actividad del prevendedor si hay ruta', async () => {
    const route = { id: 1, areaId: 2, userId: 5, date: '2026-04-07' };
    const activity = makeActivity();
    const activityResult = { route, activity, businesses: [] };

    const activityRepo = makeActivityRepo({ findActivityByDateAndUserId: jest.fn().mockResolvedValue(activity) });
    const businessRepo = makeBusinessRepo({
      getBusinessesActivityForPreseller: jest.fn().mockResolvedValue(activityResult),
    });
    const routeRepo = makeRouteRepo({ findAreaForRouteByUserAndDate: jest.fn().mockResolvedValue(route) });
    const uc = new GetBusinessesActivityForPreseller(activityRepo, businessRepo, routeRepo);
    const result = await uc.run(5, '2026-04-07');
    expect(result).toEqual(activityResult);
    expect(businessRepo.getBusinessesActivityForPreseller).toHaveBeenCalledWith(route, activity);
  });

  it('funciona aunque no haya actividad previa (activity = null)', async () => {
    const route = { id: 1, areaId: 2 };
    const activityRepo = makeActivityRepo({ findActivityByDateAndUserId: jest.fn().mockResolvedValue(null) });
    const businessRepo = makeBusinessRepo({
      getBusinessesActivityForPreseller: jest.fn().mockResolvedValue({ route, activity: null, businesses: [] }),
    });
    const routeRepo = makeRouteRepo({ findAreaForRouteByUserAndDate: jest.fn().mockResolvedValue(route) });
    const uc = new GetBusinessesActivityForPreseller(activityRepo, businessRepo, routeRepo);
    const result = await uc.run(5, '2026-04-07');
    expect(businessRepo.getBusinessesActivityForPreseller).toHaveBeenCalledWith(route, null);
    expect(result).not.toBeNull();
  });
});

// ─── GetBusinessesActivityForDistributor ──────────────────────────────────────

describe('GetBusinessesActivityForDistributor', () => {
  it('retorna null si no hay negocios asignados al distribuidor', async () => {
    const activityRepo = makeActivityRepo();
    const businessRepo = makeBusinessRepo();
    const presaleRepo = { findBusinessIdsByDistributorAndDate: jest.fn().mockResolvedValue([]) };
    const uc = new GetBusinessesActivityForDistributor(activityRepo, businessRepo, presaleRepo as any);
    const result = await uc.run(3, '2026-04-07');
    expect(result).toBeNull();
    expect(businessRepo.getBusinessesActivityForDistributor).not.toHaveBeenCalled();
  });

  it('retorna actividad del distribuidor si hay negocios', async () => {
    const businessIds = [10, 11, 12];
    const activity = makeActivity({ responsibleUserId: 3 });
    const activityResult = { businessIds, activity, businesses: [] };

    const activityRepo = makeActivityRepo({ findActivityByDateAndUserId: jest.fn().mockResolvedValue(activity) });
    const businessRepo = makeBusinessRepo({
      getBusinessesActivityForDistributor: jest.fn().mockResolvedValue(activityResult),
    });
    const presaleRepo = { findBusinessIdsByDistributorAndDate: jest.fn().mockResolvedValue(businessIds) };
    const uc = new GetBusinessesActivityForDistributor(activityRepo, businessRepo, presaleRepo as any);
    const result = await uc.run(3, '2026-04-07');
    expect(result).toEqual(activityResult);
    expect(businessRepo.getBusinessesActivityForDistributor).toHaveBeenCalledWith(businessIds, activity);
  });

  it('funciona sin actividad previa registrada', async () => {
    const businessIds = [5];
    const activityRepo = makeActivityRepo({ findActivityByDateAndUserId: jest.fn().mockResolvedValue(null) });
    const businessRepo = makeBusinessRepo({
      getBusinessesActivityForDistributor: jest.fn().mockResolvedValue({ businesses: [], activity: null }),
    });
    const presaleRepo = { findBusinessIdsByDistributorAndDate: jest.fn().mockResolvedValue(businessIds) };
    const uc = new GetBusinessesActivityForDistributor(activityRepo, businessRepo, presaleRepo as any);
    await uc.run(3, '2026-04-07');
    expect(businessRepo.getBusinessesActivityForDistributor).toHaveBeenCalledWith(businessIds, null);
  });
});
