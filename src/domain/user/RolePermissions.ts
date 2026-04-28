
export const ROLES = {
  GERENTE: 'gerente',
  ADMINISTRADOR: 'administrador',
  PREVENDEDOR: 'prevendedor',
  TRANSPORTISTA: 'transportista',
} as const;

export type RoleType = typeof ROLES[keyof typeof ROLES];

const CREATABLE_ROLES: Record<RoleType, RoleType[]> = {
  [ROLES.GERENTE]: [ROLES.ADMINISTRADOR, ROLES.PREVENDEDOR, ROLES.TRANSPORTISTA],
  [ROLES.ADMINISTRADOR]: [ROLES.PREVENDEDOR, ROLES.TRANSPORTISTA],
  [ROLES.PREVENDEDOR]: [],
  [ROLES.TRANSPORTISTA]: [],
};

const MANAGEABLE_ROLES: Record<RoleType, RoleType[]> = {
  [ROLES.GERENTE]: [ROLES.ADMINISTRADOR, ROLES.PREVENDEDOR, ROLES.TRANSPORTISTA],
  [ROLES.ADMINISTRADOR]: [ROLES.PREVENDEDOR, ROLES.TRANSPORTISTA],
  [ROLES.PREVENDEDOR]: [],
  [ROLES.TRANSPORTISTA]: [],
};


export function canCreateRole(actorRole: string, targetRole: string): boolean {
  const creatableRoles = CREATABLE_ROLES[actorRole as RoleType] || [];
  return creatableRoles.includes(targetRole as RoleType);
}


export function canEditRole(actorRole: string, targetRole: string): boolean {
  const manageableRoles = MANAGEABLE_ROLES[actorRole as RoleType] || [];
  return manageableRoles.includes(targetRole as RoleType);
}


export function canDeleteRole(actorRole: string, targetRole: string): boolean {
  return canEditRole(actorRole, targetRole);
}


export function canManageUsers(actorRole: string): boolean {
  return actorRole === ROLES.GERENTE || actorRole === ROLES.ADMINISTRADOR;
}


export function getCreatableRoles(actorRole: string): RoleType[] {
  return CREATABLE_ROLES[actorRole as RoleType] || [];
}


export function getManageableRoles(actorRole: string): RoleType[] {
  return MANAGEABLE_ROLES[actorRole as RoleType] || [];
}


export class InsufficientPermissionsError extends Error {
  constructor(message: string = 'No tienes permisos para realizar esta acción') {
    super(message);
    this.name = 'InsufficientPermissionsError';
  }
}
