/**
 * permissions.ts
 * Defines the core list of platform access capabilities.
 */

export type Permission =
  | 'access:labs'
  | 'access:challenges'
  | 'access:academy'
  | 'access:instructor_dashboard'
  | 'unlock:topics'
  | 'assign:roles'
  | 'admin:settings'
  | 'admin:billing'
  | 'superadmin:all';

export const PERMISSIONS: Record<Permission, string> = {
  'access:labs': 'Access and start training labs',
  'access:challenges': 'Access CTF missions',
  'access:academy': 'Access regular academy courses and tracks',
  'access:instructor_dashboard': 'View instructor dashboard panel',
  'unlock:topics': 'Unlock topics for cohorts',
  'assign:roles': 'Assign permissions and roles to other callsigns',
  'admin:settings': 'Modify platform settings configurations',
  'admin:billing': 'Manage billing and plans configs',
  'superadmin:all': 'Full system control override permission',
};
