import { Login } from '../../application/auth/Login';
import { UserRepository } from '../../domain/user/UserRepository';
import { AuthService } from '../../domain/auth/AuthService';
import { CreateRoute } from '../../application/route/CreateRoute';
import { GetRoutes } from '../../application/route/GetRoutes';
import { FindByIdRoute } from '../../application/route/FindByIdRoute';
import { FindAreaForRouteByUserAndDate } from '../../application/route/FindClientsByRouteAndDate';
import { GetPresaleHistory } from '../../application/presale/GetPresaleHistory';
import { GetPresaleReport } from '../../application/presale/GetPresaleReport';
import { Route } from '../../domain/route/Route';
import { RouteRepository } from '../../domain/route/RouteRepository';
import { PresaleRepository } from '../../domain/presale/PresaleRepository';
import { User } from '../../domain/user/User';

// ─── Shared helpers ───────────────────────────────────────────────────────────

const makeUser = (overrides: Partial<User> = {}): User => ({
  id: 1,
  ci: '12345678',
  names: 'Juan',
  lastName: 'Perez',
  secondLastName: 'Lopez',
  email: 'juan@test.com',
  role: 'prevendedor',
  branchId: 1,
  userName: 'PL12345678',
  isFirstLogin: false,
  ...overrides,
});

const makeUserRepo = (overrides: Partial<UserRepository> = {}): UserRepository => ({
  getUsers: jest.fn().mockResolvedValue([]),
  create: jest.fn().mockResolvedValue(null),
  findById: jest.fn().mockResolvedValue(null),
  findByCi: jest.fn().mockResolvedValue(null),
  findByEmail: jest.fn().mockResolvedValue(null),
  update: jest.fn().mockResolvedValue(null),
  updateState: jest.fn().mockResolvedValue(undefined),
  updatePassword: jest.fn().mockResolvedValue(null),
  resetPassword: jest.fn().mockResolvedValue(null),
  setFirstLoginComplete: jest.fn().mockResolvedValue(true),
  findByUserName: jest.fn().mockResolvedValue(null),
  ...overrides,
});

const makeAuthService = (overrides: Partial<AuthService> = {}): AuthService => ({
  sign: jest.fn().mockReturnValue({ token: 'mock.jwt.token' }),
  verify: jest.fn().mockReturnValue({}),
  ...overrides,
});

const makeRouteRepo = (overrides: Partial<RouteRepository> = {}): RouteRepository => ({
  create: jest.fn().mockResolvedValue(null),
  findById: jest.fn().mockResolvedValue(null),
  findAreaForRouteByUserAndDate: jest.fn().mockResolvedValue(null),
  getRoutes: jest.fn().mockResolvedValue([]),
  ...overrides,
});

