'use client';

import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Calendar from 'react-calendar';
import Notify from '../components/Notify';
import { checkPermissions } from '../components/CheckPermission';

import { LoadingButton } from '@mui/lab';
import { TextField } from '@mui/material';
import {Add as AddIcon
      ,Check as CheckIcon
} from '@mui/icons-material';

import stylesManagerZone from '../components/css/ManagerZone.module.css';

export default function ManagerZone() {
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
    const [email] = useState(session?.user?.email);
    const [loading, setLoading] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const [disableSubmitButton, setDisableSubmitButton] = useState(true);
    const [isHidden, setIsHidden] = useState(true);

    const [efirstName, setFirstName] = useState('');
    const [elastName, setLastName] = useState('');
    const [eemail, setEmail] = useState('');

    function validateForm() {
        if (eemail.match(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/) && efirstName && elastName && eemail) {
            setDisableSubmitButton(false);
        } else {
            setDisableSubmitButton(true);
        }
    }

    async function handleAddEmployee() {
        if (!efirstName || !elastName || !eemail) Notify('Please enter all required information', 'warn')
        setLoading(true);
        const apiUrlEndpoint = 'api/fetchSql';
        let postData = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json '},
            body: JSON.stringify({
                action: 'submit',
                query: 'submitAddEmployee',
                para: [efirstName, elastName, eemail, email]
            })
        }
        
        let response = await fetch(apiUrlEndpoint, postData);
        let res = await response.json();
        setLoading(false);
        if (res.error){
            Notify(res.error, 'error');
        } else if (res.data.affectedRows == 1) {
            Notify(`Employee ${efirstName} ${elastName} added successfully`, 'info');
        } else {
            Notify('Something went wrong! Please try again later', 'error');
        }
    }
    
    async function handleApproveTimeSheet(para:Array<string>){
        const employeeId = para[0];
        const weekNum = para[1];

        const apiUrlEndpoint = 'api/fetchSql';
        let postData = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json '},
            body: JSON.stringify({
                action: 'submit',
                query: 'submitApproveTimeSheet',
                para: [employeeId, weekNum, email]
            })
        }
        let response = await fetch(apiUrlEndpoint, postData);
        let res = await response.json();
        console.log(res.data);
    }

    return (
        <>
            <Head>
                <title>{`Manager Zone | ${process.env.WebsiteName}`}</title>
            </Head>
            <h1>Manager Zone</h1>
            <div className={stylesManagerZone.ButtonContainer}>
                  <div className={stylesManagerZone.Button}>
                    <LoadingButton
                      size="large" variant="outlined" color="success" endIcon={<AddIcon/>}
                      style={{width:'100%'}}
                      onClick={() => (setIsHidden(!isHidden))}
                    >
                      Add Employee
                    </LoadingButton>
                    <div style={{ display: isHidden ? 'none' : 'block' }}>
                        <div className={stylesManagerZone.FormContainer}>
                            <div className={stylesManagerZone.FormChild}>
                                <TextField
                                    required
                                    label="First Name"
                                    variant="standard"
                                    style={{width:'100%'}}
                                    disabled={disabled}
                                    onChange={(event) => {setFirstName(event.target.value); validateForm();}}
                                />
                            </div>
                            <div className={stylesManagerZone.FormChild}>
                                <TextField
                                    required
                                    label="Last Name"
                                    variant="standard"
                                    style={{width:'100%'}}
                                    disabled={disabled}
                                    onChange={(event) => {setLastName(event.target.value); validateForm();}}
                                />
                            </div>
                            <div className={stylesManagerZone.FormChild}>
                                <TextField
                                    required
                                    label="Email"
                                    variant="standard"
                                    style={{width:'100%'}}
                                    disabled={disabled}
                                    onChange={(event) => {setEmail(event.target.value); validateForm();}}
                                />
                            </div>
                            <div className={stylesManagerZone.FormChild}>
                            <LoadingButton
                                size="large" variant="outlined" color="success" endIcon={<AddIcon/>}
                                loading={loading} loadingPosition="end"
                                style={{width:'100%'}}
                                disabled={disableSubmitButton}
                                onClick={() => handleAddEmployee()}
                                >
                                Add
                            </LoadingButton>
                            </div>
                        </div>
                    </div>
                  </div>

                  <div className={stylesManagerZone.Button}>
                    <LoadingButton
                      size="large" variant="outlined" color="success" endIcon={<CheckIcon/>}
                      style={{width:'100%'}}
                      onClick={() => handleApproveTimeSheet(["EmployeeID", "WeekNum"])}
                    >
                      Approve Time Sheet
                    </LoadingButton>
                  </div>
            </div>
        </>
    );
}