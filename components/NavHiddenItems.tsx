export const NavHiddenItems = [
    { text: "Staff Zone > Time Entry", href: "/StaffZone/TimeEntry", permissionRequired: ["MANAGER", "EMPLOYEE"] },
    { text: "Staff Zone > Absence", href: "/StaffZone/Absence", permissionRequired: ["MANAGER", "EMPLOYEE"] },

    { text: "Manager Zone > App Settings", href: "/ManagerZone/AppSettings", permissionRequired: ["MANAGER"] },
    { text: "Manager Zone > Manage Staff", href: "/ManagerZone/ManageStaff", permissionRequired: ["MANAGER"] },
    { text: "Manager Zone > Time Sheet", href: "/ManagerZone/TimeSheet", permissionRequired: ["MANAGER"] },
    { text: "Manager Zone > Manage Absence", href: "/ManagerZone/ManageAbsence", permissionRequired: ["MANAGER"] },
    { text: "Manager Zone > Payroll", href: "/ManagerZone/Payroll", permissionRequired: ["MANAGER"] },
];