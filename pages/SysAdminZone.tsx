'use client';

import { useSession } from "next-auth/react";
import { useRouter } from 'next/router';
import Head from 'next/head';
import { checkPermissions } from '../components/CheckPermission';

export default function SystemMaintenance() {
    if (!checkPermissions()) {
        return (
        <>
            <Head>
            <title>{`${process.env.WebsiteName}`}</title>
            </Head>
            <h3 style={{color: "red"}}>You do not have permission to view this page.</h3>
        </>
        );
    }
    
    const {data: session} = useSession();
    const router = useRouter();
    if (router.query.returnUrl) router.push(router.query.returnUrl.toString())
    
    return (
        <>
            <Head>
                <title>{`${process.env.WebsiteName}`}</title>
            </Head>
            <h1>SysAdmin Zone</h1>
        </>
    )
}