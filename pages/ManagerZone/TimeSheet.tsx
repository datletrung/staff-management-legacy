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
import stylesManagerZoneTimeSheet from '@components/css/ManagerZone/TimeSheet.module.css';
import { useSession } from "next-auth/react";


export default function ManagerZoneTimeSheet() {
    if (!checkPermissions()) {
        return <AccessDenied/>;
    }

    const {data: session} = useSession();
    const [userId] = useState(session?.user?.userId);
    const [employeeList, setEmployeeList] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [employeeId, setEmployeeId] = useState('');
    const [employeeName, setEmployeeName] = useState('');
    const [calendarDate, setCalendarDate] = useState(new Date());
    const [timePunchData, setTimePunchData] = useState<any[]>([]);
    const [timePunchMonthData, setTimePunchMonthData] = useState<String[]>([]);
    const [activeStartDate, setActiveStartDate] = useState(new Date());
    const [totalTimePerWeek, setTotalTimePerWeek] = useState(0);
    const [viewTimeSheet, setViewTimeSheet] = useState(false);

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

    async function getTimeEntryPerDay(employeeIdPara: any, datePara: Date) {
        if (typeof(datePara) === 'undefined') return;
        setLoading(true);
        let formattedDate = datePara.toLocaleString("en-US", {timeZone:'America/Halifax', year: 'numeric', month: '2-digit', day: '2-digit'});
        const apiUrlEndpoint = `${baseApiUrl}/fetchSql`;
        let postData = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json '},
                body: JSON.stringify({
                        query: 'fetchTimeEntryDay',
                        para: [employeeIdPara, formattedDate]
                })
        }
        
        let response = await fetch(apiUrlEndpoint, postData);
        let res = await response.json();
        let data = res.data;
        setTimePunchData(data);
        setLoading(false);
    }

    async function getTimeEntryPerMonth(employeeIdPara: any, datePara: any) {
        let formattedDate = new Date(datePara).toLocaleString("en-US", {timeZone: 'America/Halifax', year: 'numeric', month: '2-digit'});
        const apiUrlEndpoint = `${baseApiUrl}/fetchSql`;
        const postData = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json '},
                body: JSON.stringify({
                        query: 'fetchTimeEntryMonth',
                        para: [employeeIdPara, formattedDate]
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
    
    async function getTotalWorkingTimePerWeek(employeeIdPara: any, datePara: Date) {
        if (typeof(datePara) === 'undefined') return;
        let formattedDate = datePara.toLocaleString("en-US", {timeZone: 'America/Halifax', year: 'numeric', month: '2-digit', day: '2-digit'});
        const apiUrlEndpoint = `${baseApiUrl}/fetchSql`;
        let postData = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json '},
            body: JSON.stringify({
                query: 'fetchTotalTimePerWeek',
                para: [formattedDate, formattedDate, formattedDate, formattedDate, employeeIdPara]
            })
        }
        
        let response = await fetch(apiUrlEndpoint, postData);
        let res = await response.json();
        const data = res.data;
        if (res.data.length === 0){
            setTotalTimePerWeek(0);
        } else {
            setTotalTimePerWeek(data[0].TOTAL_TIME);
        }
    }

    async function approveTimeSheet() {
        setLoading(true);
        if (typeof(calendarDate) === 'undefined') return;
        let formattedDate = calendarDate.toLocaleString("en-US", {timeZone: 'America/Halifax', year: 'numeric', month: '2-digit', day: '2-digit'});
        const apiUrlEndpoint = `${baseApiUrl}/fetchSql`;
        let postData = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json '},
            body: JSON.stringify({
                query: 'approveTimeSheet',
                para: [userId, employeeId, formattedDate, formattedDate]
            })
        }
        
        let response = await fetch(apiUrlEndpoint, postData);
        let res = await response.json();
        if (res.error){
            Notify(res.error, 'error');
            setLoading(false);
            return;
        }
        Notify('Approved.', 'success');
        setLoading(false);
        return;
    }

    async function approveTimeSheetAll() {
        setLoading(true);
        const apiUrlEndpoint = `${baseApiUrl}/fetchSql`;
        let postData = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json '},
            body: JSON.stringify({
                query: 'approveTimeSheetAll',
                para: [userId, employeeId]
            })
        }
        
        let response = await fetch(apiUrlEndpoint, postData);
        let res = await response.json();
        if (res.error){
            Notify(res.error, 'error');
            setLoading(false);
            return;
        }
        Notify('Approved all.', 'success');
        setLoading(false);
        return;
    }

    function tileContent(datePara: any) {
        let formattedDate = datePara.date.toLocaleString("en-US", {timeZone: 'America/Halifax', year: 'numeric', month: '2-digit', day: '2-digit'});
        if (timePunchMonthData.includes(formattedDate)) {
            return (
                <div
                    style={{
                        backgroundColor: 'green',
                        width: '100%',
                        height: '5px',
                    }}
                >
                </div>
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
            
            <div className={stylesManagerZoneTimeSheet.ViewContainer}>
                <div className={stylesManagerZoneTimeSheet.ViewChildFlexColumnLeft}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <hr style={{ flex: 1, marginRight: '10px' }} />
                        <h4>Employee Details</h4>
                        <hr style={{ flex: 1, marginLeft: '10px' }} />
                    </div>
                    <div className={stylesManagerZoneTimeSheet.FilterContainer}>
                        <span className={stylesManagerZoneTimeSheet.FilterTitle}>Employee</span>
                        <Autocomplete
                            options={employeeList}
                            autoHighlight
                            filterOptions={filterOptions}
                            getOptionLabel={(option: any) => option.FULL_NAME}
                            isOptionEqualToValue={(option: any, value: any) => {
                                return (
                                    option?.USER_ID !== value?.USER_ID ||
                                    option?.FULL_NAME !== value?.FULL_NAME ||
                                    option?.EMAIL !== value?.EMAIL
                                );
                            }}
                            onChange={(event, value) => {
                                if (value){
                                    setEmployeeId(value.USER_ID);
                                    setEmployeeName(value.FULL_NAME);                            
                                    setCalendarDate(new Date());

                                    getTimeEntryPerDay(value.USER_ID, new Date());
                                    getTotalWorkingTimePerWeek(value.USER_ID, new Date());
                                    getTimeEntryPerMonth(value.USER_ID, activeStartDate);
                                    setViewTimeSheet(true);
                                } else {
                                    setEmployeeId('');
                                    setEmployeeName('');
                                    setViewTimeSheet(false);
                                    setTimePunchData([]);
                                    setTimePunchMonthData([]);
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
                    <Calendar className={stylesManagerZoneTimeSheet.CalendarContainer}
                        locale='en-US'
                        onChange={(datePara: any) => {
                            setCalendarDate(datePara);
                            if (employeeId === '') {
                                Notify('Please select an employee.', 'error');
                                return;
                            }
                            getTimeEntryPerDay(employeeId, datePara);
                            getTotalWorkingTimePerWeek(employeeId, datePara)
                        }}
                        activeStartDate={activeStartDate}
                        onActiveStartDateChange={(date: any) => {
                            setActiveStartDate(date.activeStartDate);
                            getTimeEntryPerMonth(employeeId, date.activeStartDate);
                        }}
                        value={calendarDate}
                        tileContent={tileContent}
                    />
                </div>
                <div className={`${stylesManagerZoneTimeSheet.ViewChildFlexColumnRight} ${loading ? stylesManagerZoneTimeSheet.LoadingBlur : ''}`}>
                    <div style={{ display: (viewTimeSheet) ? 'block' : 'none' }}>
                        <center>
                            <h3>{employeeName}</h3>
                            <div>Selected date: {calendarDate.toLocaleString("en-US", {timeZone: 'America/Halifax', year: 'numeric', month: '2-digit', day: '2-digit'})}</div>
                            <div>Total hour this week: {totalTimePerWeek}</div>
                        </center>
                        <div className={stylesManagerZoneTimeSheet.ButtonContainer}>
                            <Button
                                variant="outlined"
                                color="success"
                                style={{width:'100%'}}
                                onClick={() => approveTimeSheet()}
                            >
                                APPROVE THIS DAY
                            </Button>
                            <Button
                                variant="outlined"
                                color="success"
                                style={{width:'100%'}}
                                onClick={() => approveTimeSheetAll()}
                            >
                                APPROVE ALL
                            </Button>
                        </div>
                        <table className={stylesManagerZoneTimeSheet.Table}>
                            <tbody>
                            <tr>
                                <th className={stylesManagerZoneTimeSheet.TableColumn}>Time in</th>
                                <th className={stylesManagerZoneTimeSheet.TableColumn}>Time out</th>
                                <th className={stylesManagerZoneTimeSheet.TableColumn}>Total hour</th>
                            </tr>

                            {timePunchData.map((item:any, idx:number) => {
                                    let selectedDate = calendarDate;
                                    let totalTime = item.TOTAL_TIME.split(':').slice(0, 2).join(':');
                                    let timeIn = '-';
                                    if (item.TIME_IN) {
                                        let timeInTmp = new Date(item.TIME_IN);
                                        if (selectedDate.getDate() === timeInTmp.getDate()
                                            && selectedDate.getMonth() === timeInTmp.getMonth()
                                            && selectedDate.getFullYear() === timeInTmp.getFullYear()){
                                            timeIn = timeInTmp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
                                        } else {
                                            timeIn = timeInTmp?.toLocaleTimeString([], { day: '2-digit', month: '2-digit', year:'2-digit', hour:'2-digit', minute: '2-digit', hour12: false });
                                        }   
                                    }
                                    let timeOut = '-';
                                    if (item.TIME_OUT) {
                                        let timeOutTmp = new Date(item.TIME_OUT);
                                        if (selectedDate.getDate() === timeOutTmp.getDate()
                                            && selectedDate.getMonth() === timeOutTmp.getMonth()
                                            && selectedDate.getFullYear() === timeOutTmp.getFullYear()){
                                            timeOut = timeOutTmp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
                                        } else {
                                            timeOut = timeOutTmp?.toLocaleTimeString([], { day: '2-digit', month: '2-digit', year:'2-digit', hour:'2-digit', minute: '2-digit', hour12: false });
                                        }   
                                    }
                                    return (
                                        <tr className={`${(idx % 2 !== 1) ? stylesManagerZoneTimeSheet.TableAlterRow : ''}`}>
                                            <td className={`${stylesManagerZoneTimeSheet.TimeCardContent} ${stylesManagerZoneTimeSheet.TimeCardIn} ${stylesManagerZoneTimeSheet.TableColumn}`}>
                                                {
                                                timeIn.includes(',') ? (
                                                    <>
                                                        <small>{timeIn.split(',')[0]}</small> <br/>
                                                        {timeIn.split(',')[1].trim()}
                                                    </>
                                                ) : (
                                                    timeIn
                                                )}</td>
                                            <td className={`${stylesManagerZoneTimeSheet.TimeCardContent} ${stylesManagerZoneTimeSheet.TimeCardOut} ${stylesManagerZoneTimeSheet.TableColumn}`}>
                                                {
                                                timeOut.includes(',') ? (
                                                    <>
                                                        <small>{timeOut.split(',')[0]}</small> <br/>
                                                        {timeOut.split(',')[1].trim()}
                                                    </>
                                                ) : (
                                                    timeOut
                                                )}</td>
                                            <td className={`${stylesManagerZoneTimeSheet.TimeCardContent}  ${stylesManagerZoneTimeSheet.TableColumn}`}>{totalTime}</td>
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