const makePresaleRepo = (overrides: Partial<PresaleRepository> = {}): PresaleRepository => ({
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

// ═════════════════════════════════════════════════════════════════════════════
// AUTH MODULE
// ═════════════════════════════════════════════════════════════════════════════

describe('Login', () => {
  const makeAuthRecord = (passwordHash: string) => ({
    passwordHash,
    state: true,
    user: makeUser(),
  });

  it('retorna null si userName está vacío', async () => {
    const uc = new Login(makeUserRepo(), makeAuthService());
    expect(await uc.run('', 'pass')).toBeNull();
  });

  it('retorna null si password está vacío', async () => {
    const uc = new Login(makeUserRepo(), makeAuthService());
    expect(await uc.run('usuario', '')).toBeNull();
  });

  it('retorna null si el usuario no existe', async () => {
    const repo = makeUserRepo({ findByUserName: jest.fn().mockResolvedValue(null) });
    const uc = new Login(repo, makeAuthService());
    expect(await uc.run('noexiste', 'pass')).toBeNull();
  });

  it('retorna null si el usuario está inactivo', async () => {
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash('pass123', 10);
    const record = { ...makeAuthRecord(hash), state: false };
    const repo = makeUserRepo({ findByUserName: jest.fn().mockResolvedValue(record) });
    const uc = new Login(repo, makeAuthService());
    expect(await uc.run('usuario', 'pass123')).toBeNull();
  });

  it('retorna null si la contraseña es incorrecta', async () => {
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash('correctPass', 10);
    const record = makeAuthRecord(hash);
    const repo = makeUserRepo({ findByUserName: jest.fn().mockResolvedValue(record) });
    const uc = new Login(repo, makeAuthService());
    expect(await uc.run('usuario', 'wrongPass')).toBeNull();
  });

  it('retorna token y usuario en login exitoso', async () => {
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash('correctPass', 10);
    const record = makeAuthRecord(hash);
    const repo = makeUserRepo({ findByUserName: jest.fn().mockResolvedValue(record) });
    const authService = makeAuthService({ sign: jest.fn().mockReturnValue({ token: 'jwt.abc.def' }) });
    const uc = new Login(repo, authService);
    const result = await uc.run('usuario', 'correctPass');
    expect(result).not.toBeNull();
    expect(result!.token).toEqual({ token: 'jwt.abc.def' });
    expect(result!.user).toEqual(record.user);
  });

  it('firma el token con userId y role del usuario', async () => {
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash('pass', 10);
    const user = makeUser({ id: 42, role: 'administrador' });
    const record = { passwordHash: hash, state: true, user };
    const repo = makeUserRepo({ findByUserName: jest.fn().mockResolvedValue(record) });
    const authService = makeAuthService();
    const uc = new Login(repo, authService);
    await uc.run('admin', 'pass');
    expect(authService.sign).toHaveBeenCalledWith({ userId: 42, role: 'administrador' });
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// ROUTE / DISTRIBUCIÓN MODULE
// ═════════════════════════════════════════════════════════════════════════════

describe('Route domain model', () => {
  it('crea una ruta con todos los campos', () => {
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

describe('CreateRoute', () => {
  it('crea una ruta correctamente', async () => {
    const route = new Route('2026-04-07', 5, 2, 1);
    const repo = makeRouteRepo({ create: jest.fn().mockResolvedValue(route) });
    const uc = new CreateRoute(repo);
    const result = await uc.run(route, 10);
    expect(result).toEqual(route);
    expect(repo.create).toHaveBeenCalledWith(route, 10);
  });

  it('retorna null si el repo retorna null', async () => {
    const repo = makeRouteRepo({ create: jest.fn().mockResolvedValue(null) });
    const uc = new CreateRoute(repo);
    expect(await uc.run(new Route('2026-04-07', 5, 2), null)).toBeNull();
  });

  it('acepta auditUserId null', async () => {
    const route = new Route('2026-04-07', 5, 2);
    const repo = makeRouteRepo({ create: jest.fn().mockResolvedValue(route) });
    const uc = new CreateRoute(repo);
    await uc.run(route, null);
    expect(repo.create).toHaveBeenCalledWith(route, null);
  });
});

describe('GetRoutes', () => {
  it('retorna todas las rutas', async () => {
    const routes = [new Route('2026-04-07', 5, 2, 1), new Route('2026-04-08', 6, 3, 2)];
    const repo = makeRouteRepo({ getRoutes: jest.fn().mockResolvedValue(routes) });
    const uc = new GetRoutes(repo);
    const result = await uc.run();
    expect(result).toEqual(routes);
    expect(result).toHaveLength(2);
  });

  it('retorna null si no hay rutas configuradas', async () => {
    const repo = makeRouteRepo({ getRoutes: jest.fn().mockResolvedValue(null) });
    const uc = new GetRoutes(repo);
    expect(await uc.run()).toBeNull();
  });
});

describe('FindByIdRoute', () => {
  it('retorna la ruta si existe', async () => {
    const route = new Route('2026-04-07', 5, 2, 1);
    const repo = makeRouteRepo({ findById: jest.fn().mockResolvedValue(route) });
    const uc = new FindByIdRoute(repo);
    expect(await uc.run(1)).toEqual(route);
  });

  it('retorna null si la ruta no existe', async () => {
    const repo = makeRouteRepo({ findById: jest.fn().mockResolvedValue(null) });
    const uc = new FindByIdRoute(repo);
    expect(await uc.run(999)).toBeNull();
  });
});

describe('FindAreaForRouteByUserAndDate', () => {
  it('retorna la ruta para un usuario y fecha dados', async () => {
    const route = new Route('2026-04-07', 5, 2, 1);
    const repo = makeRouteRepo({ findAreaForRouteByUserAndDate: jest.fn().mockResolvedValue(route) });
    const uc = new FindAreaForRouteByUserAndDate(repo);
    const result = await uc.run(5, '2026-04-07');
    expect(result).toEqual(route);
    expect(repo.findAreaForRouteByUserAndDate).toHaveBeenCalledWith(5, '2026-04-07');
  });

  it('retorna null si no hay ruta asignada', async () => {
    const repo = makeRouteRepo({ findAreaForRouteByUserAndDate: jest.fn().mockResolvedValue(null) });
    const uc = new FindAreaForRouteByUserAndDate(repo);
    expect(await uc.run(99, '2026-04-07')).toBeNull();
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// PRESALE HISTORY & REPORT
// ═════════════════════════════════════════════════════════════════════════════

describe('GetPresaleHistory', () => {
  it('retorna el historial de estados de una preventa', async () => {
    const history = [
      { id: 1, presaleId: 1, previousStatus: null, newStatus: 'pendiente' as const, notes: null, userId: 10 },
      { id: 2, presaleId: 1, previousStatus: 'pendiente' as const, newStatus: 'asignado' as const, notes: null, userId: 10 },
    ];
    const repo = makePresaleRepo({ getStatusHistory: jest.fn().mockResolvedValue(history) });
    const uc = new GetPresaleHistory(repo);
    const result = await uc.run(1);
    expect(result).toEqual(history);
    expect(result).toHaveLength(2);
  });

  it('lanza error si presaleId es 0', async () => {
    const repo = makePresaleRepo();
    const uc = new GetPresaleHistory(repo);
    await expect(uc.run(0)).rejects.toThrow('ID de la preventa es obligatorio');
  });

  it('retorna array vacío si no hay historial', async () => {
    const repo = makePresaleRepo({ getStatusHistory: jest.fn().mockResolvedValue([]) });
    const uc = new GetPresaleHistory(repo);
    expect(await uc.run(1)).toEqual([]);
  });
});

describe('GetPresaleReport', () => {
  it('retorna reporte con filtros vacíos', async () => {
    const reportResult = { data: [], total: 0, page: 1, limit: 10, totalPages: 0 };
    const repo = makePresaleRepo({ getReport: jest.fn().mockResolvedValue(reportResult) });
    const uc = new GetPresaleReport(repo);
    const result = await uc.run({});
    expect(result).toEqual(reportResult);
    expect(repo.getReport).toHaveBeenCalledWith({});
  });

  it('filtra por userId', async () => {
    const repo = makePresaleRepo({ getReport: jest.fn().mockResolvedValue({ data: [], total: 0, page: 1, limit: 10, totalPages: 0 }) });
    const uc = new GetPresaleReport(repo);
    await uc.run({ userId: 5 });
    expect(repo.getReport).toHaveBeenCalledWith({ userId: 5 });
  });

  it('filtra por rango de fechas', async () => {
    const repo = makePresaleRepo({ getReport: jest.fn().mockResolvedValue({ data: [], total: 0, page: 1, limit: 10, totalPages: 0 }) });
    const uc = new GetPresaleReport(repo);
    await uc.run({ dateFrom: '2026-04-01', dateTo: '2026-04-30' });
    expect(repo.getReport).toHaveBeenCalledWith({ dateFrom: '2026-04-01', dateTo: '2026-04-30' });
  });

  it('aplica paginación', async () => {
    const repo = makePresaleRepo({ getReport: jest.fn().mockResolvedValue({ data: [], total: 0, page: 2, limit: 5, totalPages: 0 }) });
    const uc = new GetPresaleReport(repo);
    await uc.run({ page: 2, limit: 5 });
    expect(repo.getReport).toHaveBeenCalledWith({ page: 2, limit: 5 });
  });
});
