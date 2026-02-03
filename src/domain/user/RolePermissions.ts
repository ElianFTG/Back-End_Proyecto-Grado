/**
 * Sistema de Roles y Privilegios
 * 
 * Roles disponibles:
 * 1. propietario - puede gestionar administradores, prevendedores, transportistas
 * 2. administrador - puede gestionar prevendedores y transportistas
 * 3. prevendedor - sin privilegios de gestión de usuarios
 * 4. transportista - sin privilegios de gestión de usuarios
 * 
 * Reglas:
 * - Propietario NO puede crear otro propietario
 * - Administrador NO puede editar/eliminar administradores ni propietario
 */

export const ROLES = {
  PROPIETARIO: 'propietario',
  ADMINISTRADOR: 'administrador',
  PREVENDEDOR: 'prevendedor',
  TRANSPORTISTA: 'transportista',
} as const;

export type RoleType = typeof ROLES[keyof typeof ROLES];

/**
 * Roles que puede CREAR cada tipo de usuario
 */
const CREATABLE_ROLES: Record<RoleType, RoleType[]> = {
  [ROLES.PROPIETARIO]: [ROLES.ADMINISTRADOR, ROLES.PREVENDEDOR, ROLES.TRANSPORTISTA],
  [ROLES.ADMINISTRADOR]: [ROLES.PREVENDEDOR, ROLES.TRANSPORTISTA],
  [ROLES.PREVENDEDOR]: [],
  [ROLES.TRANSPORTISTA]: [],
};

/**
 * Roles que puede EDITAR/ELIMINAR cada tipo de usuario
 */
const MANAGEABLE_ROLES: Record<RoleType, RoleType[]> = {
  [ROLES.PROPIETARIO]: [ROLES.ADMINISTRADOR, ROLES.PREVENDEDOR, ROLES.TRANSPORTISTA],
  [ROLES.ADMINISTRADOR]: [ROLES.PREVENDEDOR, ROLES.TRANSPORTISTA],
  [ROLES.PREVENDEDOR]: [],
  [ROLES.TRANSPORTISTA]: [],
};

/**
 * Verifica si un actor puede crear un usuario con el rol especificado
 */
export function canCreateRole(actorRole: string, targetRole: string): boolean {
  const creatableRoles = CREATABLE_ROLES[actorRole as RoleType] || [];
  return creatableRoles.includes(targetRole as RoleType);
}

/**
 * Verifica si un actor puede editar un usuario con el rol especificado
 */
export function canEditRole(actorRole: string, targetRole: string): boolean {
  const manageableRoles = MANAGEABLE_ROLES[actorRole as RoleType] || [];
  return manageableRoles.includes(targetRole as RoleType);
}

/**
 * Verifica si un actor puede eliminar un usuario con el rol especificado
 */
export function canDeleteRole(actorRole: string, targetRole: string): boolean {
  return canEditRole(actorRole, targetRole);
}

/**
 * Verifica si un actor puede gestionar usuarios en general
 */
export function canManageUsers(actorRole: string): boolean {
  return actorRole === ROLES.PROPIETARIO || actorRole === ROLES.ADMINISTRADOR;
}

/**
 * Obtiene los roles que puede crear un actor
 */
export function getCreatableRoles(actorRole: string): RoleType[] {
  return CREATABLE_ROLES[actorRole as RoleType] || [];
}

/**
 * Obtiene los roles que puede gestionar un actor
 */
export function getManageableRoles(actorRole: string): RoleType[] {
  return MANAGEABLE_ROLES[actorRole as RoleType] || [];
}

/**
 * Clase de error para permisos insuficientes
 */
export class InsufficientPermissionsError extends Error {
  constructor(message: string = 'No tienes permisos para realizar esta acción') {
    super(message);
    this.name = 'InsufficientPermissionsError';
  }
}
