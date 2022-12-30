
import { useSession } from 'next-auth/react';

const RouteGuard = ({ router, children }) => {
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