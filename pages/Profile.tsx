'use client';

import { useSession } from "next-auth/react";
import Head from 'next/head';
import { TextField, Button } from '@mui/material';

import { checkPermissions } from '../components/CheckPermission';
import AccessDenied from '../components/AccessDenied';

import stylesProfile from '../components/css/Profile.module.css';

export default function SystemMaintenance() {
    if (!checkPermissions()) {
        return <AccessDenied/>;
    }
    
    return (
        <>
            <Head>
                <title>{`${process.env.WebsiteName}`}</title>
            </Head>
            <h1>Profile</h1>
            <div className={stylesProfile.FormContainer}>
                <h3>
                    Personal Information
                </h3>
                <div className={`${stylesProfile.splitViewForm} ${stylesProfile.FormChild}`}>
                    <TextField id='first-name-input' label="First Name" variant="standard" className={stylesProfile.FormSubChild}/>
                    <TextField id='last-name-input' label="Last Name" variant="standard" className={stylesProfile.FormSubChild}/>
                </div>
                <div className={stylesProfile.FormChild}>
                    <TextField id='email-input' label="Email Address" variant="standard" className={stylesProfile.FormSubChild}/>
                </div>
                <br/>
                <h3>
                    Security
                </h3>
                <div className={stylesProfile.FormChild}>
                    <TextField id='prev-pass-input' label="Old Password" type="password" variant="standard" className={stylesProfile.FormSubChild}/>
                </div>
                <div className={`${stylesProfile.splitViewForm} ${stylesProfile.FormChild}`}>
                    <TextField id='new-pass-1-input' label="New Password" type="password" variant="standard" className={stylesProfile.FormSubChild}/>
                    <TextField id='new-pass-2-input' label="Repeat New Password" type="password" variant="standard" className={stylesProfile.FormSubChild}/>
                </div>
                <br/>
                <div>
                    <Button
                        size="large"
                        variant="outlined"
                        color="success"
                        style={{width:'100%'}}
                        onClick={() => {}}
                    >
                        SAVE
                    </Button>
                </div>
            </div>
        </>
    )
}