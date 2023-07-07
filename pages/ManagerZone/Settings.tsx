'use client';

import Link from "next/link";
import Head from 'next/head';
import Notify from '@components/Notify';
import { useState, useEffect } from 'react';
import { Switch, Select, MenuItem, Button, TextField } from '@mui/material';
import baseApiUrl from '@api/apiConfig';
import { useSession } from "next-auth/react";

import { checkPermissions } from '@components/CheckPermission';
import AccessDenied from '@components/AccessDenied';

import stylesManagerZoneSettings from '@components/css/ManagerZone/Settings.module.css';

export default function ManagerZoneSettings() {
    if (!checkPermissions()) {
        return <AccessDenied/>;
    }

    const {data: session} = useSession();
    const [userId] = useState(session?.user?.userId);
    const [checkedAutoApproveSwitch, setCheckedAutoApproveSwitch] = useState(false);
    const [selectedProvinceOption, setSelectedProvinceOption] = useState('');
    const [selectedPayPeriodOption, setSelectedPayPeriodOption] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [companyShortName, setCompanyShortName] = useState('');

    const provinceOptions = [
        { label: 'Alberta', value: 'AB' },
        { label: 'British Columbia', value: 'BC' },
        { label: 'Manitoba', value: 'MB' },
        { label: 'New Brunswick', value: 'NB' },
        { label: 'Newfoundland/Labrador', value: 'NL' },
        { label: 'Northwest Territories', value: 'NT' },
        { label: 'Nova Scotia', value: 'NS' },
        { label: 'Nunavut', value: 'NU' },
        { label: 'Ontario', value: 'ON' },
        { label: 'Prince Edward Island', value: 'PE' },
        { label: 'Quebec', value: 'QC' },
        { label: 'Saskatchewan', value: 'SK' },
        { label: 'Yukon', value: 'YT' },
    ];

    const payPeriodOptions = [
        { label: 'Daily (240 per year)', value: '240' },
        { label: 'Weekly (52 per year)', value: '52' },
        { label: 'Bi-Weekly (26 per year)', value: '26' },
        { label: 'Semi-Monthly (24 per year)', value: '24' },
        { label: 'Monthly (12 per year)', value: '12' },
        { label: 'Annual (1 per year)', value: '1' },
        { label: 'Daily (260 per year)', value: '260' },
        { label: 'Weekly (53 per year)', value: '53' },
        { label: 'Bi-Weekly (27 per year)', value: '27' },
        { label: '4 Weeks (13 per year)', value: '13' },
    ];
    
    async function getSettings() {
        const apiUrlEndpoint = `${baseApiUrl}/fetchSql`;
        const postData = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json '},
            body: JSON.stringify({
                query: 'fetchSettings',
                para: []
            })
        }
        
        const response = await fetch(apiUrlEndpoint, postData);
        const res = await response.json();
        
        if (res.error) {
            Notify('Something went wrong! Please try again later.', 'error');
            return;
        }
        
        const data = res.data;

        data.forEach((item: any) => {
            switch(item.SETTING_NAME) {
                case 'COMPANY_NAME': {
                    setCompanyName(item.SETTING_VALUE);
                    break;
                }
                case 'COMPANY_SHORT_NAME': {
                    setCompanyShortName(item.SETTING_VALUE);
                    break;
                }
                case 'AUTO_APPROVE': {
                    setCheckedAutoApproveSwitch((item.SETTING_VALUE == 'Y') ? true : false);
                    break;
                }
                case 'PROVINCE': {
                    setSelectedProvinceOption(item.SETTING_VALUE);
                    break;
                }
                case 'PAY_PERIOD': {
                    setSelectedPayPeriodOption(item.SETTING_VALUE);
                    break;
                }
                default: {
                    break;
                }
            }
        });
    }

    async function setSettings() {
        const apiUrlEndpoint = `${baseApiUrl}/fetchSql`;
        const postData = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json '},
            body: JSON.stringify({
                query: 'updateSettings',
                para: [
                    companyName,
                    companyShortName,
                    (checkedAutoApproveSwitch) ? 'Y' : 'N',
                    selectedProvinceOption,
                    selectedPayPeriodOption,
                    userId,
                ]
            })
        }
        
        const response = await fetch(apiUrlEndpoint, postData);
        const res = await response.json();
        if (res.error){
            Notify(res.error, 'error');
        } else if (res.data.affectedRows == 0) {
            Notify(`Nothing changed!`, 'warn');
        } else if (res.data.affectedRows > 0) {
            Notify(`Setting updated!`, 'success');
        }
    }

    useEffect(() => {
        getSettings();
    }, [])

    return (
        <>
            <Head>
                <title>{`${process.env.WebsiteName}`}</title>
            </Head>
            <h1><Link href={'/ManagerZone'}>Manager Zone</Link> {`> Settings`}</h1>
            <div>
                <h4>General</h4>
                <div className={stylesManagerZoneSettings.GridContainer}>
                    <span className={stylesManagerZoneSettings.SettingTitle}>Company Name</span>
                    <TextField
                        variant="standard"
                        value={companyName}
                        onChange={(event) => {setCompanyName(event.target.value)}}
                    />
                    <span className={stylesManagerZoneSettings.SettingTitle}>Company Short Name</span>
                    <TextField
                        variant="standard"
                        value={companyShortName}
                        onChange={(event) => {setCompanyShortName(event.target.value)}}
                    />
                </div>
                <h4>Time Entry</h4>
                <div className={stylesManagerZoneSettings.GridContainer}>
                    <span className={stylesManagerZoneSettings.SettingTitle}>Time Sheet Auto Approval</span>
                    <Switch
                        checked={checkedAutoApproveSwitch}
                        onChange={(event) => {setCheckedAutoApproveSwitch(event.target.checked)}}
                    />
                </div>
                <h4>Payroll</h4>
                <div className={stylesManagerZoneSettings.GridContainer}>
                    <span className={stylesManagerZoneSettings.SettingTitle}>Province</span>
                    <Select
                        variant="standard"
                        value={selectedProvinceOption}
                        onChange={(event) => {setSelectedProvinceOption(event.target.value)}}
                    >
                        {provinceOptions.map((item) => (
                        <MenuItem key={item.value} value={item.value}>
                            {item.label}
                        </MenuItem>
                        ))}
                    </Select>
                    <span className={stylesManagerZoneSettings.SettingTitle}>Pay Period</span>
                    <Select
                        variant="standard"
                        value={selectedPayPeriodOption}
                        onChange={(event) => {setSelectedPayPeriodOption(event.target.value)}}
                    >
                        {payPeriodOptions.map((item) => (
                        <MenuItem key={item.value} value={item.value}>
                            {item.label}
                        </MenuItem>
                        ))}
                    </Select>
                </div>
                <br/>
                <Button
                    variant="outlined"
                    style={{width:'100%'}}
                    onClick={() => setSettings()}
                >
                    SAVE
                </Button>
            </div>
        </>
    )
}