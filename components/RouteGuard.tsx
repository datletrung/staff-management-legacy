
import { useSession } from 'next-auth/react';

const RouteGuard = ({ router, children }:{ router: any, children: any }) => {
    const { data: session } = useSession();

    if (typeof window !== "undefined" && !session && router.pathname != '/') {
        router.push({
            pathname: '/',
        });
        return null;
    }
    return children;
};

export default RouteGuard;