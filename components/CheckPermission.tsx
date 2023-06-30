import { useRouter } from 'next/router';
import { useSession } from "next-auth/react";
import { NavBarItems } from "./NavBarItems";
import { NavHiddenItems } from "./NavHiddenItems";

export const checkPermissions = () => {
    const { data: session, status } = useSession();
    const loading = status === 'loading';
    const router = useRouter();
    const navBarItem = (typeof window !== "undefined") ? NavBarItems.find(item => item.href === router.pathname) : null;
    const NavHiddenItem = (typeof window !== "undefined") ? NavHiddenItems.find(item => item.href === router.pathname) : null;

    if (!loading
        && !(navBarItem && navBarItem.permissionRequired.includes(session?.user?.role!))
        && !(NavHiddenItem && NavHiddenItem.permissionRequired.includes(session?.user?.role!))
    ) {
        return false;
    }
    return true;
}