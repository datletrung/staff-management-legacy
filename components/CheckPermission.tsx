import { useRouter } from 'next/router';
import { useSession } from "next-auth/react";
import { NavBarItems } from "./NavBarItems";

export const checkPermissions = () => {
    const { data: session } = useSession();
    const router = useRouter();
    const navBarItem = (typeof window !== "undefined") ? NavBarItems.find(item => item.href === router.pathname) : null;
    if (!(navBarItem && navBarItem.permissionRequired.includes(session?.user?.role!))) {
        return false;
    }
    return true;
}