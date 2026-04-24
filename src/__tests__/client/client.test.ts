import { CreateClient } from '../../application/client/CreateClient';
import { UpdateClient } from '../../application/client/UpdateClient';
import { FindByIdClient } from '../../application/client/FindByIdClient';
import { GetClients } from '../../application/client/GetClients';
import { SoftDeleteClient } from '../../application/client/SoftDeleteClient';
import { SearchClients } from '../../application/client/SearchClients';
import { Client } from '../../domain/client/Client';
import { ClientRepository, SearchClientsParams } from '../../domain/client/ClientRepository';

// ─── Mocks ───────────────────────────────────────────────────────────────────

const makeRepo = (overrides: Partial<ClientRepository> = {}): ClientRepository => ({
  create: jest.fn().mockResolvedValue(null),
  getAll: jest.fn().mockResolvedValue([]),
  findById: jest.fn().mockResolvedValue(null),
  update: jest.fn().mockResolvedValue(null),
  softDelete: jest.fn().mockResolvedValue(false),
  search: jest.fn().mockResolvedValue([]),
  ...overrides,
});

const makeClient = (overrides: Partial<Client> = {}): Client => ({
  id: 1,
  name: 'Juan',
  lastName: 'Perez',
  secondLastName: 'Lopez',
  phone: '70000000',
  ci: '12345678',
  ...overrides,
});

// ─── Client domain model ──────────────────────────────────────────────────────

describe('Client domain model', () => {
  it('crea un cliente con todos los campos', () => {
    const client = new Client('Maria', 'Garcia', 'Rios', '71234567', '87654321', 2);
    expect(client.name).toBe('Maria');
    expect(client.lastName).toBe('Garcia');
    expect(client.secondLastName).toBe('Rios');
    expect(client.phone).toBe('71234567');
    expect(client.ci).toBe('87654321');
    expect(client.id).toBe(2);
  });

  it('crea un cliente sin id ni segundo apellido', () => {
    const client = new Client('Pedro', 'Soto', null, '70001234', null);
    expect(client.id).toBeUndefined();
    expect(client.secondLastName).toBeNull();
    expect(client.ci).toBeNull();
  });
});

// ─── CreateClient ─────────────────────────────────────────────────────────────

describe('CreateClient', () => {
  it('crea un cliente correctamente', async () => {
    const client = makeClient();
    const repo = makeRepo({ create: jest.fn().mockResolvedValue(client) });
    const uc = new CreateClient(repo);
    const result = await uc.run(client, 10);
    expect(result).toEqual(client);
    expect(repo.create).toHaveBeenCalledWith(client, 10);
  });

  it('retorna null si el repo retorna null', async () => {
    const repo = makeRepo({ create: jest.fn().mockResolvedValue(null) });
    const uc = new CreateClient(repo);
    const result = await uc.run(makeClient(), null);
    expect(result).toBeNull();
  });

  it('pasa userId null correctamente', async () => {
    const repo = makeRepo({ create: jest.fn().mockResolvedValue(makeClient()) });
    const uc = new CreateClient(repo);
    await uc.run(makeClient(), null);
    expect(repo.create).toHaveBeenCalledWith(expect.any(Object), null);
  });
});

// ─── UpdateClient ─────────────────────────────────────────────────────────────

describe('UpdateClient', () => {
  it('actualiza un cliente correctamente', async () => {
    const updated = makeClient({ name: 'Carlos' });
    const repo = makeRepo({ update: jest.fn().mockResolvedValue(updated) });
    const uc = new UpdateClient(repo);
    const result = await uc.run(1, { name: 'Carlos' }, 5);
    expect(result).toEqual(updated);
    expect(repo.update).toHaveBeenCalledWith(1, { name: 'Carlos' }, 5);
  });

  it('retorna null si el cliente no existe', async () => {
    const repo = makeRepo({ update: jest.fn().mockResolvedValue(null) });
    const uc = new UpdateClient(repo);
    expect(await uc.run(999, { name: 'X' }, 1)).toBeNull();
  });

  it('puede actualizar con userId null', async () => {
    const repo = makeRepo({ update: jest.fn().mockResolvedValue(makeClient()) });
    const uc = new UpdateClient(repo);
    await uc.run(1, { phone: '79999999' }, null);
    expect(repo.update).toHaveBeenCalledWith(1, { phone: '79999999' }, null);
  });
});

