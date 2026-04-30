export const formatRole = (role: string): string => {
  switch (role) {
    case 'SUPER_ADMIN':
      return 'Super Admin';
    case 'ADMIN':
      return 'Admin';
    case 'MANAGER':
      return 'Manager';
    case 'EMPLOYEE':
      return 'Employee';
    default:
      return role;
  }
};