'use client';

import Link from "next/link";
import Head from 'next/head';
import Notify from '@components/Notify';
import { useState, useEffect } from 'react';
import baseApiUrl from '@api/apiConfig';

import { Button, Autocomplete, TextField } from '@mui/material';
import Calendar from 'react-calendar';
import { checkPermissions } from '@components/CheckPermission';
import AccessDenied from '@components/AccessDenied';

import 'react-calendar/dist/Calendar.css';
import styles from '@components/css/ManagerZone/ManageAbsence.module.css';
import { useSession } from "next-auth/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faXmark, faTrash } from '@fortawesome/free-solid-svg-icons';


export default function ManagerZoneManageAbsence() {
    if (!checkPermissions()) {
        return <AccessDenied/>;
    }

    const {data: session} = useSession();
    const [userId] = useState(session?.user?.userId);
    const [employeeList, setEmployeeList] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [employeeId, setEmployeeId] = useState('');
    const [employeeName, setEmployeeName] = useState('');
    const [activeStartDate, setActiveStartDate] = useState(new Date());
    
    const [absenceTableData, setAbsenceTableData] = useState<any[]>([]);
    const [absenceCalendarData, setAbsenceCalendarData] = useState<any[]>([]);
    const [viewAbsence, setViewAbsence] = useState(false);
    const [viewPopUpConfirm, setViewPopUpConfirm] = useState(false);
    const [absenceId, setAbsenceId] = useState();

    const filterOptions = (options: any[], { inputValue }: any) => {
        return options.filter(
          (option: { USER_ID: string; EMAIL: string; FULL_NAME: string; }) =>
            option.USER_ID.toString().toLowerCase().includes(inputValue.toLowerCase()) ||
            option.EMAIL.toLowerCase().includes(inputValue.toLowerCase()) ||
            option.FULL_NAME.toLowerCase().includes(inputValue.toLowerCase())
        );
    };

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
        if (res.error) {
            Notify('Something went wrong! Please try again later.', 'error');
            return;
        }
        const data = res.data;
        data.forEach((item: any) => {
            item.USER_ID = item.USER_ID.toString().padStart(6, '0');
        });
        setEmployeeList(data);
    }

    async function refreshStatus() {
        await getAbsencePerTable(employeeId);
        await getAbsenceCalendar(employeeId, activeStartDate);
    }

    async function getAbsencePerTable(employeeIdPara: any) {
        setLoading(true);
        const apiUrlEndpoint = `${baseApiUrl}/fetchSql`;
        let postData = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json '},
                body: JSON.stringify({
                        query: 'fetchAbsenceTable',
                        para: [employeeIdPara]
                })
        }
        
        let response = await fetch(apiUrlEndpoint, postData);
        let res = await response.json();
        let data = res.data;
        setAbsenceTableData(data);

        setLoading(false);
    }

    async function getAbsenceCalendar(employeeIdPara: any, datePara: any) {
        let formattedDate = new Date(datePara).toLocaleString("en-US", {timeZone: 'America/Halifax', year: 'numeric', month: '2-digit'});
        const apiUrlEndpoint = `${baseApiUrl}/fetchSql`;
        const postData = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json '},
                body: JSON.stringify({
                        query: 'fetchAbsenceCalendar',
                        para: [formattedDate, employeeIdPara]
                })
        }
        
        const response = await fetch(apiUrlEndpoint, postData);
        const res = await response.json();
        let data = res.data;
        setAbsenceCalendarData(data);
    }

    async function updateApprovalStatusAbsence(status: any) {
        if (!['APPROVED', 'REJECTED'].includes(status)){
            Notify('Invalid option.', 'error');
            return;
        }
        setLoading(true);
        const apiUrlEndpoint = `${baseApiUrl}/fetchSql`;
        const postData = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json '},
                body: JSON.stringify({
                        query: 'updateApprovalStatusAbsence',
                        para: [status, userId, employeeId]
                })
        }        
        const response = await fetch(apiUrlEndpoint, postData);
        const res = await response.json();
        setLoading(false);
        if (res.error){
            Notify(res.error, 'error');
        }
        refreshStatus();
    }

    async function approveAbsence(absenceIdPara: any) {
        setLoading(true);
        const apiUrlEndpoint = `${baseApiUrl}/fetchSql`;
        const postData = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json '},
                body: JSON.stringify({
                        query: 'approveAbsence',
                        para: [userId, employeeId, absenceIdPara]
                })
        }        
        const response = await fetch(apiUrlEndpoint, postData);
        const res = await response.json();
        setLoading(false);
        if (res.error){
            Notify(res.error, 'error');
        }
        refreshStatus();
    }

    async function rejectAbsence(absenceIdPara: any) {
        setLoading(true);
        const apiUrlEndpoint = `${baseApiUrl}/fetchSql`;
        const postData = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json '},
                body: JSON.stringify({
                        query: 'rejectAbsence',
                        para: [userId, employeeId, absenceIdPara]
                })
        }        
        const response = await fetch(apiUrlEndpoint, postData);
        const res = await response.json();
        setLoading(false);
        if (res.error){
            Notify(res.error, 'error');
        }
        refreshStatus();
    }

    async function deleteAbsence() {
        setLoading(true);
        const apiUrlEndpoint = `${baseApiUrl}/fetchSql`;
        const postData = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json '},
                body: JSON.stringify({
                        query: 'deleteAbsence',
                        para: [employeeId, absenceId]
                })
        }        
        const response = await fetch(apiUrlEndpoint, postData);
        const res = await response.json();
        setLoading(false);
        if (res.error){
            Notify(res.error, 'error');
        }
        setViewPopUpConfirm(false);
        refreshStatus();
    }    

    function tileContent(datePara: any) {
        const formattedDate = datePara.date.toLocaleString("en-US", { timeZone: 'America/Halifax', year: 'numeric', month: '2-digit', day: '2-digit' });
        
        const item = absenceCalendarData.find((item) => item.ABSENCE_DAY === formattedDate);
      
        if (item) {
            const { APPROVAL_STATUS } = item;
            let backgroundColor = '';
            
            if (APPROVAL_STATUS === 'APPROVED') {
                backgroundColor = 'green';
            } else if (APPROVAL_STATUS === 'REJECTED') {
                backgroundColor = 'red';
            } else if (APPROVAL_STATUS === 'PENDING') {
                backgroundColor = 'orange';
            }
            
            return (
                <div
                style={{
                    backgroundColor,
                    width: '100%',
                    height: '5px',
                }}
                ></div>
            );
        }
        return null;
    }
      

    useEffect(() => {
        getEmployeeList();
    }, [])

    return (
        <>
            {viewPopUpConfirm && <div className={styles.BlurView} onClick={() => {
                setViewPopUpConfirm(false);
            }} />}

            <Head>
                <title>{`Manage Absence | ${process.env.WebsiteName}`}</title>
            </Head>
            <h2><Link href={'/ManagerZone'} style={{textDecoration: 'underline'}}>Manager Zone</Link> &#x2022; {`Manage Absence`}</h2>
            
            <div className={styles.ViewContainer}>
                <div className={styles.ViewChildFlexColumnLeft}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <hr style={{ flex: 1, marginRight: '10px' }} />
                        <h4>Employee Details</h4>
                        <hr style={{ flex: 1, marginLeft: '10px' }} />
                    </div>
                    <div className={styles.FilterContainer}>
                        <span className={styles.FilterTitle}>Employee</span>
                        <Autocomplete
                            options={employeeList}
                            autoHighlight
                            filterOptions={filterOptions}
                            getOptionLabel={(option: any) => option.FULL_NAME}
                            onChange={(event, value) => {
                                if (value){
                                    setEmployeeId(value.USER_ID);
                                    setEmployeeName(value.FULL_NAME);
                                    getAbsencePerTable(value.USER_ID);
                                    getAbsenceCalendar(value.USER_ID, activeStartDate);
                                    setViewAbsence(true);
                                } else {
                                    setEmployeeId('');
                                    setEmployeeName('');
                                    setViewAbsence(false);
                                    setAbsenceTableData([]);
                                    setAbsenceCalendarData([]);
                                }
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    variant='standard'
                                    autoComplete='off'
                                    style={{width:'100%'}}
                                />
                            )}
                            style={{ width: '100%' }}
                        />
                    </div><br/>
                    <Calendar className={styles.CalendarContainer}
                        locale='en-US'
                        activeStartDate={activeStartDate}
                        onActiveStartDateChange={(date: any) => {
                            setActiveStartDate(date.activeStartDate);
                            getAbsenceCalendar(employeeId, date.activeStartDate);
                        }}
                        tileContent={tileContent}
                    />
                </div>
                <div className={`${styles.ViewChildFlexColumnRight} ${loading ? styles.LoadingBlur : ''}`}>
                    
                
                    <div style={{ display: (viewAbsence) ? 'block' : 'none' }}>
                        <div className={`${styles.AbsenceView} ${loading ? styles.AbsenceViewBlur : ''} `}>
                            <center>
                                <h2>{employeeName}</h2>
                            </center>
                            <div className={styles.ButtonContainer}>
                                <Button
                                    variant="outlined"
                                    color="success"
                                    style={{width:'100%'}}
                                    onClick={() => updateApprovalStatusAbsence('APPROVED')}
                                >
                                    APPROVE ALL
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    style={{width:'100%'}}
                                    onClick={() => updateApprovalStatusAbsence('REJECTED')}
                                >
                                    REJECT ALL
                                </Button>
                            </div>
                            <table className={styles.Table}>
                                <tbody>
                                <tr>
                                    <th className={styles.TableColumn}>Start date</th>
                                    <th className={styles.TableColumn}>End date</th>
                                    <th className={styles.TableColumn}>Total day(s)</th>
                                    <th className={styles.TableColumn}>Approval Status</th>
                                    <th></th>
                                </tr>

                                {absenceTableData.map((item:any, idx:number) => {
                                    return (
                                        <tr className={`${(idx % 2 !== 1) ? styles.TableAlterRow : ''}`}>
                                            <td className={styles.AbsenceContent}>
                                                {new Date(item.ABSENCE_START).toLocaleString([], { day: '2-digit', month: '2-digit', year:'numeric' })}
                                            </td>
                                            <td className={styles.AbsenceContent}>
                                                {new Date(item.ABSENCE_END).toLocaleString([], { day: '2-digit', month: '2-digit', year:'numeric' })}
                                            </td>
                                            <td className={styles.AbsenceContent}>
                                                {item.TOTAL_DAY}
                                            </td>
                                            <td className={styles.AbsenceContent} style={{ color: item.APPROVAL_STATUS === 'Pending' ? 'orange' : item.APPROVAL_STATUS === 'Approved' ? 'green'  : item.APPROVAL_STATUS === 'Rejected' ? 'red': 'black' }}>
                                                {item.APPROVAL_STATUS}
                                            </td>
                                            <td className={styles.AbsenceContent}>
                                                <div style={{ display: 'flex', gap: '5px', justifyContent: 'right'}}>
                                                    <div
                                                        style={{ display: item.APPROVAL_STATUS === 'Pending' ? 'inline-flex' : 'none'}}
                                                        className={`${styles.ButtonIcon} ${styles.ButtonIconTick}`}
                                                        title="Approve"
                                                        onClick={() => {approveAbsence(item.ABSENCE_ID)}}
                                                    >
                                                        <FontAwesomeIcon icon={faCheck} />
                                                    </div>
                                                    <div
                                                        style={{ display: item.APPROVAL_STATUS === 'Pending' ? 'inline-flex' : 'none'}}
                                                        className={`${styles.ButtonIcon} ${styles.ButtonIconCross}`}
                                                        title="Reject"
                                                        onClick={() => {rejectAbsence(item.ABSENCE_ID)}}
                                                    >
                                                        <FontAwesomeIcon icon={faXmark} />
                                                    </div>
                                                    <div
                                                        className={`${styles.ButtonIcon} ${styles.ButtonIconTrash}`}
                                                        title="Delete"
                                                        onClick={() => {
                                                            setAbsenceId(item.ABSENCE_ID);
                                                            setViewPopUpConfirm(true);
                                                        }}
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <div style={{ display: (viewPopUpConfirm) ? 'block' : 'none' }}>
                <div className={styles.PopUp}>
                    <center><h2>Confirm delete</h2></center>
                    <div>
                        <span>Are you sure you want to delete this record?</span><br/>
                        <span>This action cannot be undone.</span>
                    </div>
                    <br/>
                    <div style={{display: 'flex', gap: '5px', justifyContent: 'right'}}>
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={() => deleteAbsence()}
                        >
                            DELETE
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={() => setViewPopUpConfirm(false)}
                        >
                            CANCEL
                        </Button>
                    </div>
                </div>
            </div>
        </>
    )
}