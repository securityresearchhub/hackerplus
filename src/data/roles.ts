/**
 * roles.ts
 * Links roles (Student, Instructor, Partner, Admin, Super Admin)
 * to their respective permission capabilities.
 * HP-035: Admin & Super Admin expanded with granular admin permissions.
 */
import { Permission } from './permissions';

export type RoleName = 'Student' | 'Instructor' | 'Partner' | 'Admin' | 'Super Admin';

export interface Role {
  name: RoleName;
  permissions: Permission[];
}

export const ROLES: Record<RoleName, Role> = {
  'Student': {
    name: 'Student',
    permissions: ['access:labs', 'access:challenges', 'access:academy'],
  },
  'Instructor': {
    name: 'Instructor',
    permissions: [
      'access:labs',
      'access:challenges',
      'access:academy',
      'access:instructor_dashboard',
      'unlock:topics',
    ],
  },
  'Partner': {
    name: 'Partner',
    permissions: ['access:labs', 'access:challenges', 'access:academy'],
  },
  'Admin': {
    name: 'Admin',
    permissions: [
      'access:labs',
      'access:challenges',
      'access:academy',
      'access:instructor_dashboard',
      'unlock:topics',
      'assign:roles',
      'admin:settings',
      'admin:manage_users',
      'admin:manage_courses',
      'admin:manage_batches',
      'admin:manage_labs',
      'admin:manage_challenges',
      'admin:manage_premium',
      'admin:view_analytics',
      'admin:view_audit_logs',
    ],
  },
  'Super Admin': {
    name: 'Super Admin',
    permissions: [
      'access:labs',
      'access:challenges',
      'access:academy',
      'access:instructor_dashboard',
      'unlock:topics',
      'assign:roles',
      'admin:settings',
      'admin:billing',
      'admin:manage_users',
      'admin:manage_courses',
      'admin:manage_batches',
      'admin:manage_labs',
      'admin:manage_challenges',
      'admin:manage_premium',
      'admin:view_analytics',
      'admin:view_audit_logs',
      'superadmin:all',
    ],
  },
};

