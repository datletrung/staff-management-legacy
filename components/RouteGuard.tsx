import { useSession } from 'next-auth/react';

export default function RouteGuard({ router, children }:{ router: any, children: any }) {
    const { data: session, status } = useSession();
    const loading = status === 'loading';
    
    if (typeof window !== 'undefined'){
        if (loading) {
            return null;
        } else if (!session && router.pathname != "/") {
            router.push({pathname: '/'});
            return null;
        } else {
            return children;
        }
    }
}