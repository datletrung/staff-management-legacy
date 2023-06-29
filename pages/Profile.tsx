'use client';

import { useSession } from "next-auth/react";
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { FormControl, InputLabel, Input, Button } from '@mui/material';
import Notify from '../components/Notify';
import { createHash } from 'crypto';

import { checkPermissions } from '../components/CheckPermission';
import AccessDenied from '../components/AccessDenied';

import stylesProfile from '../components/css/Profile.module.css';

export default function SystemMaintenance() {
    if (!checkPermissions()) {
        return <AccessDenied/>;
    }

    const { data: session } = useSession();
    const [email] = useState(session?.user?.email);
    const [personEmail, setPersonEmail] = useState('');
    const [personFirstName, setPersonFirstName] = useState('');
    const [personLastName, setPersonLastName] = useState('');

    const [prevEmail, setPrevEmail] = useState('');
    const [prevFirstName, setPrevFirstName] = useState('');
    const [prevLastName, setPrevLastName] = useState('');

    const [personOldPassword, setPersonOldPassword] = useState('');
    const [personNewPassword1, setPersonNewPassword1] = useState('');
    const [personNewPassword2, setPersonNewPassword2] = useState('');
    
    useEffect(() => {
        getPersonalInfo();
    }, []);

    async function getPersonalInfo() {
        const apiUrlEndpoint = 'api/fetchSql';
        const postData = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json '},
                body: JSON.stringify({
                        query: 'fetchPersonalInfo',
                        para: [email]
                })
        }
        
        const response = await fetch(apiUrlEndpoint, postData);
        const res = await response.json();
        let data = res.data;
        setPersonEmail(data[0].EMAIL);
        setPersonFirstName(data[0].FIRST_NAME);
        setPersonLastName(data[0].LAST_NAME);
        
        setPrevEmail(data[0].EMAIL);
        setPrevFirstName(data[0].FIRST_NAME);
        setPrevLastName(data[0].LAST_NAME);
    }

    async function updatePersonalInfo() {
        if (personFirstName === '' || personLastName === '' || personEmail === ''){
            Notify('Please double check all fields!', 'error');
        } else if (personFirstName == prevFirstName
            && personLastName == prevLastName
            && personEmail == prevEmail
        ) {
            Notify('Nothing changed!', 'warn');
        } else if (personFirstName != prevFirstName || personLastName != prevLastName || personEmail != prevEmail) {
            const apiUrlEndpoint = 'api/fetchSql';
            const postData = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json '},
                    body: JSON.stringify({
                            query: 'updatePersonalInfo',
                            para: [personEmail, personFirstName, personLastName, email]
                    })
            }
            const response = await fetch(apiUrlEndpoint, postData);
            const res = await response.json();
            if (res.error){
                Notify(res.error, 'error');
                return;
            }
            setPrevEmail(personEmail);
            setPrevFirstName(personFirstName);
            setPrevLastName(personLastName);
            Notify('Profile updated!', 'success');
        }
    }

    async function updatePassword() {
        if (personOldPassword === '' && personNewPassword1 === '' && personNewPassword2 === '') {
            Notify('Nothing changed!', 'warn');
        } else if (personOldPassword === '' || personNewPassword1 === '' || personNewPassword2 === '') {
            Notify('Password cannot be empty!', 'error');
        } else if (personNewPassword1 != personNewPassword2) {
            Notify('Passwords do not match!', 'error');
        } else {
            const oldPassword = createHash('sha256').update(personOldPassword).digest('hex');
            const newPassword1 = createHash('sha256').update(personNewPassword1).digest('hex');
            const apiUrlEndpoint = 'api/fetchSql';
            const postData = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json '},
                    body: JSON.stringify({
                            query: 'updatePassword',
                            para: [newPassword1, email, oldPassword]
                    })
            }
            const response = await fetch(apiUrlEndpoint, postData);
            const res = await response.json();
            console.log(res);
            if (res.error){
                Notify(res.error, 'error');
                return;
            } else if (res.data.affectedRows === 0){
                Notify('Wrong password!', 'error');
                return;
            } else if (res.data.affectedRows === 1){
                Notify('Password updated!', 'success');
                setPersonOldPassword('');
                setPersonNewPassword1('');
                setPersonNewPassword2('');
                return;
            }
            Notify('Unknown error!', 'error');
        }
    }
    
    return (
        <>
            <Head>
                <title>{`${process.env.WebsiteName}`}</title>
            </Head>
            <h1>Profile</h1>
            <div className={stylesProfile.FormContainer}>
                <div className={stylesProfile.FormSplitView}>
                    <h3>
                        Personal Information
                    </h3>
                    <div className={`${stylesProfile.splitViewForm} ${stylesProfile.FormChild}`}>
                        <FormControl className={stylesProfile.FormSubChild}>
                            <InputLabel htmlFor="first-name-input">First Name</InputLabel>
                            <Input id='first-name-input'
                                value={personFirstName}
                                onChange={(event) => setPersonFirstName(event.target.value)}
                            />
                        </FormControl>
                        <FormControl className={stylesProfile.FormSubChild}>
                            <InputLabel htmlFor="last-name-input">Last Name</InputLabel>
                            <Input id='last-name-input'
                                value={personLastName}
                                onChange={(event) => setPersonLastName(event.target.value)}
                            />
                        </FormControl>
                    </div>
                    <div className={stylesProfile.FormChild}>
                        <FormControl className={stylesProfile.FormSubChild}>
                            <InputLabel htmlFor="email-input">Email</InputLabel>
                            <Input id='email-input'
                                value={personEmail}
                                onChange={(event) => setPersonEmail(event.target.value)}
                            />
                        </FormControl>
                    </div>
                    <div>
                        <Button
                            size="large"
                            variant="outlined"
                            color="success"
                            style={{width:'100%'}}
                            onClick={() => updatePersonalInfo()}
                        >
                            UPDATE PROFILE
                        </Button>
                    </div>
                </div>
                <div className={stylesProfile.FormSplitView}>
                    <h3>
                        Security
                    </h3>
                    <div className={stylesProfile.FormChild}>
                        <FormControl className={stylesProfile.FormSubChild}>
                            <InputLabel htmlFor="prev-pass-input">Old Password</InputLabel>
                            <Input id='prev-pass-input'
                                type='password'
                                value={personOldPassword}
                                onChange={(event) => setPersonOldPassword(event.target.value)}
                            />
                        </FormControl>
                    </div>
                    <div className={`${stylesProfile.splitViewForm} ${stylesProfile.FormChild}`}>                    
                        <FormControl className={stylesProfile.FormSubChild}>
                            <InputLabel htmlFor="new-pass-1-input">New Password</InputLabel>
                            <Input id='new-pass-1-input'
                                type='password'
                                value={personNewPassword1}
                                onChange={(event) => setPersonNewPassword1(event.target.value)}
                            />
                        </FormControl>
                        <FormControl className={stylesProfile.FormSubChild}>
                            <InputLabel htmlFor="new-pass-2-input">Repeat New Password</InputLabel>
                            <Input id='new-pass-2-input'
                                type='password'
                                value={personNewPassword2}
                                onChange={(event) => {
                                    setPersonNewPassword2(event.target.value);
                                }}
                            />
                        </FormControl>
                    </div>
                    <div>
                        <Button
                            size="large"
                            variant="outlined"
                            color="success"
                            style={{width:'100%'}}
                            onClick={() => updatePassword()}
                        >
                            CHANGE PASSWORD
                        </Button>
                    </div>
                </div>
            </div>
        </>
    )
}