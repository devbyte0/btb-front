export const roleRouteMap = {
  student: "/dashboard/student",
  trainer: "/dashboard/trainer",
  admin: "/dashboard/admin",
  super_admin: "/dashboard/admin",
};

export const getRoleRoute = (role) => roleRouteMap[role] || "/dashboard";
