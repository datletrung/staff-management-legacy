'use client';

import Link from "next/link";
import Head from 'next/head';
import Notify from '@components/Notify';
import { useState, useEffect } from 'react';
import { TextField, Switch, MenuItem, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel } from '@mui/material';
import baseApiUrl from '@api/apiConfig';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faUsersGear, faLock, faTrash, faCopy, faKey, faArrowsRotate } from '@fortawesome/free-solid-svg-icons';
import { Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';
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
    const [userId] = useState(session?.user?.userId);
    const [employeeList, setEmployeeList] = useState<string[]>([]);
    const [staffFirstName, setStaffFirstName] = useState('');
    const [staffLastName, setStaffLastName] = useState('');
    const [staffEmail, setStaffEmail] = useState('');

    const [staffCurrentViewId, setStaffCurrentViewId] = useState('');
    const [staffCurrentViewFirstName, setStaffCurrentViewFirstName] = useState('');
    const [staffCurrentViewLastName, setStaffCurrentViewLastName] = useState('');
    const [staffCurrentViewEmail, setStaffCurrentViewEmail] = useState('');
    const [staffCurrentViewPhoneNumber, setStaffCurrentViewPhoneNumber] = useState('');

    const [newGeneratedPassword, setNewGeneratedPassword] = useState('');
    const [employeeId, setEmployeeId] = useState('');
    const [promptMsg, setPromptMsg] = useState('');
    const [prevEmployeeData, setPrevEmployeeData] = useState<string[]>([]);
    const [selectedRole, setSelectedRole] = useState('EMPLOYEE');
    const [checkedRemoveSwitch, setCheckedRemoveSwitch] = useState(false);
    const [checkedLockSwitch, setCheckedLockSwitch] = useState(false);
    const [disableLockSwitch, setDisableLockSwitch] = useState(false);
    const [viewStaffOption, setViewStaffOption] = useState(false);
    const [viewStaffAddition, setViewStaffAddition] = useState(false);
    const [viewStaffAdditionPopup, setViewStaffAdditionPopup] = useState(false);
    const [viewResetPassword, setViewResetPassword] = useState(false);
    const [viewResetPasswordMsg, setViewResetPasswordMsg] = useState(false);
    const [viewResetPasswordManual, setViewResetPasswordManual] = useState(false);
    const [loading, setLoading] = useState(false);
    const [profileEditStatus, setProfileEditStatus] = useState(false);
    const [accountEditStatus, setAccountEditStatus] = useState(false);
    const [resetPasswordOption, setResetPasswordOption] = useState('');
    const [resetPasswordNewPass1, setResetPasswordNewPass1] = useState('');
    const [resetPasswordNewPass2, setResetPasswordNewPass2] = useState('');

    function scrolltoHash(elementId: string) {
        const element = document.getElementById(elementId);
        element?.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
    }

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

        setLoading(true);
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
                    para: [staffFirstName, staffLastName, generatedPassword, staffEmail, userId]
                })
            }
            
            response = await fetch(apiUrlEndpoint, postData);
            res = await response.json();
            notifyMsg = `${staffFirstName} ${staffLastName} is added successfully.`;
            setPromptMsg('New Employee Hired');
            setEmployeeId(res.data.insertId.toString().padStart(6, '0'));
        } else if (res.data[0].ACTIVE_FLAG === 'N') {           // if already exist and is not active then set it to active as well as change name
            const staffUserId = res.data[0].USER_ID;
            setEmployeeId(staffUserId.toString().padStart(6, '0'));
            postData = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json '},
                body: JSON.stringify({
                    query: 'submitRehireEmployee',
                    para: [staffFirstName, staffLastName, generatedPassword, userId, staffUserId]
                })
            }
            response = await fetch(apiUrlEndpoint, postData);
            res = await response.json();
            notifyMsg = `${staffFirstName} ${staffLastName} is rehired successfully.`;
            setPromptMsg('Employee Rehired');
        } else {                                                // else if the employee already exist and active
            notifyMsg = `${staffFirstName} ${staffLastName} exists and active in the system.`;
        }
        if (res.error){
            Notify(res.error, 'error');
        } else {
            Notify(notifyMsg, 'info');
            setViewStaffAdditionPopup(true);
        }
        setLoading(false);
        getEmployeeList();
    }

    async function getEmployeeOption(staffUserId: String) {
        setLoading(true);
        const apiUrlEndpoint = `${baseApiUrl}/fetchSql`;
        let postData = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json '},
            body: JSON.stringify({
                query: 'fetchEmployeeOption',
                para: [staffUserId]
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
        setLoading(false);
    }

    async function updateEmployeeOption() {
        const role = selectedRole;
        const active = (checkedRemoveSwitch) ? 'N' : 'Y';
        const locked = (checkedLockSwitch) ? 'Y' : 'N';
        if (prevEmployeeData[0] === role && prevEmployeeData[1] === active && prevEmployeeData[2] === locked) {
            Notify('Nothing changed.', 'error');
            return;
        }
        setLoading(true);
        const apiUrlEndpoint = `${baseApiUrl}/fetchSql`;
        let postData = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json '},
            body: JSON.stringify({
                query: 'setEmployeeOption',
                para: [role, active, locked, userId, staffCurrentViewId]
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
        setLoading(false);
    }

    async function updateEmployeeInfo(){
        if (staffCurrentViewFirstName === '' || staffCurrentViewLastName === '' || staffCurrentViewEmail === ''){
            Notify('Please double check all fields!', 'error');
        } else {
            setLoading(true);
            const apiUrlEndpoint = `${baseApiUrl}/fetchSql`;
            const postData = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json '},
                    body: JSON.stringify({
                            query: 'updatePersonalInfo',
                            para: [staffCurrentViewEmail, staffCurrentViewPhoneNumber, staffCurrentViewFirstName, staffCurrentViewLastName, userId, staffCurrentViewId]
                    })
            }
            const response = await fetch(apiUrlEndpoint, postData);
            const res = await response.json();
            if (res.error){
                Notify(res.error, 'error');
                return;
            }
            Notify('Profile updated!', 'success');
            setProfileEditStatus(false);
            getEmployeeList();
            setLoading(false);
        }
    }

    async function resetPassword(){
        let newPassword = '';
        if (!viewResetPasswordManual){ // generate a random password
            newPassword = generateRandomString(10);
            setNewGeneratedPassword(newPassword);
        } else { // if set password manually
            if (resetPasswordNewPass1 === '' || resetPasswordNewPass2 === '') {
                Notify('Password cannot be empty!', 'error');
                return;
            } else if (resetPasswordNewPass1 != resetPasswordNewPass2) {
                Notify('Passwords do not match!', 'error');
                return;
            } else {
                newPassword = resetPasswordNewPass1;
                setNewGeneratedPassword('********');
            }
        }
        newPassword = createHash('sha256').update(generateRandomString(10)).digest('hex');
        const apiUrlEndpoint = `${baseApiUrl}/fetchSql`;
        const postData = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json '},
                body: JSON.stringify({
                        query: 'resetPassword',
                        para: [newPassword, userId]
                })
        }
        const response = await fetch(apiUrlEndpoint, postData);
        const res = await response.json();
        if (res.error){
            Notify(res.error, 'error');
            return;
        } else if (res.data.affectedRows === 1){
            Notify('Password reset!', 'success');
            setResetPasswordNewPass1('');
            setResetPasswordNewPass2('');
            setViewResetPasswordMsg(true);
            return;
        } else {
            Notify('Something went wrong! Please try again later.', 'error');
            return;
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
            {viewResetPassword && <div className={stylesManagerZoneManageStaff.BlurView} onClick={() => {
                setViewResetPassword(false);
                setViewResetPasswordMsg(false);
                setResetPasswordNewPass1('');
                setResetPasswordNewPass2('');
                setNewGeneratedPassword('');
            }} />}

            <h1><Link href={'/ManagerZone'}>Manager Zone</Link> {`> Manage Staff`}</h1>
            <div className={stylesManagerZoneManageStaff.ViewContainer}>
                <div className={stylesManagerZoneManageStaff.ViewChildFlexColumnLeft}>
                    <div className={stylesManagerZoneManageStaff.Title}>
                        <h2 className={stylesManagerZoneManageStaff.TitleText}>
                            Employee List
                        </h2>
                        <FontAwesomeIcon
                            icon={faArrowsRotate}
                            style={{cursor: 'pointer'}}
                            onClick={() => {
                                getEmployeeList();
                                setViewStaffOption(false);
                            }}
                        />
                    </div>
                    <div className={stylesManagerZoneManageStaff.EmployeeList}>
                        {employeeList.map((item:any, idx:number) => {
                            let staffUserIdTmp = item.USER_ID;
                            let emailTmp = item.EMAIL;
                            let firstNameTmp = item.FIRST_NAME;
                            let lastNameTmp = item.LAST_NAME;
                            let fullNameTmp = item.FIRST_NAME + ' ' + item.LAST_NAME;
                            let phoneTmp = item.PHONE_NUMBER;
                            return (
                            <div key={idx} className={`${stylesManagerZoneManageStaff.EmployeeCardContainer}`}>
                                <FontAwesomeIcon icon={faUser} size="2xl" className={stylesManagerZoneManageStaff.UserIcon}/>
                                <div className={`${stylesManagerZoneManageStaff.EmployeeCard}`}
                                    onClick={() => {
                                        setStaffCurrentViewId((staffUserIdTmp)?staffUserIdTmp:'');
                                        setStaffCurrentViewFirstName((firstNameTmp)?firstNameTmp:'');
                                        setStaffCurrentViewLastName((lastNameTmp)?lastNameTmp:'');
                                        setStaffCurrentViewEmail((emailTmp)?emailTmp:'');
                                        setStaffCurrentViewPhoneNumber((phoneTmp)?phoneTmp:'');

                                        getEmployeeOption(staffUserIdTmp);
                                        setProfileEditStatus(false);
                                        setAccountEditStatus(false);
                                        setDisableLockSwitch(false);
                                        setCheckedLockSwitch(false);
                                        setViewStaffOption(true);
                                        setViewStaffAddition(false);
                                        setViewStaffAdditionPopup(false);
                                        scrolltoHash('detail-info');
                                    }}
                                >
                                    <b>{fullNameTmp}</b>
                                    <small>Staff ID: {staffUserIdTmp.toString().padStart(6, '0')}</small>
                                    <small>Email: {emailTmp}</small>
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
                                    scrolltoHash('detail-info');
                                }}
                                >
                                    Add Employee
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
                <div id='detail-info'
                    className={`${stylesManagerZoneManageStaff.ViewChildFlexColumnRight} ${loading ? stylesManagerZoneManageStaff.LoadingBlur : ''}`}>
                    <div style={{ display: (viewStaffOption) ? 'block' : 'none' }}>
                        <div>
                            <div className={stylesManagerZoneManageStaff.Title}>
                                <h3 className={stylesManagerZoneManageStaff.TitleText}>
                                    Personal Information
                                </h3>
                                <Button
                                    variant="outlined"
                                    endIcon={<EditIcon/>}
                                    className={stylesManagerZoneManageStaff.TitleButton}
                                    onClick={() => {setProfileEditStatus(!profileEditStatus)}}
                                >
                                    EDIT
                                </Button>
                            </div>
                            <div className={stylesManagerZoneManageStaff.FormChild}>
                                <div className={stylesManagerZoneManageStaff.SwitchContainer}>
                                    <b className={stylesManagerZoneManageStaff.InfoTitle}>Staff ID: </b>
                                    <div className={stylesManagerZoneManageStaff.InfoContent}>{staffCurrentViewId.toString().padStart(6, '0')}</div>
                                </div>
                            </div>
                            <div className={stylesManagerZoneManageStaff.FormChild}>
                                <div className={stylesManagerZoneManageStaff.SwitchContainer}>
                                    <b className={stylesManagerZoneManageStaff.InfoTitle}>First Name: </b>
                                    <TextField
                                        variant="standard"
                                        style={{display: (profileEditStatus) ? 'inline-block' : 'none'}}
                                        value={staffCurrentViewFirstName}
                                        onChange={(event) => setStaffCurrentViewFirstName(event.target.value)}
                                    />
                                    <div
                                        className={stylesManagerZoneManageStaff.InfoContent}
                                        style={{display: (profileEditStatus) ? 'none' : 'inline-block'}}
                                    >
                                        {staffCurrentViewFirstName}
                                    </div>
                                </div>
                            </div>
                            <div className={stylesManagerZoneManageStaff.FormChild}>
                                <div className={stylesManagerZoneManageStaff.SwitchContainer}>
                                    <b className={stylesManagerZoneManageStaff.InfoTitle}>Last Name: </b>
                                    <div>
                                        <TextField
                                            variant="standard"
                                            style={{display: (profileEditStatus) ? 'inline-block' : 'none'}}
                                            value={staffCurrentViewLastName}
                                            onChange={(event) => setStaffCurrentViewLastName(event.target.value)}
                                        />
                                        <div
                                            className={stylesManagerZoneManageStaff.InfoContent}
                                            style={{display: (profileEditStatus) ? 'none' : 'inline-block'}}
                                        >
                                            {staffCurrentViewLastName}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={stylesManagerZoneManageStaff.FormChild}>
                                <div className={stylesManagerZoneManageStaff.SwitchContainer}>
                                    <b className={stylesManagerZoneManageStaff.InfoTitle}>Email: </b>
                                    <div>
                                        <TextField
                                            variant="standard"
                                            style={{display: (profileEditStatus) ? 'inline-block' : 'none'}}
                                            value={staffCurrentViewEmail}
                                            onChange={(event) => setStaffCurrentViewEmail(event.target.value)}
                                        />
                                        <div
                                            className={stylesManagerZoneManageStaff.InfoContent}
                                            style={{display: (profileEditStatus) ? 'none' : 'inline-block'}}
                                        >
                                            <a href={`mailto:${staffCurrentViewEmail}`}>{staffCurrentViewEmail}</a>
                                            <span>&nbsp;</span>
                                            <FontAwesomeIcon
                                                icon={faCopy}
                                                style={{cursor: 'pointer', display:(staffCurrentViewEmail) ? 'inline-block' : 'none'}}
                                                onClick={async () => {
                                                    await navigator.clipboard.writeText(staffCurrentViewEmail);
                                                    Notify('Email copied!', 'success')
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={stylesManagerZoneManageStaff.FormChild}>
                                <div className={stylesManagerZoneManageStaff.SwitchContainer}>
                                    <b className={stylesManagerZoneManageStaff.InfoTitle}>Phone Number: </b>
                                    <div>
                                        <TextField
                                            variant="standard"
                                            style={{display: (profileEditStatus) ? 'inline-block' : 'none'}}
                                            value={staffCurrentViewPhoneNumber}
                                            onChange={(event) => {
                                                setStaffCurrentViewPhoneNumber(event.target.value);
                                            }}
                                        />
                                        <div
                                            className={stylesManagerZoneManageStaff.InfoContent}
                                            style={{display: (profileEditStatus) ? 'none' : 'inline-block'}}
                                        >
                                            <a href={`tel:${staffCurrentViewPhoneNumber}`}>{staffCurrentViewPhoneNumber}</a>
                                            <span>&nbsp;</span>
                                            <FontAwesomeIcon
                                                icon={faCopy}
                                                style={{cursor: 'pointer', display:(staffCurrentViewPhoneNumber) ? 'inline-block' : 'none'}}
                                                onClick={async () => {
                                                    await navigator.clipboard.writeText(staffCurrentViewPhoneNumber);
                                                    Notify('Phone number copied!', 'success')
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div
                                className={stylesManagerZoneManageStaff.FormChild}
                                style={{display: (profileEditStatus) ? 'inline-block' : 'none'}}
                            >
                                <div className={stylesManagerZoneManageStaff.ButtonContainer}>
                                    <div className={stylesManagerZoneManageStaff.Button}>
                                        <Button
                                            variant="outlined"
                                            style={{width:'100%'}}
                                            onClick={() => {
                                                updateEmployeeInfo();
                                            }}
                                        >
                                            SAVE
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <hr/>
                        <div>
                            <div className={stylesManagerZoneManageStaff.Title}>
                                <h3 className={stylesManagerZoneManageStaff.TitleText}>
                                    Account Settings
                                </h3>
                                <Button
                                    variant="outlined"
                                    endIcon={<EditIcon/>}
                                    className={stylesManagerZoneManageStaff.TitleButton}
                                    onClick={() => {setAccountEditStatus(!accountEditStatus)}}
                                >
                                    EDIT
                                </Button>
                            </div>
                            <div 
                                style={{display: (accountEditStatus) ? 'block' : 'none'}}
                            >
                                <div className={stylesManagerZoneManageStaff.FormChild}>
                                    <div className={stylesManagerZoneManageStaff.SwitchContainer}>
                                        <label><FontAwesomeIcon icon={faKey}/> Password</label>
                                        <Button
                                            variant="outlined"
                                            className={stylesManagerZoneManageStaff.TitleButton}
                                            onClick={() => {
                                                setViewResetPassword(true);
                                                setViewResetPasswordMsg(false);
                                                setResetPasswordOption('option1');
                                                setViewResetPasswordManual(false);
                                            }}
                                        >
                                            RESET PASSWORD
                                        </Button>
                                    </div>
                                </div>
                                <div className={stylesManagerZoneManageStaff.FormChild}>
                                    <div className={stylesManagerZoneManageStaff.SwitchContainer}>
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
                                    <div className={stylesManagerZoneManageStaff.SwitchContainer}>
                                        <label><FontAwesomeIcon icon={faLock}/> Lock Account</label>
                                        <Switch
                                            checked={checkedLockSwitch}
                                            disabled={disableLockSwitch}
                                            onChange={(event) => { setCheckedLockSwitch(event.target.checked) }}
                                        />
                                    </div>
                                </div>
                                <div className={stylesManagerZoneManageStaff.FormChild}>
                                    <div className={stylesManagerZoneManageStaff.SwitchContainer}>
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
                                                    updateEmployeeOption();
                                                }}
                                            >
                                                SAVE
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>                
                    <div style={{ display: (viewStaffAddition) ? 'block' : 'none' }}>
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
                                <center><h2>{promptMsg}</h2></center>
                                <i>Please share this information with the employee:</i><br/>
                                <span><b>Staff ID:</b> {employeeId}</span>
                                <span><b>Email:</b> {staffEmail}</span>
                                <span><b>Password:</b> {newGeneratedPassword}</span>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: (viewResetPassword) ? 'block' : 'none' }}>
                        <div style={{ display: (viewResetPasswordMsg) ? 'none' : 'block' }}>
                            <div className={stylesManagerZoneManageStaff.PopUp}>
                                <center><h2>Reset Password</h2></center>
                                <FormControl>
                                    <RadioGroup
                                        aria-labelledby="reset-pass-label"
                                        defaultValue='option1'
                                        value={resetPasswordOption}
                                        onChange={(event) => {
                                            const state = event.target.value;
                                            setResetPasswordOption(state);
                                            if (state == 'option1'){
                                                setViewResetPasswordManual(false);
                                            } else {
                                                setViewResetPasswordManual(true);
                                            }
                                        }}
                                    >
                                        <FormControlLabel value="option1" control={<Radio />} label="Generate random password" />
                                        <FormControlLabel value="option2" control={<Radio />} label="Set password manually" />
                                    </RadioGroup>
                                </FormControl>
                                <div style={{ display: (viewResetPasswordManual) ? 'block' : 'none' }}>
                                    <TextField
                                        style={{width: '100%'}}
                                        label="New Password"
                                        variant="standard"
                                        type="password"
                                        value={resetPasswordNewPass1}
                                        onChange={(event) => setResetPasswordNewPass1(event.target.value)}
                                    />
                                    <TextField
                                        style={{width: '100%'}}
                                        label="Confirm New Password"
                                        variant="standard"
                                        type="password"
                                        value={resetPasswordNewPass2}
                                        onChange={(event) => setResetPasswordNewPass2(event.target.value)}
                                    />
                                </div>
                                <br/>
                                <Button
                                    variant="outlined"
                                    style={{width:'100%'}}
                                    onClick={() => {
                                        resetPassword();
                                    }}
                                >
                                    SAVE
                                </Button>
                            </div>
                        </div>
                        <div style={{ display: (viewResetPasswordMsg) ? 'block' : 'none' }}>
                            <div className={stylesManagerZoneManageStaff.PopUp}>
                                <center><h2>Reset Password</h2></center>
                                <i>Please share this information with the employee:</i><br/>
                                <span><b>Staff ID:</b> {staffCurrentViewId.toString().padStart(6, '0')}</span>
                                <span><b>Email:</b> {staffCurrentViewEmail}</span>
                                <span><b>Password:</b> {newGeneratedPassword}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}