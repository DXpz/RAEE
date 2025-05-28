export const UserRole = {
  GUEST: "guest",
  USER: "user",
  ADMIN: "admin",
}

export class User {
  constructor(id, username, role, fullName) {
    this.id = id
    this.username = username
    this.role = role
    this.fullName = fullName
  }

  hasPermission(permission) {
    const permissions = {
      [UserRole.GUEST]: ["view_dashboard"],
      [UserRole.USER]: ["view_dashboard", "create_entry", "view_reports"],
      [UserRole.ADMIN]: ["view_dashboard", "create_entry", "view_reports", "manage_users", "system_config"],
    }

    return permissions[this.role]?.includes(permission) || false
  }

  canAccessModule(module) {
    const modulePermissions = {
      dashboard: "view_dashboard",
      processing: "create_entry",
      reports: "view_reports",
      users: "manage_users",
      settings: "system_config",
    }

    return this.hasPermission(modulePermissions[module] || "")
  }
} 