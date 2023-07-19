'use client';

import Link from "next/link";
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Calendar from 'react-calendar';
import { Button, TextField } from '@mui/material';
import Notify from '@components/Notify';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

import { checkPermissions } from '@components/CheckPermission';
import AccessDenied from '@components/AccessDenied';
import baseApiUrl from '@api/apiConfig';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from '@fortawesome/free-solid-svg-icons';

import 'react-calendar/dist/Calendar.css';
import stylesStaffZoneAbsence from '@components/css/StaffZone/Absence.module.css';

export default function StaffZoneAbsence() {
    if (!checkPermissions()) {
        return <AccessDenied/>;
    }

    const {data: session} = useSession();
    const [userId] = useState(session?.user?.userId);
    const [absenceTableData, setAbsenceTableData] = useState<any[]>([]);
    const [absenceCalendarData, setAbsenceCalendarData] = useState<any[]>([]);
    const [activeStartDate, setActiveStartDate] = useState(new Date());
    const [loading, setLoading] = useState(false);

    const [viewPopUp, setViewPopUp] = useState(false);
    const [viewPopUpConfirm, setViewPopUpConfirm] = useState(false);
    const [absenceDateFrom, setAbsenceDateFrom] = useState(dayjs());
    const [absenceDateTo, setAbsenceDateTo] = useState(dayjs());
    const [totalAbsenceDays, setTotalAbsenceDays] = useState(1);
    const [absenceId, setAbsenceId] = useState();

    useEffect(() => {
        refreshStatus();
    }, []);

    async function refreshStatus() {
        await getAbsencePerTable();
        await getAbsenceCalendar(activeStartDate);
    }

    async function getAbsencePerTable() {
        setLoading(true);
        const apiUrlEndpoint = `${baseApiUrl}/fetchSql`;
        let postData = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json '},
                body: JSON.stringify({
                        query: 'fetchAbsenceTable',
                        para: [userId]
                })
        }
        
        let response = await fetch(apiUrlEndpoint, postData);
        let res = await response.json();
        let data = res.data;
        setAbsenceTableData(data);

        setLoading(false);
    }

    async function getAbsenceCalendar(datePara: any) {
        let formattedDate = new Date(datePara).toLocaleString("en-US", {timeZone: 'America/Halifax', year: 'numeric', month: '2-digit'});
        const apiUrlEndpoint = `${baseApiUrl}/fetchSql`;
        const postData = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json '},
                body: JSON.stringify({
                        query: 'fetchAbsenceCalendar',
                        para: [formattedDate, userId]
                })
        }
        
        const response = await fetch(apiUrlEndpoint, postData);
        const res = await response.json();
        let data = res.data;
        setAbsenceCalendarData(data);
    }
    
    async function requestAbsence() {
        setLoading(true);
        var apiUrlEndpoint = `${baseApiUrl}/fetchSql`;
        var postData = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json '},
                body: JSON.stringify({
                        query: 'checkAbsenceExist',
                        para: [absenceDateFrom.format('MM/DD/YYYY'), absenceDateTo.format('MM/DD/YYYY'), userId]
                })
        }
        
        var response = await fetch(apiUrlEndpoint, postData);
        var res = await response.json();
        if (res.error){
            Notify(res.error, 'error');
            setLoading(false);
            return;
        }
        if (res.data.length !== 0){
            Notify('Absence start/end date overlaps', 'error');
            setLoading(false);
            return;
        }
        apiUrlEndpoint = `${baseApiUrl}/fetchSql`;
        postData = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json '},
                body: JSON.stringify({
                        query: 'requestAbsence',
                        para: [userId, absenceDateFrom.format('MM/DD/YYYY'), absenceDateTo.format('MM/DD/YYYY')]
                })
        }
        
        response = await fetch(apiUrlEndpoint, postData);
        res = await response.json();
        setLoading(false);
        if (res.error){
            Notify(res.error, 'error');
        }
        setViewPopUp(false);
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
                        para: [userId, absenceId]
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

    return (
        <>
            {viewPopUp && <div className={stylesStaffZoneAbsence.BlurView} onClick={() => {
                setViewPopUp(false);
            }} />}
            
            {viewPopUpConfirm && <div className={stylesStaffZoneAbsence.BlurView} onClick={() => {
                setViewPopUpConfirm(false);
            }} />}

            <Head>
                    <title>{`Absence | ${process.env.WebsiteName}`}</title>
            </Head>
            <h2><Link href={'/StaffZone'} style={{textDecoration: 'underline'}}>Staff Zone</Link> &#x2022; {`Absence`}</h2>

            <div className={stylesStaffZoneAbsence.SplitViewRow}>
                <div className={stylesStaffZoneAbsence.CenterView}>
                    <Calendar className={stylesStaffZoneAbsence.CalendarContainer}
                        locale='en-US'
                        activeStartDate={activeStartDate}
                        onActiveStartDateChange={(date: any) => {
                            setActiveStartDate(date.activeStartDate);
                            getAbsenceCalendar(date.activeStartDate);
                        }}
                        tileContent={tileContent}
                    />
                </div>
                <div className={stylesStaffZoneAbsence.SplitViewRowChild}>
                    <div className={stylesStaffZoneAbsence.SplitViewColumn}>
                        <div className={`${stylesStaffZoneAbsence.AbsenceView} ${loading ? stylesStaffZoneAbsence.AbsenceViewBlur : ''} `}>
                            <div className={stylesStaffZoneAbsence.ButtonContainer}>
                                <Button
                                    size="large"
                                    variant="outlined"
                                    color="success"
                                    style={{width:'100%'}}
                                    onClick={() => setViewPopUp(true)}
                                >
                                    REQUEST NEW ABSENCE
                                </Button>
                            </div>
                            <table className={stylesStaffZoneAbsence.Table}>
                                <tbody>
                                <tr>
                                    <th className={stylesStaffZoneAbsence.TableColumn}>Start date</th>
                                    <th className={stylesStaffZoneAbsence.TableColumn}>End date</th>
                                    <th className={stylesStaffZoneAbsence.TableColumn}>Total day(s)</th>
                                    <th className={stylesStaffZoneAbsence.TableColumn}>Approval Status</th>
                                    <th></th>
                                </tr>

                                {absenceTableData.map((item:any, idx:number) => {
                                    return (
                                        <tr className={`${(idx % 2 !== 1) ? stylesStaffZoneAbsence.TableAlterRow : ''}`}>
                                            <td className={stylesStaffZoneAbsence.AbsenceContent}>
                                                {new Date(item.ABSENCE_START).toLocaleString([], { day: '2-digit', month: '2-digit', year:'numeric' })}
                                            </td>
                                            <td className={stylesStaffZoneAbsence.AbsenceContent}>
                                                {new Date(item.ABSENCE_END).toLocaleString([], { day: '2-digit', month: '2-digit', year:'numeric' })}
                                            </td>
                                            <td className={stylesStaffZoneAbsence.AbsenceContent}>
                                                {item.TOTAL_DAY}
                                            </td>
                                            <td className={stylesStaffZoneAbsence.AbsenceContent} style={{ color: item.APPROVAL_STATUS === 'Pending' ? 'orange' : item.APPROVAL_STATUS === 'Approved' ? 'green'  : item.APPROVAL_STATUS === 'Rejected' ? 'red': 'black' }}>
                                                {item.APPROVAL_STATUS}
                                            </td>
                                            <td className={stylesStaffZoneAbsence.AbsenceContent}>
                                                <div style={{display: 'flex', gap: '5px'}}>
                                                    <div className={`${stylesStaffZoneAbsence.ButtonIcon} ${stylesStaffZoneAbsence.ButtonIconCross}`}
                                                        title="Withdraw"
                                                        onClick={() => {
                                                            setAbsenceId(item.ABSENCE_ID);
                                                            setViewPopUpConfirm(true);
                                                        }}
                                                    >
                                                        <FontAwesomeIcon icon={faXmark} />
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
            <div style={{ display: (viewPopUp) ? 'block' : 'none' }}>
                <div className={stylesStaffZoneAbsence.PopUp}>
                    <center><h2>Request New Absence</h2></center>
                    <div className={stylesStaffZoneAbsence.FormContainer}>
                        <span className={stylesStaffZoneAbsence.FormTitle}>Absence Date From</span>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                value={absenceDateFrom}
                                onChange={(value: any) => {
                                    setAbsenceDateFrom(value);
                                    if (value > absenceDateTo){
                                        setAbsenceDateTo(value);
                                        setTotalAbsenceDays(1);
                                    } else {
                                        setTotalAbsenceDays(absenceDateTo.diff(value, 'day')+1);
                                    }
                                }}
                                slots={{
                                    textField: textFieldProps => <TextField {...textFieldProps} variant='standard'/>
                                }}
                            />
                        </LocalizationProvider>
                        <span className={stylesStaffZoneAbsence.FormTitle}>Absence Date To</span>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                value={absenceDateTo}
                                onChange={(value: any) => {
                                    setAbsenceDateTo(value);
                                    if (value < absenceDateFrom){
                                        setAbsenceDateFrom(value);
                                        setTotalAbsenceDays(1);
                                    } else {
                                        setTotalAbsenceDays(value.diff(absenceDateFrom, 'day')+1);
                                    }
                                }}
                                slots={{
                                    textField: textFieldProps => <TextField {...textFieldProps} variant='standard'/>
                                }}
                            />
                        </LocalizationProvider>
                        <span className={stylesStaffZoneAbsence.FormTitle}>Total Absence Day(s)</span>
                        <span>{totalAbsenceDays}</span>
                    </div><br/>
                    <Button
                        size="large"
                        variant="outlined"
                        color="success"
                        style={{width:'100%'}}
                        onClick={() => requestAbsence()}
                    >
                        REQUEST ABSENCE
                    </Button>
                </div>
            </div>
            <div style={{ display: (viewPopUpConfirm) ? 'block' : 'none' }}>
                <div className={stylesStaffZoneAbsence.PopUp}>
                    <center><h2>Confirm withdrawal</h2></center>
                    <div>
                        <span>Are you sure you want to withdraw this record?</span><br/>
                        <span>This action cannot be undone.</span>
                    </div>
                    <br/>
                    <div style={{display: 'flex', gap: '5px', justifyContent: 'right'}}>
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={() => deleteAbsence()}
                        >
                            WITHDRAW
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
    );
}