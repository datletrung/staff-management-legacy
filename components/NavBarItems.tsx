import { faHouse, faStopwatch, faUserShield, faUserGear } from '@fortawesome/free-solid-svg-icons';

export const NavBarItems = [
    { text: "Home Page", icon: faHouse, href: "/", permissionRequired: ["SYSADMIN", "MANAGER", "EMPLOYEE", ""] },
    { text: "Time Entry", icon: faStopwatch, href: "/TimeEntry", permissionRequired: ["SYSADMIN", "MANAGER", "EMPLOYEE"]},
    { text: "Manager Zone", icon: faUserShield, href: "/ManagerZone", permissionRequired: ["SYSADMIN", "MANAGER"] }, 
    { text: "SysAdmin Zone", icon: faUserGear, href: "/SysAdminZone", permissionRequired: ["SYSADMIN"] },
];