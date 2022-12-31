
import { useSession } from 'next-auth/react';

const RouteGuard = ({ router, children }:{ router: any, children: any }) => {
    const { data: session } = useSession();

    if (typeof window !== "undefined" && !session && router.pathname != '/') {
        router.push({
            pathname: '/',
            query: { returnUrl: router.asPath },
        });
    }
    return children;
};

export default RouteGuard;