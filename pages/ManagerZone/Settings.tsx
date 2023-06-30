'use client';

import Link from "next/link";
import Head from 'next/head';
import Notify from '@components/Notify';
import { useState, useEffect } from 'react';
import { Switch } from '@mui/material';
import baseApiUrl from '@api/apiConfig';

import { checkPermissions } from '@components/CheckPermission';
import AccessDenied from '@components/AccessDenied';

import stylesManagerZoneSettings from '@components/css/ManagerZone/Settings.module.css';

export default function ManagerZoneSettings() {
    if (!checkPermissions()) {
        return <AccessDenied/>;
    }

    const [checkedAutoApproveSwitch, setCheckedAutoApproveSwitch] = useState(false);
    const [disableAutoApproveSwitch, setDisableAutoApproveSwitch] = useState(false);
    
    
    async function getAutoApproveSetting() {
        const apiUrlEndpoint = `${baseApiUrl}/fetchSql`;
        const postData = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json '},
            body: JSON.stringify({
                query: 'fetchAutoApproveSetting',
                para: []
            })
        }
        
        const response = await fetch(apiUrlEndpoint, postData);
        const res = await response.json();
        let data = res.data[0].SETTING_VALUE;
        setCheckedAutoApproveSwitch((data == 'Y') ? true : false);
    }

    async function setAutoApproveSetting(state: any) {
        setDisableAutoApproveSwitch(true);
        const apiUrlEndpoint = `${baseApiUrl}/fetchSql`;
        const postData = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json '},
            body: JSON.stringify({
                query: 'updateAutoApproveSetting',
                para: [(state) ? 'Y' : 'N']
            })
        }
        
        const response = await fetch(apiUrlEndpoint, postData);
        const res = await response.json();
        setDisableAutoApproveSwitch(false);
        if (res.error){
            Notify(res.error, 'error');
        } else if (res.data.affectedRows == 1) {
            Notify(`Setting updated successfully.`, 'success');
        } else {
            Notify('Something went wrong! Please try again later.', 'error');
        }
    }

    useEffect(() => {
        getAutoApproveSetting();
    }, [])

    return (
        <>
            <Head>
                <title>{`${process.env.WebsiteName}`}</title>
            </Head>
            <h1><Link href={'/ManagerZone'}>Manager Zone</Link> {`> Settings`}</h1>
            <div>
                <h3>Manager Settings</h3>
                <div className={stylesManagerZoneSettings.SwitchContainer}> {/* Always display */}
                    <span>Time Sheet Auto Approval</span>
                    <Switch
                        checked={checkedAutoApproveSwitch}
                        disabled={disableAutoApproveSwitch}
                        onChange={(event) => {
                            const state = event.target.checked;
                            setCheckedAutoApproveSwitch(state);
                            setAutoApproveSetting(state);
                        }}
                    />
                </div>
            </div>
        </>
    )
}