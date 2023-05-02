'use client';

import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Calendar from 'react-calendar';
import Notify from '../components/Notify';
import { checkPermissions } from '../components/CheckPermission';
import AccessDenied from '../components/AccessDenied';

import { LoadingButton } from '@mui/lab';
import { TextField, Switch, MenuItem } from '@mui/material';
import Select from '@mui/material/Select';
import {Add as AddIcon
      ,Check as CheckIcon
      ,Send as SendIcon
} from '@mui/icons-material';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft
        ,faEllipsisVertical
        ,faLock
        ,faTrash
        ,faUsersGear
} from '@fortawesome/free-solid-svg-icons';

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
    const [disableAddEmployeeSubmitButton, setDisableAddEmployeeSubmitButton] = useState(true);
    const [disableApproveButton, setDisableApproveButton] = useState(true);
    const [efirstName, setFirstName] = useState('');
    const [elastName, setLastName] = useState('');
    const [eemail, setEmail] = useState('');
    const [employeeList, setEmployeeList] = useState<String[]>([]);
    const [date, setDate] = useState(new Date());
    const [addNewEmployeeView, setAddNewEmployeeView] = useState(false);
    const [employeeOptionView, setEmployeeOptionView] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [currentView, setCurrentView] = useState<String[]>([]);
    const [prevDate, setPrevDate] = useState(new Date('0001-01-01'));
    const [timePunchData, setTimePunchData] = useState<any[]>([]);
    const [timePunchMonthData, setTimePunchMonthData] = useState<String[]>([]);
    const [totalTime, setTotalTime] = useState(0);
    const [totalBreakTime, setTotalBreakTime] = useState(0);
    const [totalWorkingTime, setTotalWorkingTime] = useState(0);
    const [calendarIsSelected, setCalendarIsSelected] = useState(false);
    const [checkedAutoApproveSwitch, setCheckedAutoApproveSwitch] = useState(false);
    const [checkedLockSwitch, setCheckedLockSwitch] = useState(false);
    const [checkedRemoveSwitch, setCheckedRemoveSwitch] = useState(false);
    const [disableAutoApproveSwitch, setDisableAutoApproveSwitch] = useState(false);
    const [disableLockSwitch, setDisableLockSwitch] = useState(false);
    const [selectedRole, setSelectedRole] = useState('EMPLOYEE');
    const [prevEmployeeData, setPrevEmployeeData] = useState<String[]>([]);

    async function getEmployeeList() {
        const apiUrlEndpoint = 'api/fetchSql';
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
    
    function validateAddEmployeeForm() {
        if (eemail.match(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/) && efirstName && elastName && eemail) {
            setDisableAddEmployeeSubmitButton(false);
        } else {
            setDisableAddEmployeeSubmitButton(true);
        }
    }

    async function handleAddEmployee() {
        if (!efirstName || !elastName || !eemail) Notify('Please enter all required information.', 'warn')
        setLoading(true);
        let notifyMsg = '';
        const apiUrlEndpoint = 'api/fetchSql';

        let postData = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json '},
            body: JSON.stringify({
                query: 'checkAddEmployee',
                para: [eemail]
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
                    para: [efirstName, elastName, eemail, email]
                })
            }
            
            response = await fetch(apiUrlEndpoint, postData);
            res = await response.json();
            notifyMsg = `${efirstName} ${elastName} is added successfully.`;
        } else if (res.data[0].ACTIVE_FLAG === 'N') {           // if already exist and is not active then set it to active as well as change name
            const euser_id = res.data[0].USER_ID;
            postData = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json '},
                body: JSON.stringify({
                    query: 'submitRehireEmployee',
                    para: [email, efirstName, elastName, euser_id]
                })
            }
            
            response = await fetch(apiUrlEndpoint, postData);
            res = await response.json();
            notifyMsg = `${efirstName} ${elastName} is rehired successfully.`;
        } else {                                                // else if the employee already exist and active
            notifyMsg = `${efirstName} ${elastName} exists and active in the system.`;
        }
        setLoading(false);
        if (res.error){
            Notify(res.error, 'error');
        } else {
            Notify(notifyMsg, 'info');
        }
        getEmployeeList();
    }

    async function getTimeEntryPerDay(eemail: any, datePara: Date) {
        if (typeof(datePara) === 'undefined') return;
        setLoading(true);
        let formattedDate = datePara.toLocaleString("en-US", {timeZone:'America/Halifax', year: 'numeric', month: '2-digit', day: '2-digit'});
        const apiUrlEndpoint = 'api/fetchSql';
        let postData = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json '},
                body: JSON.stringify({
                        query: 'fetchTimeEntryDayQuery',
                        para: [formattedDate, eemail]
                })
        }
        
        let response = await fetch(apiUrlEndpoint, postData);
        let res = await response.json();
        setTimePunchData(res.data);

        let n_totalTime = 0;
        res.data.forEach((item: {DATE: String, TIME_IN: String, TIME_OUT: String}) => {
            const [hours1, minutes1, second1] = (item.TIME_IN) ? item.TIME_IN.split(":").map(Number) : [0, 0, 0];
            const [hours2, minutes2, second2] = (item.TIME_OUT) ? item.TIME_OUT.split(":").map(Number) : [null, null, null];
            
            if (hours2 !== null && minutes2 !== null && second2 !== null){       // normal TIME_IN and TIME_OUT
                n_totalTime += Math.abs(Math.floor((hours2 - hours1) * 60 + (minutes2 - minutes1) + (second2 - second1) / 60));
            } else {                                                             // if TIME_OUT missing
                let [hours3, minutes3, second3] = [0, 0, 0];
                if (item.DATE != new Date().toLocaleString("en-US", {timeZone: 'America/Halifax', year: 'numeric', month: '2-digit', day: '2-digit'})) {    // if not today (in the past) means the day has pass and no more time out
                    [hours3, minutes3, second3] = [23, 59, 59];
                } else {                                                                                                                                    // if not end of the day then calculate to the current time
                    [hours3, minutes3, second3] = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }).split(":").map(Number);
                }
                n_totalTime += Math.abs(Math.floor((hours3 - hours1) * 60 + (minutes3 - minutes1) + (second3 - second1) / 60));
            }
        });
        
        setTotalTime(Math.max(0, Math.floor(n_totalTime)));

        postData = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json '},
                body: JSON.stringify({
                        query: 'fetchBreakDayQuery',
                        para: [email, formattedDate]
                })
        }
        
        response = await fetch(apiUrlEndpoint, postData);
        res = await response.json();
        let n_breakTime = res.data[0].BREAK_NUM*30;
        setTotalBreakTime(n_breakTime);

        setTotalWorkingTime(Math.max(0, Math.floor((n_totalTime-n_breakTime))));
        

        setLoading(false);
        if (datePara.setHours(0,0,0,0) == new Date().setHours(0,0,0,0)){
            setDisabled(false);
        } else {
            setDisabled(true);
        }
    }

    async function getTimeEntryPerMonth(eemail: any, datePara: Date, forceRefresh: boolean) {
        if (!forceRefresh
            && (datePara.getMonth() === prevDate.getMonth() && datePara.getFullYear() === prevDate.getFullYear())
        ){
        return;
        } else {
        setPrevDate(datePara);
        }
        let formattedDate = datePara.toLocaleString("en-US", {timeZone: 'America/Halifax', year: 'numeric', month: '2-digit'});
        const apiUrlEndpoint = 'api/fetchSql';
        const postData = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json '},
            body: JSON.stringify({
                query: 'fetchTimeEntryMonthQuery',
                para: [eemail, formattedDate]
            })
        }
        
        const response = await fetch(apiUrlEndpoint, postData);
        const res = await response.json();
        let data = res.data;
        let tmp: Array<String> = [];
        data.forEach((item: { DATE: String }) => {
        let time = item.DATE;
        tmp.push(time);
        });
        setTimePunchMonthData(tmp);
    }
    
    async function getAutoApproveSetting() {
        const apiUrlEndpoint = 'api/fetchSql';
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
        const apiUrlEndpoint = 'api/fetchSql';
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
            Notify(`Setting updated successfully.`, 'info');
        } else {
            Notify('Something went wrong! Please try again later.', 'error');
        }
    }

    async function handleApprove(eemail: any, datePara: Date) {
        if (typeof(datePara) === 'undefined') return;
        setLoading(true);
        let formattedDate = datePara.toLocaleString("en-US", {timeZone:'America/Halifax', year: 'numeric', month: '2-digit', day: '2-digit'});
        const apiUrlEndpoint = 'api/fetchSql';
        let postData = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json '},
            body: JSON.stringify({
                query: 'approveTimeSheet',
                para: [email, eemail, formattedDate]
            })
        }
        
        let response = await fetch(apiUrlEndpoint, postData);
        let res = await response.json();

        setLoading(false);
        if (res.error){
            Notify(res.error, 'error');
        } else {
            Notify(`Approved.`, 'info');
        }
    }

    async function getEmployeeOption(eemail: String) {
        setLoading(true);
        const apiUrlEndpoint = 'api/fetchSql';
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
        setLoading(false);
    }

    async function setEmployeeOption(eemail: String) {
        const role = selectedRole;
        const active = (checkedRemoveSwitch) ? 'N' : 'Y';
        const locked = (checkedLockSwitch) ? 'Y' : 'N';
        if (prevEmployeeData[0] === role && prevEmployeeData[1] === active && prevEmployeeData[2] === locked) {
            Notify('Nothing changed.', 'error');
            return;
        }
        setLoading(true);

        const apiUrlEndpoint = 'api/fetchSql';
        let postData = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json '},
            body: JSON.stringify({
                query: 'setEmployeeOption',
                para: [eemail, role, active, locked]
            })
        }
        
        let response = await fetch(apiUrlEndpoint, postData);
        let res = await response.json();
        setLoading(false);
        getEmployeeList();
        
        if (res.error){
            Notify(res.error, 'error');
        } else if (res.data.affectedRows == 1) {
            Notify(`Update setting successfully.`, 'info');
            setPrevEmployeeData([role, active, locked]);
        } else {
            Notify('Something went wrong! Please try again later.', 'error');
        }
    }

    function tileContent(datePara: any) {
        let formattedDate = datePara.date.toLocaleString("en-US", {timeZone: 'America/Halifax', year: 'numeric', month: '2-digit', day: '2-digit'});
        if (timePunchMonthData.includes(formattedDate)) {
          return (
            <div
              style={{
                backgroundColor: '#39FF14',
                width: '100%',
                height: '5px',
              }}
            >
            </div>
          );
        }
        return null;
    }

    async function getTotalWorkingTime(eemail: String, duration: Number) {
        const apiUrlEndpoint = 'api/fetchSql';
        let postData = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json '},
            body: JSON.stringify({
                query: 'fetchTotalWorkingTime',
                para: [eemail, duration]
            })
        }
        
        let response = await fetch(apiUrlEndpoint, postData);
        let res = await response.json();
        const data = res.data;
        console.log(data);
    }

    useEffect(() => {
        getAutoApproveSetting();
        getEmployeeList();
    }, [])

    return (
        <>
            <Head>
                <title>{`Manager Zone | ${process.env.WebsiteName}`}</title>
            </Head>
            {addNewEmployeeView && <div className={stylesManagerZone.BlurView} onClick={() => setAddNewEmployeeView(false)} />}
            {employeeOptionView && <div className={stylesManagerZone.BlurView} onClick={() => setEmployeeOptionView(false)} />}

            <h1>Manager Zone</h1>
            <h3>Approve Time Sheet</h3>

            <div>
                <div className={stylesManagerZone.TimeSheetContainer}>
                    <div className={stylesManagerZone.CalendarChildFlexColumnLeft}> {/* Employee List and Calendar */}
                        <div className={stylesManagerZone.SwitchContainer}> {/* Always display */}
                            <label>Auto Approve</label>
                            <Switch
                                checked={checkedAutoApproveSwitch}
                                disabled={disableAutoApproveSwitch}
                                onChange={(event) => {
                                    const state = event.target.checked;
                                    (state) ? setDisableApproveButton(true) : setDisableApproveButton(false);
                                    setCheckedAutoApproveSwitch(state);
                                    setAutoApproveSetting(state);
                                }}
                            />
                        </div>
                        <div className={stylesManagerZone.EmployeeList} style={{ display: (currentStep == 1) ? 'block' : 'none' }}> {/* Step 1 */}
                            {employeeList.map((item:any, idx:number) => {
                                let ename = item.FIRST_NAME + ' ' + item.LAST_NAME;
                                let eemail = item.EMAIL;
                                return (
                                <div key={idx} className={`${stylesManagerZone.EmployeeCardContainer}`}>
                                    <div className={`${stylesManagerZone.EmployeeCard}`}
                                        onClick={() => {
                                            setCurrentView([eemail, ename]);
                                            getTimeEntryPerMonth(eemail, new Date(), true);
                                            setCurrentStep(2);
                                        }}
                                    >
                                        <b>{ename}</b>
                                        <i><small>{eemail}</small></i>
                                    </div>
                                    <div className={`${stylesManagerZone.EmployeeCardOption}`}
                                        onClick={() => {
                                            setCurrentView([eemail, ename]);
                                            getEmployeeOption(eemail);
                                            setEmployeeOptionView(true);
                                        }}
                                    >
                                        <div style={{margin: "0 10px 0 10px"}}><FontAwesomeIcon icon={faEllipsisVertical}/></div>
                                    </div>
                                </div>
                                );                    
                            })}
                            <div className={stylesManagerZone.ButtonContainer}>
                                <div className={stylesManagerZone.Button}>
                                    <LoadingButton
                                    size="large" variant="outlined" endIcon={<AddIcon/>}
                                    style={{width:'100%'}}
                                    onClick={() => { setAddNewEmployeeView(true) }}
                                    >
                                        Add Employee
                                    </LoadingButton>
                                </div>
                            </div>
                        </div>
                        <div  style={{ display: (currentStep == 2) ? 'block' : 'none' }}> {/* Step 2 */}
                            <button
                                className={stylesManagerZone.CustomButton}
                                onClick={() => {
                                    setCalendarIsSelected(false);
                                    setCurrentStep(1);
                                }}
                            >
                                <FontAwesomeIcon icon={faArrowLeft}/> {currentView[1]}
                            </button>
                            <Calendar className={stylesManagerZone.CalendarContainer}
                                locale='en-US'
                                onChange={(datePara: any) => {
                                        setDate(datePara);
                                        setCalendarIsSelected(true);
                                        getTimeEntryPerDay(currentView[0], datePara);
                                        getTimeEntryPerMonth(currentView[0], datePara, false);
                                    }}
                                value={date}
                                tileContent={tileContent}
                            />
                            <div className={stylesManagerZone.ButtonContainer}>
                                <div className={stylesManagerZone.Button}>
                                    <LoadingButton
                                        size="large" variant="outlined" endIcon={<CheckIcon/>}
                                        loading={loading} loadingPosition="end"
                                        style={{width:'100%'}}
                                        disabled={disableApproveButton}
                                        onClick={() => handleApprove(currentView[0], date)}
                                    >
                                        Approve
                                    </LoadingButton>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={stylesManagerZone.CalendarChildFlexColumnRight} style={{ display: (calendarIsSelected) ? 'block' : 'none' }}> {/* Time Punch Table */}
                        <div className={`${stylesManagerZone.TimePunchView} ${loading ? stylesManagerZone.TimePunchViewBlur : ''} `}>
                            {timePunchData.map((item:any, idx:number) => {
                                let timeIn = (item.TIME_IN) ? item.TIME_IN.split(":").map(String)[0]+':'+item.TIME_IN.split(":").map(String)[1] : '-';
                                let timeOut = (item.TIME_OUT) ? item.TIME_OUT.split(":").map(String)[0]+':'+item.TIME_OUT.split(":").map(String)[1] : '-';
                                return (
                                <div key={idx} className={stylesManagerZone.TimeCard}>
                                    <b className={stylesManagerZone.TimeCardIn}>{timeIn}</b> <b className={stylesManagerZone.TimeCardOut}>{timeOut}</b>
                                </div>
                                );
                            })}
                            <hr/>
                            <div className={stylesManagerZone.TimeCardSummary}>
                            <b>Total Time</b>
                            <b>{Math.floor(totalTime/60)}:{(totalTime%60).toString().padStart(2, '0')} hr</b>
                            </div>
                            {(totalBreakTime != 0) ?
                            <>
                            <div className={stylesManagerZone.TimeCardSummary}>
                                <b>Break</b>
                                <b>- {Math.floor(totalBreakTime/60)}:{(totalBreakTime%60).toString().padStart(2, '0')} hr</b>
                            </div>
                            </> : null
                            }
                            <hr/>
                            <div className={stylesManagerZone.TimeCardSummary}>
                            <b>Total Working Time</b>
                            <b>{Math.floor(totalWorkingTime/60)}:{(totalWorkingTime%60).toString().padStart(2, '0')} hr</b>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: (addNewEmployeeView) ? 'block' : 'none' }}>
                <div className={stylesManagerZone.FormContainer}>
                    <div className={stylesManagerZone.FormChild}>
                        <TextField
                            required
                            label="First Name"
                            variant="standard"
                            style={{width:'100%'}}
                            disabled={disabled}
                            onChange={(event) => {setFirstName(event.target.value); validateAddEmployeeForm();}}
                        />
                    </div>
                    <div className={stylesManagerZone.FormChild}>
                        <TextField
                            required
                            label="Last Name"
                            variant="standard"
                            style={{width:'100%'}}
                            disabled={disabled}
                            onChange={(event) => {setLastName(event.target.value); validateAddEmployeeForm();}}
                        />
                    </div>
                    <div className={stylesManagerZone.FormChild}>
                        <TextField
                            required
                            label="Email"
                            variant="standard"
                            style={{width:'100%'}}
                            disabled={disabled}
                            onChange={(event) => {setEmail(event.target.value); validateAddEmployeeForm();}}
                        />
                    </div>
                    <div className={stylesManagerZone.FormChild}>
                        <div className={stylesManagerZone.ButtonContainer}>
                            <div className={stylesManagerZone.Button}>
                                <LoadingButton
                                    size="large" variant="outlined" endIcon={<AddIcon/>}
                                    loading={loading} loadingPosition="end"
                                    style={{width:'100%'}}
                                    disabled={disableAddEmployeeSubmitButton}
                                    onClick={() => handleAddEmployee()}
                                >
                                    Add
                                </LoadingButton>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            
            <div style={{ display: (employeeOptionView) ? 'block' : 'none' }}>
                <div className={stylesManagerZone.FormContainer}>
                    <h3>{currentView[1]}</h3>
                    <div className={stylesManagerZone.FormChild}>
                        <div className={`${stylesManagerZone.SwitchContainer} ${stylesManagerZone.SwitchSpace}`}>
                            <label><FontAwesomeIcon icon={faUsersGear}/> Change Role</label>
                            <Select
                                value={selectedRole}
                                onChange={(event) => { setSelectedRole(event.target.value as string); }}
                                >
                                <MenuItem value='EMPLOYEE'>Employee</MenuItem>
                                <MenuItem value='MANAGER'>Manager</MenuItem>
                                <MenuItem value='SYSADMIN'>SysAdmin</MenuItem>
                            </Select>
                        </div>
                    </div>
                    <div className={stylesManagerZone.FormChild}>
                        <div className={`${stylesManagerZone.SwitchContainer} ${stylesManagerZone.SwitchSpace}`}>
                            <label><FontAwesomeIcon icon={faLock}/> Lock Account</label>
                            <Switch
                                checked={checkedLockSwitch}
                                disabled={disableLockSwitch}
                                onChange={(event) => { setCheckedLockSwitch(event.target.checked) }}
                            />
                        </div>
                    </div>
                    <div className={stylesManagerZone.FormChild}>
                        <div className={`${stylesManagerZone.SwitchContainer} ${stylesManagerZone.SwitchSpace}`}>
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
                    <div className={stylesManagerZone.FormChild}>
                        <div className={stylesManagerZone.ButtonContainer}>
                            <div className={stylesManagerZone.Button}>
                                <LoadingButton
                                    size="large" variant="outlined" endIcon={<SendIcon/>}
                                    loading={loading} loadingPosition="end"
                                    style={{width:'100%'}}
                                    onClick={() => {
                                        setEmployeeOption(currentView[0]);
                                        setEmployeeOptionView(false);
                                    }}
                                >
                                    Submit
                                </LoadingButton>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}