'use client';

import Link from "next/link";
import Head from 'next/head';
import Notify from '@components/Notify';
import { useState, useEffect } from 'react';
import baseApiUrl from '@api/apiConfig';

import { checkPermissions } from '@components/CheckPermission';
import AccessDenied from '@components/AccessDenied';

import stylesManagerZoneTimeSheet from '@components/css/ManagerZone/TimeSheet.module.css';
import { useSession } from "next-auth/react";

export default function ManagerZoneTimeSheet() {
    if (!checkPermissions()) {
        return <AccessDenied/>;
    }

    const {data: session} = useSession();
    const [employeeList, setEmployeeList] = useState<String[]>([]);


    async function getEmployeeList() {
        const apiUrlEndpoint = `${baseApiUrl}/fetchSql`;
        let postData = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json '},
            body: JSON.stringify({
                query: 'fetchEmployeeList',
                para: []
            })
        }
        
        let response = await fetch(apiUrlEndpoint, postData);
        let res = await response.json();
        setEmployeeList(res.data);
    }

    useEffect(() => {
        getEmployeeList();
    }, [])

    return (
        <>
            <Head>
                <title>{`${process.env.WebsiteName}`}</title>
            </Head>
            <h1><Link href={'/ManagerZone'}>Manager Zone</Link> {`> Time Sheet`}</h1>

        </>
    )
}