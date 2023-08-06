import { faChartSimple, faUserPen, faUserLarge, faSitemap } from '@fortawesome/free-solid-svg-icons';

export const NavBarItems = [
    { text: "Dashboard", icon: faChartSimple, href: "/", permissionRequired: ["MANAGER", "EMPLOYEE", ""]},
    { text: "Profile", icon: faUserPen, href: "/Profile", permissionRequired: ["MANAGER", "EMPLOYEE"]},
    { text: "Staff Zone", icon: faUserLarge, href: "/StaffZone", permissionRequired: ["MANAGER", "EMPLOYEE"]},
    { text: "Manager Zone", icon: faSitemap, href: "/ManagerZone", permissionRequired: ["MANAGER"] }, 
];