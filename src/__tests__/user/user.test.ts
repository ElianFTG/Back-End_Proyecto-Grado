import { CreateUser } from '../../application/user/CreateUser';
import { UpdateUser } from '../../application/user/UpdateUser';
import { GetUsers } from '../../application/user/GetUsers';
import { FindByIdUser } from '../../application/user/FindByIdUser';
import { FindByCiUser } from '../../application/user/FindByCiUser';
import { UpdateStateUser } from '../../application/user/UpdateStateUser';
import { UpdatePasswordUser } from '../../application/user/UpdatePasswordUser';
import { ResetPasswordUser } from '../../application/user/ResetPasswordUser';
import { ChangeFirstLoginPassword } from '../../application/user/ChangeFirstLoginPassword';
import { User } from '../../domain/user/User';
import { UserRepository } from '../../domain/user/UserRepository';
import {
  canCreateRole,
  canEditRole,
  canDeleteRole,
  canManageUsers,
  getCreatableRoles,
  getManageableRoles,
  InsufficientPermissionsError,
  ROLES,
} from '../../domain/user/RolePermissions';
import { UserNotFound } from '../../domain/errors/user/UserNotFound';

// ─── Mocks ───────────────────────────────────────────────────────────────────

const makeRepo = (overrides: Partial<UserRepository> = {}): UserRepository => ({
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

const makeUser = (overrides: Partial<User> = {}): User => ({
  id: 1,
  ci: '12345678',
  names: 'Juan',
  lastName: 'Perez',
  secondLastName: 'Lopez',
  email: 'juan@example.com',
  role: 'prevendedor',
  branchId: 1,
  userName: 'PL12345678',
  isFirstLogin: false,
  ...overrides,
});

const makeAuthRecord = (overrides: any = {}) => ({
  passwordHash: '$2a$10$hashedpassword',
  state: true,
  user: makeUser(),
  ...overrides,
});

// ─── RolePermissions ─────────────────────────────────────────────────────────

describe('RolePermissions', () => {
  describe('canCreateRole', () => {
    it('gerente puede crear administrador', () => {
      expect(canCreateRole(ROLES.GERENTE, ROLES.ADMINISTRADOR)).toBe(true);
    });
    it('gerente puede crear prevendedor', () => {
      expect(canCreateRole(ROLES.GERENTE, ROLES.PREVENDEDOR)).toBe(true);
    });
    it('gerente puede crear transportista', () => {
      expect(canCreateRole(ROLES.GERENTE, ROLES.TRANSPORTISTA)).toBe(true);
    });
    it('administrador puede crear prevendedor', () => {
      expect(canCreateRole(ROLES.ADMINISTRADOR, ROLES.PREVENDEDOR)).toBe(true);
    });
    it('administrador puede crear transportista', () => {
      expect(canCreateRole(ROLES.ADMINISTRADOR, ROLES.TRANSPORTISTA)).toBe(true);
    });
    it('administrador NO puede crear administrador', () => {
      expect(canCreateRole(ROLES.ADMINISTRADOR, ROLES.ADMINISTRADOR)).toBe(false);
    });
    it('prevendedor NO puede crear ningún rol', () => {
      expect(canCreateRole(ROLES.PREVENDEDOR, ROLES.TRANSPORTISTA)).toBe(false);
    });
    it('transportista NO puede crear ningún rol', () => {
      expect(canCreateRole(ROLES.TRANSPORTISTA, ROLES.PREVENDEDOR)).toBe(false);
    });
    it('rol desconocido retorna false', () => {
      expect(canCreateRole('desconocido', ROLES.PREVENDEDOR)).toBe(false);
    });
  });

  describe('canEditRole', () => {
    it('gerente puede editar administrador', () => {
      expect(canEditRole(ROLES.GERENTE, ROLES.ADMINISTRADOR)).toBe(true);
    });
    it('administrador puede editar prevendedor', () => {
      expect(canEditRole(ROLES.ADMINISTRADOR, ROLES.PREVENDEDOR)).toBe(true);
    });
    it('prevendedor NO puede editar transportista', () => {
      expect(canEditRole(ROLES.PREVENDEDOR, ROLES.TRANSPORTISTA)).toBe(false);
    });
  });

  describe('canDeleteRole', () => {
    it('gerente puede eliminar transportista', () => {
      expect(canDeleteRole(ROLES.GERENTE, ROLES.TRANSPORTISTA)).toBe(true);
    });
    it('prevendedor NO puede eliminar nadie', () => {
      expect(canDeleteRole(ROLES.PREVENDEDOR, ROLES.TRANSPORTISTA)).toBe(false);
    });
  });

  describe('canManageUsers', () => {
    it('gerente puede gestionar usuarios', () => {
      expect(canManageUsers(ROLES.GERENTE)).toBe(true);
    });
    it('administrador puede gestionar usuarios', () => {
      expect(canManageUsers(ROLES.ADMINISTRADOR)).toBe(true);
    });
    it('prevendedor NO puede gestionar usuarios', () => {
      expect(canManageUsers(ROLES.PREVENDEDOR)).toBe(false);
    });
    it('transportista NO puede gestionar usuarios', () => {
      expect(canManageUsers(ROLES.TRANSPORTISTA)).toBe(false);
    });
  });

  describe('getCreatableRoles', () => {
    it('gerente puede crear 3 roles', () => {
      expect(getCreatableRoles(ROLES.GERENTE)).toHaveLength(3);
    });
    it('prevendedor no puede crear ningún rol', () => {
      expect(getCreatableRoles(ROLES.PREVENDEDOR)).toHaveLength(0);
    });
  });

  describe('getManageableRoles', () => {
    it('administrador puede gestionar 2 roles', () => {
      expect(getManageableRoles(ROLES.ADMINISTRADOR)).toHaveLength(2);
    });
  });

  describe('InsufficientPermissionsError', () => {
    it('extiende Error con mensaje personalizado', () => {
      const err = new InsufficientPermissionsError('Sin acceso');
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('Sin acceso');
      expect(err.name).toBe('InsufficientPermissionsError');
    });
    it('usa mensaje por defecto', () => {
      const err = new InsufficientPermissionsError();
      expect(err.message).toBe('No tienes permisos para realizar esta acción');
    });
  });
});

// ─── GetUsers ─────────────────────────────────────────────────────────────────

describe('GetUsers', () => {
  it('retorna lista de usuarios', async () => {
    const users = [makeUser(), makeUser({ id: 2 })];
    const repo = makeRepo({ getUsers: jest.fn().mockResolvedValue(users) });
    const uc = new GetUsers(repo);
    const result = await uc.run();
    expect(result).toEqual(users);
    expect(repo.getUsers).toHaveBeenCalledTimes(1);
  });

  it('retorna lista vacía si no hay usuarios', async () => {
    const repo = makeRepo({ getUsers: jest.fn().mockResolvedValue([]) });
    const uc = new GetUsers(repo);
    expect(await uc.run()).toEqual([]);
  });
});

// ─── FindByIdUser ─────────────────────────────────────────────────────────────

describe('FindByIdUser', () => {
  it('retorna el usuario si existe', async () => {
    const user = makeUser();
    const repo = makeRepo({ findById: jest.fn().mockResolvedValue(user) });
    const uc = new FindByIdUser(repo);
    expect(await uc.run(1)).toEqual(user);
  });

  it('lanza UserNotFound si no existe', async () => {
    const repo = makeRepo({ findById: jest.fn().mockResolvedValue(null) });
    const uc = new FindByIdUser(repo);
    await expect(uc.run(999)).rejects.toThrow(UserNotFound);
  });
});

// ─── FindByCiUser ─────────────────────────────────────────────────────────────

describe('FindByCiUser', () => {
  it('retorna el usuario si existe', async () => {
    const user = makeUser();
    const repo = makeRepo({ findByCi: jest.fn().mockResolvedValue(user) });
    const uc = new FindByCiUser(repo);
    expect(await uc.run('12345678')).toEqual(user);
  });

  it('lanza UserNotFound si no existe', async () => {
    const repo = makeRepo({ findByCi: jest.fn().mockResolvedValue(null) });
    const uc = new FindByCiUser(repo);
    await expect(uc.run('00000000')).rejects.toThrow(UserNotFound);
  });
});

// ─── CreateUser ───────────────────────────────────────────────────────────────

describe('CreateUser', () => {
  it('crea usuario correctamente sin actorRole', async () => {
    const user = makeUser();
    const repo = makeRepo({
      create: jest.fn().mockResolvedValue(user),
      findByUserName: jest.fn().mockResolvedValue(null),
    });
    const uc = new CreateUser(repo);
    const result = await uc.run('12345678', 'Juan', 'Perez', 'Lopez', 'prevendedor', 1, 'juan@test.com', 10);
    expect(result).toEqual(user);
    expect(repo.create).toHaveBeenCalledTimes(1);
  });

  it('lanza InsufficientPermissionsError si el actor no puede crear el rol', async () => {
    const repo = makeRepo();
    const uc = new CreateUser(repo);
    await expect(
      uc.run('123', 'Pedro', 'Garcia', 'Rios', 'administrador', 1, '', 5, 'administrador')
    ).rejects.toThrow(InsufficientPermissionsError);
  });

  it('genera username único si ya existe uno igual (agrega sufijo)', async () => {
    const existingAuth = makeAuthRecord();
    const newUser = makeUser({ userName: 'PL123456781' });
    const repo = makeRepo({
      create: jest.fn().mockResolvedValue(newUser),
      findByUserName: jest
        .fn()
        .mockResolvedValueOnce(existingAuth)
        .mockResolvedValueOnce(null),
    });
    const uc = new CreateUser(repo);
    const result = await uc.run('123456', 'Juan', 'Perez', 'Lopez', 'prevendedor', 1, '', 1, 'gerente');
    expect(result).toEqual(newUser);
    expect(repo.findByUserName).toHaveBeenCalledTimes(2);
  });

  it('envía credenciales por correo si hay emailService', async () => {
    const user = makeUser({ email: 'test@test.com' });
    const repo = makeRepo({
      create: jest.fn().mockResolvedValue(user),
      findByUserName: jest.fn().mockResolvedValue(null),
    });
    const emailService = { sendCredentials: jest.fn().mockResolvedValue(undefined) };
    const uc = new CreateUser(repo, emailService as any);
    await uc.run('99', 'Maria', 'Rios', 'Soto', 'prevendedor', 2, 'test@test.com', 1);
    expect(emailService.sendCredentials).toHaveBeenCalledTimes(1);
  });

  it('no falla si el envío de correo falla', async () => {
    const user = makeUser({ email: 'test@test.com' });
    const repo = makeRepo({
      create: jest.fn().mockResolvedValue(user),
      findByUserName: jest.fn().mockResolvedValue(null),
    });
    const emailService = { sendCredentials: jest.fn().mockRejectedValue(new Error('SMTP error')) };
    const uc = new CreateUser(repo, emailService as any);
    await expect(
      uc.run('99', 'Maria', 'Rios', 'Soto', 'prevendedor', 2, 'test@test.com', 1)
    ).resolves.toEqual(user);
  });
});

// ─── UpdateUser ───────────────────────────────────────────────────────────────

describe('UpdateUser', () => {
  it('actualiza usuario correctamente', async () => {
    const updated = makeUser({ names: 'Pedro' });
    const repo = makeRepo({ update: jest.fn().mockResolvedValue(updated) });
    const uc = new UpdateUser(repo);
    const result = await uc.run(1, { names: 'Pedro' }, 10);
    expect(result).toEqual(updated);
  });

  it('lanza InsufficientPermissionsError si el actor no puede editar el rol actual', async () => {
    const repo = makeRepo();
    const uc = new UpdateUser(repo);
    await expect(
      uc.run(1, {}, 10, 'administrador', 'administrador')
    ).rejects.toThrow(InsufficientPermissionsError);
  });

  it('lanza InsufficientPermissionsError si el actor no puede asignar el nuevo rol', async () => {
    const repo = makeRepo();
    const uc = new UpdateUser(repo);
    await expect(
      uc.run(1, { role: 'administrador' }, 10, 'administrador', 'prevendedor')
    ).rejects.toThrow(InsufficientPermissionsError);
  });

  it('gerente puede editar cualquier rol', async () => {
    const updated = makeUser({ role: 'administrador' });
    const repo = makeRepo({ update: jest.fn().mockResolvedValue(updated) });
    const uc = new UpdateUser(repo);
    const result = await uc.run(1, { role: 'administrador' }, 1, 'gerente', 'prevendedor');
    expect(result).toEqual(updated);
  });
});

// ─── UpdateStateUser ──────────────────────────────────────────────────────────

describe('UpdateStateUser', () => {
  it('actualiza estado sin verificación de rol', async () => {
    const repo = makeRepo({ updateState: jest.fn().mockResolvedValue(undefined) });
    const uc = new UpdateStateUser(repo);
    await uc.run(1, 10);
    expect(repo.updateState).toHaveBeenCalledWith(1, 10);
  });

  it('lanza InsufficientPermissionsError si el actor no puede eliminar el rol', async () => {
    const repo = makeRepo();
    const uc = new UpdateStateUser(repo);
    await expect(
      uc.run(1, 10, 'prevendedor', 'transportista')
    ).rejects.toThrow(InsufficientPermissionsError);
  });

  it('gerente puede eliminar cualquier rol', async () => {
    const repo = makeRepo({ updateState: jest.fn().mockResolvedValue(undefined) });
    const uc = new UpdateStateUser(repo);
    await uc.run(1, 10, 'gerente', 'administrador');
    expect(repo.updateState).toHaveBeenCalledTimes(1);
  });
});

// ─── UpdatePasswordUser ───────────────────────────────────────────────────────

describe('UpdatePasswordUser', () => {
  it('hashea y actualiza la contraseña', async () => {
    const user = makeUser();
    const repo = makeRepo({ updatePassword: jest.fn().mockResolvedValue(user) });
    const uc = new UpdatePasswordUser(repo);
    const result = await uc.run(1, 'newpassword123');
    expect(result).toBe(true);
    expect(repo.updatePassword).toHaveBeenCalledTimes(1);
    // El hash no debe ser la contraseña plana
    const call = (repo.updatePassword as jest.Mock).mock.calls[0];
    expect(call[1]).not.toBe('newpassword123');
  });

  it('retorna false si el repo retorna null', async () => {
    const repo = makeRepo({ updatePassword: jest.fn().mockResolvedValue(null) });
    const uc = new UpdatePasswordUser(repo);
    expect(await uc.run(1, 'abc')).toBe(false);
  });
});

// ─── ResetPasswordUser ────────────────────────────────────────────────────────

describe('ResetPasswordUser', () => {
  it('retorna false si el usuario no existe', async () => {
    const repo = makeRepo({ findById: jest.fn().mockResolvedValue(null) });
    const uc = new ResetPasswordUser(repo);
    expect(await uc.run(999)).toBe(false);
  });

  it('genera contraseña basada en apellidos y CI', async () => {
    const user = makeUser({ lastName: 'Perez', secondLastName: 'Lopez', ci: '12345678' });
    const repo = makeRepo({
      findById: jest.fn().mockResolvedValue(user),
      resetPassword: jest.fn().mockResolvedValue(user),
    });
    const uc = new ResetPasswordUser(repo);
    const result = await uc.run(1);
    expect(result).toBe(true);
    // La contraseña debe haberse hasheado (no plana)
    const call = (repo.resetPassword as jest.Mock).mock.calls[0];
    expect(call[1]).not.toBe('p.l12345678');
    expect(call[1]).toMatch(/^\$2[ab]\$/); // bcrypt hash
  });

  it('retorna false si resetPassword del repo falla', async () => {
    const user = makeUser();
    const repo = makeRepo({
      findById: jest.fn().mockResolvedValue(user),
      resetPassword: jest.fn().mockResolvedValue(null),
    });
    const uc = new ResetPasswordUser(repo);
    expect(await uc.run(1)).toBe(false);
  });
});

// ─── ChangeFirstLoginPassword ─────────────────────────────────────────────────

describe('ChangeFirstLoginPassword', () => {
  it('retorna error si usuario no existe', async () => {
    const repo = makeRepo({ findById: jest.fn().mockResolvedValue(null) });
    const uc = new ChangeFirstLoginPassword(repo);
    const result = await uc.run(99, 'old', 'new');
    expect(result.success).toBe(false);
    expect(result.message).toContain('no encontrado');
  });

  it('retorna error si no es el primer login', async () => {
    const user = makeUser({ isFirstLogin: false });
    const repo = makeRepo({ findById: jest.fn().mockResolvedValue(user) });
    const uc = new ChangeFirstLoginPassword(repo);
    const result = await uc.run(1, 'old', 'new');
    expect(result.success).toBe(false);
    expect(result.message).toContain('primer inicio');
  });

  it('retorna error si la contraseña actual es incorrecta', async () => {
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash('correctPass', 10);
    const user = makeUser({ isFirstLogin: true });
    const authRecord = makeAuthRecord({ passwordHash: hash });
    const repo = makeRepo({
      findById: jest.fn().mockResolvedValue(user),
      findByUserName: jest.fn().mockResolvedValue(authRecord),
    });
    const uc = new ChangeFirstLoginPassword(repo);
    const result = await uc.run(1, 'wrongPass', 'newPass');
    expect(result.success).toBe(false);
    expect(result.message).toContain('incorrecta');
  });

  it('retorna error si la nueva contraseña es igual a la actual', async () => {
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash('samePass', 10);
    const user = makeUser({ isFirstLogin: true });
    const authRecord = makeAuthRecord({ passwordHash: hash });
    const repo = makeRepo({
      findById: jest.fn().mockResolvedValue(user),
      findByUserName: jest.fn().mockResolvedValue(authRecord),
    });
    const uc = new ChangeFirstLoginPassword(repo);
    const result = await uc.run(1, 'samePass', 'samePass');
    expect(result.success).toBe(false);
    expect(result.message).toContain('diferente');
  });

  it('actualiza contraseña correctamente en primer login', async () => {
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash('tempPass', 10);
    const user = makeUser({ isFirstLogin: true });
    const authRecord = makeAuthRecord({ passwordHash: hash });
    const repo = makeRepo({
      findById: jest.fn().mockResolvedValue(user),
      findByUserName: jest.fn().mockResolvedValue(authRecord),
      updatePassword: jest.fn().mockResolvedValue(user),
      setFirstLoginComplete: jest.fn().mockResolvedValue(true),
    });
    const uc = new ChangeFirstLoginPassword(repo);
    const result = await uc.run(1, 'tempPass', 'newSecurePass');
    expect(result.success).toBe(true);
    expect(result.message).toContain('correctamente');
  });
});

// ─── User domain model ────────────────────────────────────────────────────────

describe('User domain model', () => {
  it('crea usuario con valores por defecto', () => {
    const user = new User('12345', 'Ana', 'Gomez', 'Rios', 'ana@test.com', 'prevendedor', 1, 'GR12345');
    expect(user.isFirstLogin).toBe(true);
    expect(user.id).toBeUndefined();
  });

  it('crea usuario con id y sin primer login', () => {
    const user = new User('12345', 'Ana', 'Gomez', 'Rios', 'ana@test.com', 'prevendedor', 1, 'GR12345', false, 5);
    expect(user.id).toBe(5);
    expect(user.isFirstLogin).toBe(false);
  });
});
