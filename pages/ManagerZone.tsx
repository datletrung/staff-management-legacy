'use client';

import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Calendar from 'react-calendar';
import Notify from '../components/Notify';
import { checkPermissions } from '../components/CheckPermission';
import AccessDenied from '../components/AccessDenied';

import { LoadingButton } from '@mui/lab';
import { TextField } from '@mui/material';
import {Add as AddIcon
      ,Check as CheckIcon
} from '@mui/icons-material';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

import 'react-calendar/dist/Calendar.css';
import stylesManagerZone from '../components/css/ManagerZone.module.css';

export default function ManagerZone() {
    if (!checkPermissions()) {
        return <AccessDenied/>;
    }
    const {data: session} = useSession();
    const [email] = useState(session?.user?.email);
    const [loading, setLoading] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const [disableSubmitButton, setDisableSubmitButton] = useState(true);
    
    const [efirstName, setFirstName] = useState('');
    const [elastName, setLastName] = useState('');
    const [eemail, setEmail] = useState('');
    const [employeeList, setEmployeeList] = useState<String[]>([]);
    const [date, setDate] = useState(new Date());

    const [currentTab, setCurrentTab] = useState(1);
    const [currentStep, setCurrentStep] = useState(1);

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

    async function getEmployeeList() {
        const apiUrlEndpoint = 'api/fetchSql';
        let postData = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json '},
            body: JSON.stringify({
                action: 'fetch',
                query: 'fetchEmployeeList',
                para: []
            })
        }
        
        let response = await fetch(apiUrlEndpoint, postData);
        let res = await response.json();
        console.log(res.data);
        setEmployeeList(res.data);
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

    useEffect(() => {
        getEmployeeList();
    }, [])

    return (
        <>
            <Head>
                <title>{`Manager Zone | ${process.env.WebsiteName}`}</title>
            </Head>
            <h1>Manager Zone</h1>
            <div className={stylesManagerZone.ButtonContainer}>
                <div className={stylesManagerZone.Button}>
                    <LoadingButton
                      size="large" variant="outlined" endIcon={<CheckIcon/>}
                      style={{width:'100%'}}
                      onClick={() => {setCurrentTab(1)}}
                    >
                      Approve Time Sheet
                    </LoadingButton>
                </div>
                <div className={stylesManagerZone.Button}>
                    <LoadingButton
                      size="large" variant="outlined" endIcon={<AddIcon/>}
                      style={{width:'100%'}}
                      onClick={() => {setCurrentTab(2)}}
                    >
                      Add Employee
                    </LoadingButton>
                </div>
            </div>
            
            <div style={{ display: (currentTab == 1) ? 'none' : 'block' }}>
                <div className={stylesManagerZone.DropDownContainer}>
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
                        size="large" variant="outlined" endIcon={<AddIcon/>}
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
            <div style={{ display: (currentTab == 2) ? 'none' : 'block' }}>
                <div className={stylesManagerZone.DropDownContainer}>
                    <div className={stylesManagerZone.CalendarChildFlexColumn}>
                        <div className={stylesManagerZone.EmployeeList}>
                            <h4>Choose an employee:</h4>
                            {employeeList.map((item:any, idx:number) => {
                                let userId = item.USER_ID;
                                let firstName = item.FIRST_NAME;
                                let lastName = item.LAST_NAME;
                                let eemail = item.EMAIL;
                                return (
                                <div key={idx} className={stylesManagerZone.EmployeeCard}>
                                    <b>{firstName + ' ' + lastName}</b>
                                    <i style={{fontSize: '14px'}}>{eemail}</i>
                                </div>
                                );                    
                            })}
                        </div>
                        <div onClick={() => setCurrentStep(1)}><FontAwesomeIcon icon={faArrowLeft}/> Back</div>
                        <Calendar className={stylesManagerZone.CalendarContainer}
                            locale='en-US'
                            onChange={(datePara: any) => { setDate(datePara) }}
                            value={date}
                            //tileContent={tileContent}
                        />
                    </div>
                    <div className={stylesManagerZone.CalendarChildFlexColumn}>
                        Time Sheet Data goes here
                    </div>
                    
                    <LoadingButton
                        size="large" variant="outlined" endIcon={<CheckIcon/>}
                        loading={loading} loadingPosition="end"
                        style={{width:'100%'}}
                        disabled={disableSubmitButton}
                        onClick={() => handleAddEmployee()}
                        >
                        Approve
                    </LoadingButton>
                </div>
            </div>
        </>
    );
}