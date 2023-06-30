'use client';

import Link from "next/link";
import Head from 'next/head';
import Notify from '@components/Notify';
import { useState, useEffect } from 'react';
import { TextField, Switch, MenuItem } from '@mui/material';
import baseApiUrl from '@api/apiConfig';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faUsersGear, faLock, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Add as AddIcon } from '@mui/icons-material';
import { Button } from '@mui/material';
import Select from '@mui/material/Select';

import { checkPermissions } from '@components/CheckPermission';
import AccessDenied from '@components/AccessDenied';
import { createHash } from 'crypto';

import stylesManagerZoneManageStaff from '@components/css/ManagerZone/ManageStaff.module.css';
import { useSession } from "next-auth/react";

export default function ManagerZoneManageStaff() {
    if (!checkPermissions()) {
        return <AccessDenied/>;
    }
    
    const {data: session} = useSession();
    const [email] = useState(session?.user?.email);
    const [employeeList, setEmployeeList] = useState<String[]>([]);
    const [staffFirstName, setStaffFirstName] = useState('');
    const [staffLastName, setStaffLastName] = useState('');
    const [staffEmail, setStaffEmail] = useState('');
    const [newGeneratedPassword, setNewGeneratedPassword] = useState('');
    const [employeeId, setEmployeeId] = useState('');
    const [prevEmployeeData, setPrevEmployeeData] = useState<String[]>([]);
    const [selectedRole, setSelectedRole] = useState('EMPLOYEE');
    const [checkedRemoveSwitch, setCheckedRemoveSwitch] = useState(false);
    const [checkedLockSwitch, setCheckedLockSwitch] = useState(false);
    const [currentView, setCurrentView] = useState<String[]>([]);
    const [disableLockSwitch, setDisableLockSwitch] = useState(false);
    const [viewStaffOption, setViewStaffOption] = useState(false);
    const [viewStaffAddition, setViewStaffAddition] = useState(false);
    const [viewStaffAdditionPopup, setViewStaffAdditionPopup] = useState(false);

    function generateRandomString(length: number) {
        let result = '';
        const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz234679!@#$%&*_?';
        const charactersLength = characters.length;
        
        for (let i = 0; i < length; i++) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }

        return result;
    }

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

    async function addEmployee() {
        if (staffFirstName === '' || staffLastName === '' || staffEmail === ''){
            Notify('Please enter all required information.', 'error')
            return;
        } else if (!(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(staffEmail))) {
            Notify('Invalid email!', 'error')
            return;
        }
        let generatedPassword = generateRandomString(10);
        setNewGeneratedPassword(generatedPassword);
        generatedPassword = createHash('sha256').update(generatedPassword).digest('hex');

        let notifyMsg = '';
        const apiUrlEndpoint = `${baseApiUrl}/fetchSql`;

        let postData = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json '},
            body: JSON.stringify({
                query: 'checkAddEmployee',
                para: [staffEmail]
            })
        }
        let response = await fetch(apiUrlEndpoint, postData);
        let res = await response.json();
        if (res.data.length === 0) {                            // if employee not exist then add new
            postData = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json '},
                body: JSON.stringify({
                    query: 'submitAddEmployee',
                    para: [staffFirstName, staffLastName, generatedPassword, staffEmail, email]
                })
            }
            
            response = await fetch(apiUrlEndpoint, postData);
            res = await response.json();
            notifyMsg = `${staffFirstName} ${staffLastName} is added successfully.`;
            setViewStaffAdditionPopup(true);
            setEmployeeId(res.data.insertId.toString().padStart(6, '0'));
        } else if (res.data[0].ACTIVE_FLAG === 'N') {           // if already exist and is not active then set it to active as well as change name
            const euser_id = res.data[0].USER_ID;
            setEmployeeId(euser_id.toString().padStart(6, '0'));
            postData = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json '},
                body: JSON.stringify({
                    query: 'submitRehireEmployee',
                    para: [email, staffFirstName, staffLastName, generatedPassword, euser_id]
                })
            }
            
            response = await fetch(apiUrlEndpoint, postData);
            res = await response.json();
            console.log(res);
            notifyMsg = `${staffFirstName} ${staffLastName} is rehired successfully.`;
            setViewStaffAdditionPopup(true);
        } else {                                                // else if the employee already exist and active
            notifyMsg = `${staffFirstName} ${staffLastName} exists and active in the system.`;
        }
        if (res.error){
            Notify(res.error, 'error');
        } else {
            Notify(notifyMsg, 'info');
        }
        getEmployeeList();
    }

    async function getEmployeeOption(eemail: String) {
        const apiUrlEndpoint = `${baseApiUrl}/fetchSql`;
        let postData = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json '},
            body: JSON.stringify({
                query: 'fetchEmployeeOption',
                para: [eemail]
            })
        }
        
        let response = await fetch(apiUrlEndpoint, postData);
        let res = await response.json();
        const role = res.data[0].ROLE;
        const locked = res.data[0].LOCKED_FLAG;
        setPrevEmployeeData([role, 'Y', locked]);

        setSelectedRole(role as string);
        setCheckedRemoveSwitch(false);
        if (locked === 'Y'){
            setCheckedLockSwitch(true);
        } else {
            setCheckedLockSwitch(false);
        }
    }

    async function updateEmployeeOption(eemail: String) {
        const role = selectedRole;
        const active = (checkedRemoveSwitch) ? 'N' : 'Y';
        const locked = (checkedLockSwitch) ? 'Y' : 'N';
        if (prevEmployeeData[0] === role && prevEmployeeData[1] === active && prevEmployeeData[2] === locked) {
            Notify('Nothing changed.', 'error');
            return;
        }

        const apiUrlEndpoint = `${baseApiUrl}/fetchSql`;
        let postData = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json '},
            body: JSON.stringify({
                query: 'setEmployeeOption',
                para: [eemail, email, role, active, locked]
            })
        }
        
        let response = await fetch(apiUrlEndpoint, postData);
        let res = await response.json();
        getEmployeeList();
        
        if (res.error){
            Notify(res.error, 'error');
        } else if (res.data.affectedRows == 1) {
            Notify(`Update setting successfully!`, 'success');
            if (checkedRemoveSwitch) setViewStaffOption(false);
            setPrevEmployeeData([role, active, locked]);
        } else {
            Notify('Something went wrong! Please try again later.', 'error');
        }
    }

    useEffect(() => {
        getEmployeeList();
    }, [])

    return (
        <>
            <Head>
                <title>{`${process.env.WebsiteName}`}</title>
            </Head>

            {viewStaffAdditionPopup && <div className={stylesManagerZoneManageStaff.BlurView} onClick={() => {
                setViewStaffAdditionPopup(false);
                setViewStaffAddition(false);
                setNewGeneratedPassword('');
                setStaffEmail('');
                setStaffFirstName('');
                setStaffLastName('');
            }} />}

            <h1><Link href={'/ManagerZone'}>Manager Zone</Link> {`> Manage Staff`}</h1>
            <div className={stylesManagerZoneManageStaff.ViewContainer}>
                <div className={stylesManagerZoneManageStaff.ViewChildFlexColumnLeft}>
                    <div className={stylesManagerZoneManageStaff.EmployeeList}>
                        {employeeList.map((item:any, idx:number) => {
                            let nameTmp = item.FIRST_NAME + ' ' + item.LAST_NAME;
                            let emailTmp = item.EMAIL;
                            return (
                            <div key={idx} className={`${stylesManagerZoneManageStaff.EmployeeCardContainer}`}>
                                <FontAwesomeIcon icon={faUser} size="2xl" className={stylesManagerZoneManageStaff.UserIcon}/>
                                <div className={`${stylesManagerZoneManageStaff.EmployeeCard}`}
                                    onClick={() => {
                                        setCurrentView([emailTmp, nameTmp]);
                                        getEmployeeOption(emailTmp);
                                        setDisableLockSwitch(false);
                                        setCheckedLockSwitch(false);
                                        setViewStaffOption(true);
                                        setViewStaffAddition(false);
                                        setViewStaffAdditionPopup(false);
                                    }}
                                >
                                    <b>{nameTmp}</b>
                                    <i><small>{emailTmp}</small></i>
                                </div>
                            </div>
                            );                    
                        })}
                        <div className={stylesManagerZoneManageStaff.ButtonContainer}>
                            <div className={stylesManagerZoneManageStaff.Button}>
                                <Button
                                variant="outlined" endIcon={<AddIcon/>}
                                style={{width:'100%'}}
                                onClick={() => {
                                    setViewStaffOption(false);
                                    setViewStaffAddition(true);
                                    setViewStaffAdditionPopup(false);
                                }}
                                >
                                    Add Employee
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={stylesManagerZoneManageStaff.ViewChildFlexColumnRight} style={{ display: (viewStaffOption) ? 'block' : 'none' }}>
                    <div>
                        <center><h2>{currentView[1]}</h2></center>
                        <div className={stylesManagerZoneManageStaff.FormChild}>
                            <div className={`${stylesManagerZoneManageStaff.SwitchContainer} ${stylesManagerZoneManageStaff.SwitchSpace}`}>
                                <label><FontAwesomeIcon icon={faUsersGear}/> Change Role</label>
                                <Select
                                    variant='standard'
                                    value={selectedRole}
                                    onChange={(event) => { setSelectedRole(event.target.value as string); }}
                                    >
                                    <MenuItem value='EMPLOYEE'>Employee</MenuItem>
                                    <MenuItem value='MANAGER'>Manager</MenuItem>
                                    <MenuItem value='SYSADMIN'>SysAdmin</MenuItem>
                                </Select>
                            </div>
                        </div>
                        <div className={stylesManagerZoneManageStaff.FormChild}>
                            <div className={`${stylesManagerZoneManageStaff.SwitchContainer} ${stylesManagerZoneManageStaff.SwitchSpace}`}>
                                <label><FontAwesomeIcon icon={faLock}/> Lock Account</label>
                                <Switch
                                    checked={checkedLockSwitch}
                                    disabled={disableLockSwitch}
                                    onChange={(event) => { setCheckedLockSwitch(event.target.checked) }}
                                />
                            </div>
                        </div>
                        <div className={stylesManagerZoneManageStaff.FormChild}>
                            <div className={`${stylesManagerZoneManageStaff.SwitchContainer} ${stylesManagerZoneManageStaff.SwitchSpace}`}>
                            <label><FontAwesomeIcon icon={faTrash}/> Remove Account</label>
                                <Switch
                                    checked={checkedRemoveSwitch}
                                    onChange={(event) => {
                                        const state = event.target.checked;
                                        setCheckedRemoveSwitch(state);
                                        setDisableLockSwitch(state);
                                        setCheckedLockSwitch(true);
                                    }}
                                />
                            </div>
                        </div>
                        <div className={stylesManagerZoneManageStaff.FormChild}>
                            <div className={stylesManagerZoneManageStaff.ButtonContainer}>
                                <div className={stylesManagerZoneManageStaff.Button}>
                                    <Button
                                        variant="outlined"
                                        style={{width:'100%'}}
                                        onClick={() => {
                                            updateEmployeeOption(currentView[0]);
                                        }}
                                    >
                                        SAVE
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className={stylesManagerZoneManageStaff.ViewChildFlexColumnRight} style={{ display: (viewStaffAddition) ? 'block' : 'none' }}>
                    <div style={{ display: (viewStaffAdditionPopup) ? 'none' : 'block' }}>
                        <div>
                            <center><h2>Hire New Employee</h2></center>
                            <div className={stylesManagerZoneManageStaff.FormChild}>
                                <TextField
                                    required
                                    label="First Name"
                                    variant="standard"
                                    style={{width:'100%'}}
                                    value={staffFirstName}
                                    onChange={(event) => setStaffFirstName(event.target.value)}
                                />
                            </div>
                            <div className={stylesManagerZoneManageStaff.FormChild}>
                                <TextField
                                    required
                                    label="Last Name"
                                    variant="standard"
                                    style={{width:'100%'}}
                                    value={staffLastName}
                                    onChange={(event) => setStaffLastName(event.target.value)}
                                />
                            </div>
                            <div className={stylesManagerZoneManageStaff.FormChild}>
                                <TextField
                                    required
                                    label="Email"
                                    type='email'
                                    variant="standard"
                                    style={{width:'100%'}}
                                    value={staffEmail}
                                    onChange={(event) => setStaffEmail(event.target.value)}
                                />
                            </div>
                            <div className={stylesManagerZoneManageStaff.FormChild}>
                                <div className={stylesManagerZoneManageStaff.ButtonContainer}>
                                    <div className={stylesManagerZoneManageStaff.Button}>
                                        <Button
                                            variant="outlined" endIcon={<AddIcon/>}
                                            style={{width:'100%'}}
                                            onClick={() => addEmployee()}
                                        >
                                            Add
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: (viewStaffAdditionPopup) ? 'block' : 'none' }}>
                        <div className={stylesManagerZoneManageStaff.PopUp}>
                            <center><h2>Employee added</h2></center>
                            <i>Please share this information with the employee:</i><br/>
                            <span><b>Staff ID:</b> {employeeId}</span>
                            <span><b>Email:</b> {staffEmail}</span>
                            <span><b>Password:</b> {newGeneratedPassword}</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}