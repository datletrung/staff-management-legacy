'use client';

import { Button } from '@mui/material';

import Link from "next/link";
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Calendar from 'react-calendar';
import Notify from '@components/Notify';
import { checkPermissions } from '@components/CheckPermission';
import AccessDenied from '@components/AccessDenied';
import baseApiUrl from '@api/apiConfig';

import 'react-calendar/dist/Calendar.css';
import stylesStaffZoneTimeEntry from '@components/css/StaffZone/TimeEntry.module.css';

export default function StaffZoneTimeEntry() {
    if (!checkPermissions()) {
        return <AccessDenied/>;
    }

    const {data: session} = useSession();
    const [userId] = useState(session?.user?.userId);
    const [calendarDate, setCalendarDate] = useState(new Date());
    const [timePunchData, setTimePunchData] = useState<any[]>([]);
    const [timePunchMonthData, setTimePunchMonthData] = useState<String[]>([]);
    const [activeStartDate, setActiveStartDate] = useState(new Date());
    const [totalTimePerWeek, setTotalTimePerWeek] = useState(0);

    const [loading, setLoading] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date().toLocaleString("en-US", {timeZone:'America/Halifax', weekday: 'short', month: 'short', day: '2-digit', year: 'numeric'}));
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleString("en-US", {timeZone:'America/Halifax', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false}));

    useEffect(() => {
        refreshStatus();
        const r = setInterval(() => {
            setCurrentDate(new Date().toLocaleString("en-US", {timeZone:'America/Halifax', weekday: 'short', month: 'short', day: '2-digit', year: 'numeric'}));
            setCurrentTime(new Date().toLocaleString("en-US", {timeZone:'America/Halifax', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false}));
        }, 1000);
        return () => { clearInterval(r) }
    }, []);

    async function refreshStatus() {
        await getTimeEntryPerDay(new Date());
        await getTotalWorkingTimePerWeek(new Date());
        await getTimeEntryPerMonth(new Date());
    }

    async function getTimeEntryPerDay(datePara: Date) {
        if (typeof(datePara) === 'undefined') return;
        setLoading(true);
        let formattedDate = datePara.toLocaleString("en-US", {timeZone:'America/Halifax', year: 'numeric', month: '2-digit', day: '2-digit'});
        const apiUrlEndpoint = `${baseApiUrl}/fetchSql`;
        let postData = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json '},
                body: JSON.stringify({
                        query: 'fetchTimeEntryDay',
                        para: [userId, formattedDate]
                })
        }
        
        let response = await fetch(apiUrlEndpoint, postData);
        let res = await response.json();
        let data = res.data;
        setTimePunchData(data);

        setLoading(false);
        if (datePara.setHours(0,0,0,0) == new Date().setHours(0,0,0,0)){
            setDisabled(false);
        } else {
            setDisabled(true);
        }
    }

    async function getTimeEntryPerMonth(datePara: Date) {
        let formattedDate = datePara.toLocaleString("en-US", {timeZone: 'America/Halifax', year: 'numeric', month: '2-digit'});
        const apiUrlEndpoint = `${baseApiUrl}/fetchSql`;
        const postData = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json '},
                body: JSON.stringify({
                        query: 'fetchTimeEntryMonth',
                        para: [userId, formattedDate]
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
    
    async function submitTimeEntry() {
        setLoading(true);
        const apiUrlEndpoint = `${baseApiUrl}/fetchSql`;
        const postData = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json '},
                body: JSON.stringify({
                        query: 'submitTimeEntry',
                        para: [userId]
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

    async function getTotalWorkingTimePerWeek(datePara: Date) {
        if (typeof(datePara) === 'undefined') return;
        let formattedDate = datePara.toLocaleString("en-US", {timeZone: 'America/Halifax', year: 'numeric', month: '2-digit', day: '2-digit'});
        const apiUrlEndpoint = `${baseApiUrl}/fetchSql`;
        let postData = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json '},
            body: JSON.stringify({
                query: 'fetchTotalTimePerWeek',
                para: [formattedDate, formattedDate, formattedDate, formattedDate, userId]
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

    return (
        <>
            <Head>
                    <title>{`Time Entry | ${process.env.WebsiteName}`}</title>
            </Head>
            <h2><Link href={'/StaffZone'} style={{textDecoration: 'underline'}}>Staff Zone</Link> &#x2022; {`Time Entry`}</h2>

            <div className={stylesStaffZoneTimeEntry.SplitViewRow}>
                <div className={stylesStaffZoneTimeEntry.CenterView}>
                    <div className={stylesStaffZoneTimeEntry.Clock}>
                        <div>{currentDate}</div>
                        <div className={stylesStaffZoneTimeEntry.ClockTime}>{currentTime}</div>
                    </div>
                    <Calendar className={stylesStaffZoneTimeEntry.CalendarContainer}
                        locale='en-US'
                        onChange={(datePara: any) => {
                            setCalendarDate(datePara);
                            getTimeEntryPerDay(datePara);
                            getTotalWorkingTimePerWeek(datePara);
                        }}
                        activeStartDate={activeStartDate}
                        onActiveStartDateChange={(date: any) => {
                            setActiveStartDate(date.date);
                            getTimeEntryPerMonth(date.activeStartDate);
                        }}
                        value={calendarDate}
                        tileContent={tileContent}
                    />
                </div>
                <div className={stylesStaffZoneTimeEntry.SplitViewRowChild}>
                    <div className={stylesStaffZoneTimeEntry.SplitViewColumn}>
                        <div className={`${stylesStaffZoneTimeEntry.TimePunchView} ${loading ? stylesStaffZoneTimeEntry.TimePunchViewBlur : ''} `}>
                            <center>
                                <div>Selected date: {calendarDate.toLocaleString("en-US", {timeZone: 'America/Halifax', year: 'numeric', month: '2-digit', day: '2-digit'})}</div>
                                <div>Total hour this week: {totalTimePerWeek}</div>
                            </center>
                            <table className={stylesStaffZoneTimeEntry.Table}>
                                <tbody>
                                <tr>
                                    <th className={stylesStaffZoneTimeEntry.TableColumn}>Time in</th>
                                    <th className={stylesStaffZoneTimeEntry.TableColumn}>Time out</th>
                                    <th className={stylesStaffZoneTimeEntry.TableColumn}>Total hour</th>
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
                                            <tr className={`${(idx % 2 !== 1) ? stylesStaffZoneTimeEntry.TableAlterRow : ''}`}>
                                                <td className={`${stylesStaffZoneTimeEntry.TimeCardContent} ${stylesStaffZoneTimeEntry.TimeCardIn} ${stylesStaffZoneTimeEntry.TableColumn}`}>
                                                    {
                                                    timeIn.includes(',') ? (
                                                        <>
                                                            <small>{timeIn.split(',')[0]}</small> <br/>
                                                            {timeIn.split(',')[1].trim()}
                                                        </>
                                                    ) : (
                                                        timeIn
                                                    )}</td>
                                                <td className={`${stylesStaffZoneTimeEntry.TimeCardContent} ${stylesStaffZoneTimeEntry.TimeCardOut} ${stylesStaffZoneTimeEntry.TableColumn}`}>
                                                    {
                                                    timeOut.includes(',') ? (
                                                        <>
                                                            <small>{timeOut.split(',')[0]}</small> <br/>
                                                            {timeOut.split(',')[1].trim()}
                                                        </>
                                                    ) : (
                                                        timeOut
                                                    )}</td>
                                                <td className={`${stylesStaffZoneTimeEntry.TimeCardContent}  ${stylesStaffZoneTimeEntry.TableColumn}`}>{totalTime}</td>
                                            </tr>
                                        );
                                })}
                                </tbody>
                            </table>
                        </div>
                        <br/>
                        <div className={`${stylesStaffZoneTimeEntry.ButtonContainer} ${disabled ? stylesStaffZoneTimeEntry.ButtonHidden : ''}`}>
                            <Button
                                size="large"
                                variant="outlined"
                                color="success"
                                style={{width:'100%'}}
                                disabled={disabled}
                                onClick={() => submitTimeEntry()}
                            >
                                PUNCH THE CLOCK
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}