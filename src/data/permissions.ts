/**
 * permissions.ts
 * Defines the core list of platform access capabilities.
 * HP-035: Extended with AdminPermission sub-type from adminPermissions.ts.
 */
import type { AdminPermission } from './adminPermissions';
export type { AdminPermission };

export type Permission =
  | 'access:labs'
  | 'access:challenges'
  | 'access:academy'
  | 'access:instructor_dashboard'
  | 'unlock:topics'
  | 'assign:roles'
  | 'admin:settings'
  | 'admin:billing'
  | 'superadmin:all'
  | AdminPermission;

export const PERMISSIONS: Record<Permission, string> = {
  'access:labs':                  'Access and start training labs',
  'access:challenges':            'Access CTF missions',
  'access:academy':               'Access regular academy courses and tracks',
  'access:instructor_dashboard':  'View instructor dashboard panel',
  'unlock:topics':                'Unlock topics for cohorts',
  'assign:roles':                 'Assign permissions and roles to other callsigns',
  'admin:settings':               'Modify platform settings configurations',
  'admin:billing':                'Manage billing and plans configs',
  'superadmin:all':               'Full system control override permission',
  'admin:manage_users':           'Create, update, suspend, and delete user accounts',
  'admin:manage_courses':         'Enable, disable, and configure courses',
  'admin:manage_batches':         'Create, archive, and configure learning batches',
  'admin:manage_labs':            'Enable, disable, and configure training labs',
  'admin:manage_challenges':      'Enable, disable, and configure CTF challenges',
  'admin:manage_premium':         'Override and manage user premium plan assignments',
  'admin:view_analytics':         'View aggregated platform usage analytics',
  'admin:view_audit_logs':        'Read the immutable admin action audit trail',
};
