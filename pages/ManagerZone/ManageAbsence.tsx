'use client';

import Link from "next/link";
import Head from 'next/head';
import Notify from '@components/Notify';
import { useState, useEffect } from 'react';
import baseApiUrl from '@api/apiConfig';

import { Button, Autocomplete, TextField, Checkbox } from '@mui/material';
import Calendar from 'react-calendar';
import { checkPermissions } from '@components/CheckPermission';
import AccessDenied from '@components/AccessDenied';

import 'react-calendar/dist/Calendar.css';
import stylesManagerZoneManageAbsence from '@components/css/ManagerZone/ManageAbsence.module.css';
import { useSession } from "next-auth/react";


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
    const [absenceId, setAbsenceId] = useState(new Set());
    const [viewAbsence, setViewAbsence] = useState(false);

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
        await getAbsenceCalendar(employeeId, new Date());
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

    async function getAbsenceCalendar(employeeIdPara: any, datePara: Date) {
        let formattedDate = datePara.toLocaleString("en-US", {timeZone: 'America/Halifax', year: 'numeric', month: '2-digit'});
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
        if (absenceId.size === 0){
            Notify('Please select at least one absence record.', 'error');
            return;
        }
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
                        para: [status, userId, employeeId, Array.from(absenceId).join(',')]
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
      

    useEffect(() => {
        getEmployeeList();
    }, [])

    return (
        <>
            <Head>
                <title>{`Time Sheet | ${process.env.WebsiteName}`}</title>
            </Head>
            <h2><Link href={'/ManagerZone'} style={{textDecoration: 'underline'}}>Manager Zone</Link> &#x2022; {`Time Sheet`}</h2>
            
            <div className={stylesManagerZoneManageAbsence.ViewContainer}>
                <div className={stylesManagerZoneManageAbsence.ViewChildFlexColumnLeft}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <hr style={{ flex: 1, marginRight: '10px' }} />
                        <h4>Employee Details</h4>
                        <hr style={{ flex: 1, marginLeft: '10px' }} />
                    </div>
                    <div className={stylesManagerZoneManageAbsence.FilterContainer}>
                        <span className={stylesManagerZoneManageAbsence.FilterTitle}>Employee</span>
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
                                    getAbsenceCalendar(value.USER_ID, new Date());
                                    setViewAbsence(true);
                                } else {
                                    setEmployeeId('');
                                    setEmployeeName('');
                                    setViewAbsence(false);
                                    setAbsenceTableData([]);
                                    setAbsenceTableData([]);
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
                    <Calendar className={stylesManagerZoneManageAbsence.CalendarContainer}
                        locale='en-US'
                        activeStartDate={activeStartDate}
                        onActiveStartDateChange={(date: any) => {
                            setActiveStartDate(date.date);
                            getAbsenceCalendar(employeeId, date.activeStartDate);
                        }}
                        tileContent={tileContent}
                    />
                </div>
                <div className={`${stylesManagerZoneManageAbsence.ViewChildFlexColumnRight} ${loading ? stylesManagerZoneManageAbsence.LoadingBlur : ''}`}>
                    <div style={{ display: (viewAbsence) ? 'block' : 'none' }}>
                        <center>
                            <h3>{employeeName}</h3>
                        </center>
                        <div className={stylesManagerZoneManageAbsence.ButtonContainer}>
                            <Button
                                variant="outlined"
                                color="success"
                                style={{width:'100%'}}
                                onClick={() => updateApprovalStatusAbsence('APPROVED')}
                            >
                                APPROVE
                            </Button>
                            <Button
                                variant="outlined"
                                color="error"
                                style={{width:'100%'}}
                                onClick={() => updateApprovalStatusAbsence('REJECTED')}
                            >
                                REJECT
                            </Button>
                        </div>
                        <table className={stylesManagerZoneManageAbsence.Table}>
                            <tbody>
                            <tr>
                                <th></th>
                                <th className={stylesManagerZoneManageAbsence.TableColumn}>Start date</th>
                                <th className={stylesManagerZoneManageAbsence.TableColumn}>End date</th>
                                <th className={stylesManagerZoneManageAbsence.TableColumn}>Total day(s)</th>
                                <th className={stylesManagerZoneManageAbsence.TableColumn}>Approval Status</th>
                            </tr>

                            {absenceTableData.map((item:any, idx:number) => {
                                return (
                                    <tr className={`${(idx % 2 !== 1) ? stylesManagerZoneManageAbsence.TableAlterRow : ''}`}>
                                        <td>
                                            <Checkbox
                                                key={item.ABSENCE_ID}
                                                color="success"
                                                style={{ display: item.APPROVAL_STATUS === 'Pending' ? 'block' : 'none' }}
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
                                        <td className={stylesManagerZoneManageAbsence.AbsenceContent}>
                                            {new Date(item.ABSENCE_START).toLocaleString([], { day: '2-digit', month: '2-digit', year:'numeric' })}
                                        </td>
                                        <td className={stylesManagerZoneManageAbsence.AbsenceContent}>
                                            {new Date(item.ABSENCE_END).toLocaleString([], { day: '2-digit', month: '2-digit', year:'numeric' })}
                                        </td>
                                        <td className={stylesManagerZoneManageAbsence.AbsenceContent}>
                                            {item.TOTAL_DAY}
                                        </td>
                                        <td className={stylesManagerZoneManageAbsence.AbsenceContent} style={{ color: item.APPROVAL_STATUS === 'Pending' ? 'orange' : item.APPROVAL_STATUS === 'Approved' ? 'green'  : item.APPROVAL_STATUS === 'Rejected' ? 'red': 'black' }}>
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
        </>
    )
}