// ─── FindByIdClient ───────────────────────────────────────────────────────────

describe('FindByIdClient', () => {
  it('retorna el cliente si existe', async () => {
    const client = makeClient();
    const repo = makeRepo({ findById: jest.fn().mockResolvedValue(client) });
    const uc = new FindByIdClient(repo);
    expect(await uc.run(1)).toEqual(client);
  });

  it('retorna null si no existe el cliente', async () => {
    const repo = makeRepo({ findById: jest.fn().mockResolvedValue(null) });
    const uc = new FindByIdClient(repo);
    expect(await uc.run(999)).toBeNull();
  });
});

// ─── GetClients ───────────────────────────────────────────────────────────────

describe('GetClients', () => {
  it('retorna todos los clientes', async () => {
    const clients = [makeClient(), makeClient({ id: 2, name: 'Ana' })];
    const repo = makeRepo({ getAll: jest.fn().mockResolvedValue(clients) });
    const uc = new GetClients(repo);
    const result = await uc.run();
    expect(result).toEqual(clients);
    expect(result).toHaveLength(2);
  });

  it('retorna array vacío si no hay clientes', async () => {
    const repo = makeRepo({ getAll: jest.fn().mockResolvedValue([]) });
    const uc = new GetClients(repo);
    expect(await uc.run()).toEqual([]);
  });
});

// ─── SoftDeleteClient ─────────────────────────────────────────────────────────

describe('SoftDeleteClient', () => {
  it('retorna true al eliminar correctamente', async () => {
    const repo = makeRepo({ softDelete: jest.fn().mockResolvedValue(true) });
    const uc = new SoftDeleteClient(repo);
    expect(await uc.run(1, 5)).toBe(true);
    expect(repo.softDelete).toHaveBeenCalledWith(1, 5);
  });

  it('retorna false si no se pudo eliminar', async () => {
    const repo = makeRepo({ softDelete: jest.fn().mockResolvedValue(false) });
    const uc = new SoftDeleteClient(repo);
    expect(await uc.run(999, 5)).toBe(false);
  });

  it('acepta userId null', async () => {
    const repo = makeRepo({ softDelete: jest.fn().mockResolvedValue(true) });
    const uc = new SoftDeleteClient(repo);
    await uc.run(1, null);
    expect(repo.softDelete).toHaveBeenCalledWith(1, null);
  });
});

// ─── SearchClients ────────────────────────────────────────────────────────────

describe('SearchClients', () => {
  it('busca clientes por query', async () => {
    const clients = [makeClient()];
    const repo = makeRepo({ search: jest.fn().mockResolvedValue(clients) });
    const uc = new SearchClients(repo);
    const params: SearchClientsParams = { search: 'Juan', limit: 10 };
    const result = await uc.run(params);
    expect(result).toEqual(clients);
    expect(repo.search).toHaveBeenCalledWith(params);
  });

  it('retorna array vacío si no hay coincidencias', async () => {
    const repo = makeRepo({ search: jest.fn().mockResolvedValue([]) });
    const uc = new SearchClients(repo);
    expect(await uc.run({ search: 'zzznomatches' })).toEqual([]);
  });

  it('funciona sin parámetros de búsqueda', async () => {
    const clients = [makeClient(), makeClient({ id: 2 })];
    const repo = makeRepo({ search: jest.fn().mockResolvedValue(clients) });
    const uc = new SearchClients(repo);
    const result = await uc.run({});
    expect(result).toHaveLength(2);
  });

  it('respeta el límite de resultados', async () => {
    const repo = makeRepo({ search: jest.fn().mockResolvedValue([makeClient()]) });
    const uc = new SearchClients(repo);
    const params: SearchClientsParams = { search: 'J', limit: 1 };
    await uc.run(params);
    expect(repo.search).toHaveBeenCalledWith(params);
  });
});
