export const MANAGER_ALLOWED_SCREENS = ['inquiries', 'orders'] as const;

export function isAdminRole(role?: string | null): boolean {
  return role === 'super_admin' || role === 'admin';
}

export function isManagerRole(role?: string | null): boolean {
  return role === 'manager';
}

export function canAccessAdminPanel(role?: string | null): boolean {
  return isAdminRole(role) || isManagerRole(role);
}

export function canAccessAdminScreen(role: string | null | undefined, screen: string): boolean {
  if (isAdminRole(role)) return true;
  if (isManagerRole(role)) return MANAGER_ALLOWED_SCREENS.includes(screen as typeof MANAGER_ALLOWED_SCREENS[number]);
  return false;
}

export function defaultAdminPath(role?: string | null): string {
  return isManagerRole(role) ? '/inquiries' : '/dashboard';
}
