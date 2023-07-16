import { faUser, faStopwatch, faUserShield, faUserGear } from '@fortawesome/free-solid-svg-icons';

export const NavBarItems = [
    { text: "Profile", icon: faUser, href: "/Profile", permissionRequired: ["SYSADMIN", "MANAGER", "EMPLOYEE"]},
    { text: "Staff Zone", icon: faStopwatch, href: "/StaffZone", permissionRequired: ["SYSADMIN", "MANAGER", "EMPLOYEE"]},
    { text: "Manager Zone", icon: faUserShield, href: "/ManagerZone", permissionRequired: ["SYSADMIN", "MANAGER"] }, 
    { text: "SysAdmin Zone", icon: faUserGear, href: "/SysAdminZone", permissionRequired: ["SYSADMIN"] },
];