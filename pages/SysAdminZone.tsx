'use client';

import { useSession } from "next-auth/react";
import Head from 'next/head';
import { checkPermissions } from '@components/CheckPermission';
import AccessDenied from '@components/AccessDenied';

export default function SysAdminZone() {
    if (!checkPermissions()) {
        return <AccessDenied/>;
    }
    
    return (
        <>
            <Head>
                <title>{`${process.env.WebsiteName}`}</title>
            </Head>
            <h2>SysAdmin Zone</h2>
        </>
    )
}