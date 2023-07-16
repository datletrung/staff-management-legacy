'use client';

import Link from "next/link";
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Calendar from 'react-calendar';
import { Button, TextField, Checkbox } from '@mui/material';
import Notify from '@components/Notify';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

import { checkPermissions } from '@components/CheckPermission';
import AccessDenied from '@components/AccessDenied';
import baseApiUrl from '@api/apiConfig';

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
    const [absenceDateFrom, setAbsenceDateFrom] = useState(dayjs());
    const [absenceDateTo, setAbsenceDateTo] = useState(dayjs());
    const [totalAbsenceDays, setTotalAbsenceDays] = useState(1);
    const [absenceId, setAbsenceId] = useState(new Set());


    useEffect(() => {
        refreshStatus();
    }, []);

    async function refreshStatus() {
        await getAbsencePerTable();
        await getAbsenceCalendar(new Date());
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

    async function getAbsenceCalendar(datePara: Date) {
        let formattedDate = datePara.toLocaleString("en-US", {timeZone: 'America/Halifax', year: 'numeric', month: '2-digit'});
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

    async function withdrawAbsence() {
        if (absenceId.size === 0){
            Notify('Please select at least one to withdraw.', 'error');
            return;
        }
        setLoading(true);
        const apiUrlEndpoint = `${baseApiUrl}/fetchSql`;
        const postData = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json '},
                body: JSON.stringify({
                        query: 'withdrawAbsence',
                        para: [userId, Array.from(absenceId).join(',')]
                })
        }        
        const response = await fetch(apiUrlEndpoint, postData);
        const res = await response.json();
        setLoading(false);
        if (res.error){
            Notify(res.error, 'error');
        }
        setAbsenceId(new Set());
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
                            setActiveStartDate(date.date);
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
                                <Button
                                    size="large"
                                    variant="outlined"
                                    color="error"
                                    style={{width:'100%'}}
                                    onClick={() => withdrawAbsence()}
                                >
                                    WITHDRAW ABSENCE
                                </Button>
                            </div>
                            <table className={stylesStaffZoneAbsence.Table}>
                                <tbody>
                                <tr>
                                    <th></th>
                                    <th className={stylesStaffZoneAbsence.TableColumn}>Start date</th>
                                    <th className={stylesStaffZoneAbsence.TableColumn}>End date</th>
                                    <th className={stylesStaffZoneAbsence.TableColumn}>Total day(s)</th>
                                    <th className={stylesStaffZoneAbsence.TableColumn}>Approval Status</th>
                                </tr>

                                {absenceTableData.map((item:any, idx:number) => {
                                    return (
                                        <tr className={`${(idx % 2 !== 1) ? stylesStaffZoneAbsence.TableAlterRow : ''}`}>
                                            <td >
                                                <Checkbox          
                                                    key={item.ABSENCE_ID}
                                                    color="success"
                                                    checked={absenceId.has(item.ABSENCE_ID.toString().padStart(16, '0'))}
                                                    onChange={(event) => {
                                                        const { checked } = event.target;
                                                        if (checked) {
                                                            setAbsenceId((prevSet:any) => new Set(prevSet).add(item.ABSENCE_ID.toString().padStart(16, '0')));
                                                        } else {
                                                            setAbsenceId((prevSet:any) => {
                                                                const newSet = new Set(prevSet);
                                                                newSet.delete(item.ABSENCE_ID.toString().padStart(16, '0'));
                                                                return newSet;
                                                            });
                                                        }
                                                    }}
                                                />
                                            </td>
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
                                    setTotalAbsenceDays(value.diff(absenceDateFrom, 'day')+1);
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
        </>
    );
}