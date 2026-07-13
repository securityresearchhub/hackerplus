/**
 * permissionEngine.ts
 * Centralized RBAC (Role-Based Access Control) manager.
 *
 * Persists user callsign assignments to roles inside `hp_user_roles` localStorage key.
 * Resolves permissions dynamically from ROLES map.
 */
import { ROLES, type RoleName } from '../../data/roles';
import { type Permission } from '../../data/permissions';

const STORAGE_KEY = 'hp_user_roles';

type UserRolesStore = Record<string, RoleName>;

// ── Persistence Helpers ──────────────────────────────────────────────────────

function loadStore(): UserRolesStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UserRolesStore) : {};
  } catch {
    return {};
  }
}

function saveStore(store: UserRolesStore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (err) {
    console.error('[PermissionEngine] Failed to write user roles storage.', err);
  }
}

// ── PermissionEngine ─────────────────────────────────────────────────────────

export const PermissionEngine = {
  /**
   * Resolves the assigned role for a callsign. Defaults to 'Student'.
   */
  getCurrentRole(username: string): RoleName {
    if (!username) return 'Student';
    const store = loadStore();
    return store[username] ?? 'Student';
  },

  /**
   * Assigns a role to a callsign.
   */
  assignRole(username: string, role: RoleName): void {
    if (!username) return;
    const store = loadStore();
    store[username] = role;
    saveStore(store);
  },

  /**
   * Verifies if a callsign possesses a specific permission capability.
   */
  hasPermission(username: string, permission: Permission): boolean {
    const roleName = this.getCurrentRole(username);
    const role = ROLES[roleName];
    if (!role) return false;

    // Super Admin has all permissions automatically
    if (roleName === 'Super Admin' || role.permissions.includes('superadmin:all')) {
      return true;
    }

    return role.permissions.includes(permission);
  },

  /**
   * Returns list of permissions associated with a role name.
   */
  getPermissions(role: RoleName): Permission[] {
    const roleConfig = ROLES[role];
    return roleConfig ? roleConfig.permissions : [];
  },
};

export default PermissionEngine;
