import { CreateArea } from '../../application/area/CreateArea';
import { UpdateArea } from '../../application/area/UpdateArea';
import { GetAreas } from '../../application/area/GetAreas';
import { FindByIdArea } from '../../application/area/FindByIdArea';
import { SoftDeleteArea } from '../../application/area/SoftDeleteArea';
import { Area } from '../../domain/area/Area';
import { AreaRepository } from '../../domain/area/AreaRepository';
import { Position } from '../../domain/customs/Position';

// ─── Mocks ───────────────────────────────────────────────────────────────────

const makeRepo = (overrides: Partial<AreaRepository> = {}): AreaRepository => ({
  create: jest.fn().mockResolvedValue(null),
  getAll: jest.fn().mockResolvedValue([]),
  findById: jest.fn().mockResolvedValue(null),
  update: jest.fn().mockResolvedValue(null),
  softDelete: jest.fn().mockResolvedValue(false),
  ...overrides,
});

const makePositions = (): Position[] => [
  { lat: -17.393, lng: -66.157 },
  { lat: -17.394, lng: -66.158 },
  { lat: -17.395, lng: -66.157 },
];

const makeArea = (overrides: Partial<Area> = {}): Area => ({
  id: 1,
  name: 'Zona Norte',
  area: makePositions(),
  ...overrides,
});

// ─── Area domain model ────────────────────────────────────────────────────────

describe('Area domain model', () => {
  it('crea una zona con id', () => {
    const area = new Area('Zona Sur', makePositions(), 2);
    expect(area.name).toBe('Zona Sur');
    expect(area.area).toHaveLength(3);
    expect(area.id).toBe(2);
  });

  it('crea una zona sin id', () => {
    const area = new Area('Zona Este', makePositions());
    expect(area.id).toBeUndefined();
  });

  it('almacena correctamente las posiciones geográficas', () => {
    const positions: Position[] = [
      { lat: -17.39, lng: -66.15 },
      { lat: -17.40, lng: -66.16 },
    ];
    const area = new Area('Test', positions);
    expect(area.area[0].lat).toBe(-17.39);
    expect(area.area[1].lng).toBe(-66.16);
  });
});

// ─── CreateArea ───────────────────────────────────────────────────────────────

describe('CreateArea', () => {
  it('crea una zona correctamente', async () => {
    const area = makeArea();
    const repo = makeRepo({ create: jest.fn().mockResolvedValue(area) });
    const uc = new CreateArea(repo);
    const result = await uc.run(area, 1);
    expect(result).toEqual(area);
    expect(repo.create).toHaveBeenCalledWith(area, 1);
  });

  it('retorna null si el repo retorna null', async () => {
    const repo = makeRepo({ create: jest.fn().mockResolvedValue(null) });
    const uc = new CreateArea(repo);
    expect(await uc.run(makeArea(), 1)).toBeNull();
  });

  it('acepta userId null', async () => {
    const area = makeArea();
    const repo = makeRepo({ create: jest.fn().mockResolvedValue(area) });
    const uc = new CreateArea(repo);
    await uc.run(area, null);
    expect(repo.create).toHaveBeenCalledWith(area, null);
  });
});

// ─── UpdateArea ───────────────────────────────────────────────────────────────

describe('UpdateArea', () => {
  it('actualiza una zona correctamente', async () => {
    const updated = makeArea({ name: 'Zona Sur Actualizada' });
    const repo = makeRepo({ update: jest.fn().mockResolvedValue(updated) });
    const uc = new UpdateArea(repo);
    const result = await uc.run(1, { name: 'Zona Sur Actualizada' }, 5);
    expect(result).toEqual(updated);
    expect(repo.update).toHaveBeenCalledWith(1, { name: 'Zona Sur Actualizada' }, 5);
  });

  it('retorna null si la zona no existe', async () => {
    const repo = makeRepo({ update: jest.fn().mockResolvedValue(null) });
    const uc = new UpdateArea(repo);
    expect(await uc.run(999, { name: 'X' }, 1)).toBeNull();
  });

  it('puede actualizar las posiciones geográficas', async () => {
    const newPositions = [{ lat: -17.5, lng: -66.2 }];
    const updated = makeArea({ area: newPositions });
    const repo = makeRepo({ update: jest.fn().mockResolvedValue(updated) });
    const uc = new UpdateArea(repo);
    const result = await uc.run(1, { area: newPositions }, 1);
    expect(result?.area).toEqual(newPositions);
  });

  it('acepta userId null', async () => {
    const repo = makeRepo({ update: jest.fn().mockResolvedValue(makeArea()) });
    const uc = new UpdateArea(repo);
    await uc.run(1, { name: 'Test' }, null);
    expect(repo.update).toHaveBeenCalledWith(1, { name: 'Test' }, null);
  });
});

// ─── GetAreas ─────────────────────────────────────────────────────────────────

describe('GetAreas', () => {
  it('retorna todas las zonas', async () => {
    const areas = [makeArea(), makeArea({ id: 2, name: 'Zona Sur' })];
    const repo = makeRepo({ getAll: jest.fn().mockResolvedValue(areas) });
    const uc = new GetAreas(repo);
    const result = await uc.run();
    expect(result).toEqual(areas);
    expect(result).toHaveLength(2);
  });

  it('retorna array vacío si no hay zonas', async () => {
    const repo = makeRepo({ getAll: jest.fn().mockResolvedValue([]) });
    const uc = new GetAreas(repo);
    expect(await uc.run()).toEqual([]);
  });
});

// ─── FindByIdArea ─────────────────────────────────────────────────────────────

describe('FindByIdArea', () => {
  it('retorna la zona si existe', async () => {
    const area = makeArea();
    const repo = makeRepo({ findById: jest.fn().mockResolvedValue(area) });
    const uc = new FindByIdArea(repo);
    expect(await uc.run(1)).toEqual(area);
  });

  it('retorna null si la zona no existe', async () => {
    const repo = makeRepo({ findById: jest.fn().mockResolvedValue(null) });
    const uc = new FindByIdArea(repo);
    expect(await uc.run(999)).toBeNull();
  });
});

// ─── SoftDeleteArea ───────────────────────────────────────────────────────────

describe('SoftDeleteArea', () => {
  it('retorna true al eliminar correctamente', async () => {
    const repo = makeRepo({ softDelete: jest.fn().mockResolvedValue(true) });
    const uc = new SoftDeleteArea(repo);
    expect(await uc.run(1)).toBe(true);
    expect(repo.softDelete).toHaveBeenCalledWith(1);
  });

  it('retorna false si no se pudo eliminar', async () => {
    const repo = makeRepo({ softDelete: jest.fn().mockResolvedValue(false) });
    const uc = new SoftDeleteArea(repo);
    expect(await uc.run(999)).toBe(false);
  });
});
