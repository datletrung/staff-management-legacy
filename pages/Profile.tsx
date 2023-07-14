'use client';

import { useSession } from "next-auth/react";
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { TextField, Button } from '@mui/material';
import Notify from '@components/Notify';
import { createHash } from 'crypto';

import { checkPermissions } from '@components/CheckPermission';
import AccessDenied from '@components/AccessDenied';
import { MuiTelInput, matchIsValidTel } from 'mui-tel-input';
import baseApiUrl from '@api/apiConfig';

import stylesProfile from '@components/css/Profile.module.css';

export default function SystemMaintenance() {
    if (!checkPermissions()) {
        return <AccessDenied/>;
    }

    const { data: session } = useSession();
    const [userId] = useState(session?.user?.userId);

    const [personEmail, setPersonEmail] = useState('');
    const [personPhoneNumber, setPersonPhoneNumber] = useState('');
    const [personFirstName, setPersonFirstName] = useState('');
    const [personLastName, setPersonLastName] = useState('');

    const [prevEmail, setPrevEmail] = useState('');
    const [prevPhoneNumber, setPrevPhoneNumber] = useState('');
    const [prevFirstName, setPrevFirstName] = useState('');
    const [prevLastName, setPrevLastName] = useState('');

    const [personOldPassword, setPersonOldPassword] = useState('');
    const [personNewPassword1, setPersonNewPassword1] = useState('');
    const [personNewPassword2, setPersonNewPassword2] = useState('');
    
    useEffect(() => {
        getPersonalInfo();
    }, []);

    async function getPersonalInfo() {
        const apiUrlEndpoint = `${baseApiUrl}/fetchSql`;
        const postData = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json '},
                body: JSON.stringify({
                        query: 'fetchPersonalInfo',
                        para: [userId]
                })
        }
        
        const response = await fetch(apiUrlEndpoint, postData);
        const res = await response.json();
        let data = res.data;

        setPersonEmail(data[0].EMAIL);
        setPersonPhoneNumber(data[0].PHONE_NUMBER);
        setPersonFirstName(data[0].FIRST_NAME);
        setPersonLastName(data[0].LAST_NAME);
        
        setPrevEmail(data[0].EMAIL);
        setPrevPhoneNumber(data[0].PHONE_NUMBER);
        setPrevFirstName(data[0].FIRST_NAME);
        setPrevLastName(data[0].LAST_NAME);
    }

    async function updatePersonalInfo() {
        if (personFirstName === '' || personLastName === '' || personEmail === ''){
            Notify('Please double check all fields!', 'error');
        } else if (personFirstName == prevFirstName
            && personLastName == prevLastName
            && personEmail == prevEmail
            && personPhoneNumber == prevPhoneNumber
        ) {
            Notify('Nothing changed!', 'warn');
        } else if (personFirstName != prevFirstName || personLastName != prevLastName || personEmail != prevEmail || personPhoneNumber != prevPhoneNumber) {
            if (personPhoneNumber !== '' && !matchIsValidTel(personPhoneNumber)){     
                Notify('Invalid phone number!', 'error');
                return;
            }
            const apiUrlEndpoint = `${baseApiUrl}/fetchSql`;
            const postData = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json '},
                    body: JSON.stringify({
                            query: 'updatePersonalInfo',
                            para: [personEmail, personPhoneNumber, personFirstName, personLastName, userId, userId]
                    })
            }
            const response = await fetch(apiUrlEndpoint, postData);
            const res = await response.json();
            if (res.error){
                Notify(res.error, 'error');
                return;
            }
            setPrevEmail(personEmail);
            setPrevPhoneNumber(personPhoneNumber);
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
            const apiUrlEndpoint = `${baseApiUrl}/fetchSql`;
            const postData = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json '},
                    body: JSON.stringify({
                            query: 'updatePassword',
                            para: [newPassword1, userId, oldPassword]
                    })
            }
            const response = await fetch(apiUrlEndpoint, postData);
            const res = await response.json();
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
            Notify('Something went wrong! Please try again later.', 'error');
        }
    }
    
    return (
        <>
            <Head>
                <title>{`${process.env.WebsiteName}`}</title>
            </Head>
            <h2>Profile</h2>
            <div className={stylesProfile.FormContainer}>
                <div className={stylesProfile.FormSplitView}>
                    <h3>
                        Personal Information
                    </h3>
                    <div className={`${stylesProfile.splitViewForm} ${stylesProfile.FormChild}`}>
                        <TextField
                            label='First Name'
                            id='first-name-input'
                            variant="standard"
                            value={personFirstName}
                            onChange={(event) => setPersonFirstName(event.target.value)}
                            className={stylesProfile.FormSubChild}
                        />
                        <TextField
                            label='Last Name'
                            id='last-name-input'
                            variant="standard"
                            value={personLastName}
                            onChange={(event) => setPersonLastName(event.target.value)}
                            className={stylesProfile.FormSubChild}
                        />
                    </div>
                    <div className={stylesProfile.FormChild}>
                        <TextField
                            label='Email'
                            id='email-input'
                            type='email'
                            variant="standard"
                            value={personEmail}
                            onChange={(event) => setPersonEmail(event.target.value)}
                            className={stylesProfile.FormSubChild}
                        />
                    </div>
                    <div className={stylesProfile.FormChild}>
                        <MuiTelInput
                            label='Phone Number'
                            id='phone-number-input'
                            variant="standard" 
                            value={personPhoneNumber}
                            onChange={(value: any) => setPersonPhoneNumber(value)}
                            className={stylesProfile.FormSubChild}
                        />
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
                        <TextField
                            label='Old Password'
                            type='password'
                            id='prev-pass-input'
                            variant="standard"
                            value={personOldPassword}
                            onChange={(event) => setPersonOldPassword(event.target.value)}
                            className={stylesProfile.FormSubChild}
                        />
                    </div>
                    <div className={stylesProfile.FormChild}>
                        <TextField
                            label='New Password'
                            type='password'
                            id='new-pass-1-input'
                            variant="standard"
                            value={personNewPassword1}
                            onChange={(event) => setPersonNewPassword1(event.target.value)}
                            className={stylesProfile.FormSubChild}
                        />
                    </div>
                    <div className={stylesProfile.FormChild}>
                        <TextField
                            label='Confirm New Password'
                            type='password'
                            id='new-pass-2-input'
                            variant="standard"
                            value={personNewPassword2}
                            onChange={(event) => setPersonNewPassword2(event.target.value)}
                            className={stylesProfile.FormSubChild}
                        />
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