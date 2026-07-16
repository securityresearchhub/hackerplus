/**
 * adminPermissions.ts
 * Fine-grained admin permission capabilities for HP-035.
 *
 * These keys are additive — they extend src/data/permissions.ts.
 * The Permission union in permissions.ts must include AdminPermission.
 */

export type AdminPermission =
  | 'admin:manage_users'
  | 'admin:manage_courses'
  | 'admin:manage_batches'
  | 'admin:manage_labs'
  | 'admin:manage_challenges'
  | 'admin:manage_premium'
  | 'admin:view_analytics'
  | 'admin:view_audit_logs';

export const ADMIN_PERMISSIONS: Record<AdminPermission, string> = {
  'admin:manage_users':      'Create, update, suspend, and delete user accounts',
  'admin:manage_courses':    'Enable, disable, and configure courses',
  'admin:manage_batches':    'Create, archive, and configure learning batches',
  'admin:manage_labs':       'Enable, disable, and configure training labs',
  'admin:manage_challenges': 'Enable, disable, and configure CTF challenges',
  'admin:manage_premium':    'Override and manage user premium plan assignments',
  'admin:view_analytics':    'View aggregated platform usage analytics',
  'admin:view_audit_logs':   'Read the immutable admin action audit trail',
};
