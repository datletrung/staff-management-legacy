export const NavHiddenItems = [
    { text: "Home Page", href: "/", permissionRequired: ["SYSADMIN", "MANAGER", "EMPLOYEE", ""] },

    { text: "Staff Zone > Time Entry", href: "/StaffZone/TimeEntry", permissionRequired: ["SYSADMIN", "MANAGER", "EMPLOYEE"] },
    { text: "Staff Zone > Absence", href: "/StaffZone/Absence", permissionRequired: ["SYSADMIN", "MANAGER", "EMPLOYEE"] },

    { text: "Manager Zone > App Settings", href: "/ManagerZone/AppSettings", permissionRequired: ["SYSADMIN", "MANAGER"] },
    { text: "Manager Zone > Manage Staff", href: "/ManagerZone/ManageStaff", permissionRequired: ["SYSADMIN", "MANAGER"] },
    { text: "Manager Zone > Time Sheet", href: "/ManagerZone/TimeSheet", permissionRequired: ["SYSADMIN", "MANAGER"] },
    { text: "Manager Zone > Manage Absence", href: "/ManagerZone/ManageAbsence", permissionRequired: ["SYSADMIN", "MANAGER"] },
    { text: "Manager Zone > Payroll", href: "/ManagerZone/Payroll", permissionRequired: ["SYSADMIN", "MANAGER"] },
];