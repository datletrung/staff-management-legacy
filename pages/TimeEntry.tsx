'use client';

import { LoadingButton } from '@mui/lab';
import {Login as LoginIcon
      ,Logout as LogoutIcon
      ,AddAlarm as AddAlarmIcon
} from '@mui/icons-material';

import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useSession, getSession } from 'next-auth/react';
import { toast } from 'react-toastify';
import Calendar from 'react-calendar';

import 'react-calendar/dist/Calendar.css';
import stylesTimeEntry from '../components/css/TimeEntry.module.css';


export default function TimeEntry() {
  const [prevDate, setPrevDate] = useState('');
  const [date, setDate] = useState(new Date());
  const [timePunchData, setTimePunchData] = useState([]);
  const [timePunchMonthData, setTimePunchMonthData] = useState<String[]>([]);

  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [currentDatetime, setCurrentDatetime] = useState(''); // display current date time

  useEffect(() => {
    refreshStatus();
    const r = setInterval(() => {
      setCurrentDatetime(new Date().toLocaleString("en-US", {weekday: 'short', month: 'short', day: '2-digit', year: 'numeric',
                                                            hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
                                                          }));
    }, 1000);
    return () => { clearInterval(r) }
  }, []);

  async function refreshStatus() {
    await getTimeEntryPerDay(new Date().toLocaleString("en-US", {year: 'numeric', month: '2-digit', day: '2-digit'}));
    await getTimeEntryPerMonth(new Date().toLocaleString("en-US", {year: 'numeric', month: '2-digit'}), true);
  }

  async function getTimeEntryPerDay(datePara: string) {
    const apiUrlEndpoint = 'api/fetchSql';
    const postData = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json '},
        body: JSON.stringify({
            action: 'fetch',
            query: 'fetchTimeEntryDayQuery',
            para: ['brianle@lionrocktech.net', datePara]
        })
    }
    
    const response = await fetch(apiUrlEndpoint, postData);
    const res = await response.json();
    setTimePunchData(res.data);
    setLoading(false);
    if (datePara == new Date().toLocaleString("en-US", {year: 'numeric', month: '2-digit', day: '2-digit'})){
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }

  async function getTimeEntryPerMonth(datePara: string, forceRefresh: boolean) {
    if (!forceRefresh && datePara == prevDate){
      return;
    } else {
      setPrevDate(datePara);
    }
    const apiUrlEndpoint = 'api/fetchSql';
    const postData = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json '},
        body: JSON.stringify({
            action: 'fetch',
            query: 'fetchTimeEntryMonthQuery',
            para: ['brianle@lionrocktech.net', datePara]
        })
    }
    
    const response = await fetch(apiUrlEndpoint, postData);
    const res = await response.json();
    let data = res.data;
    let tmp: Array<String> = [];
    data.forEach((item: any) => {
      let time = new Date(item.DATE).toLocaleString("en-US", {year: "numeric", month: "2-digit", day: "2-digit"});
      tmp.push(time);
    });
    setTimePunchMonthData(tmp);
  }
  
  function tileContent(datePara: any) {
    if (timePunchMonthData.includes(new Intl.DateTimeFormat('en-US', {year: "numeric", month: "2-digit", day: "2-digit"}).format(datePara.date))) {
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

  async function submitTimeEntry(action: string) {
    if (!['IN', 'OUT', 'BREAK'].includes(action)) return;
    setLoading(true);
    const apiUrlEndpoint = 'api/fetchSql';
    const postData = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json '},
        body: JSON.stringify({
            action: 'fetch',
            query: 'submitTimeEntry',
            para: [action, 'brianle@lionrocktech.net']
        })
    }
    
    const response = await fetch(apiUrlEndpoint, postData);
    const res = await response.json();
    if (res.data.affectedRows == 0) {
      console.log("Something went wrong");
      return;
    }
    refreshStatus();
  }

  return (
    <>
        <Head>
            <title>{`Time Entry | ${process.env.websiteName}`}</title>
        </Head>
        <h1>Time Entry</h1>

        <div className={stylesTimeEntry.SplitViewRow}>
          <div>
            <Calendar className={stylesTimeEntry.CalendarContainer}
              onChange={(datePara: any) => {
                setLoading(true);
                setDate(datePara);
                getTimeEntryPerDay(new Intl.DateTimeFormat('en-US', {year: "numeric", month: "2-digit", day: "2-digit"}).format(datePara));
                getTimeEntryPerMonth(new Intl.DateTimeFormat('en-US', {year: "numeric", month: "2-digit"}).format(datePara), false);
              }}
              value={date}
              tileContent={tileContent}
            />
          </div>
          <div className={stylesTimeEntry.SplitViewRowChild}>
            <div className={stylesTimeEntry.SplitViewColumn}>
              <div className={stylesTimeEntry.SplitViewColumnChild}>
              <div>
                <div><i><b>Current Time: </b>{currentDatetime}</i></div>
                <br/>

                <div className={stylesTimeEntry.ButtonContainer}>
                  <div className={stylesTimeEntry.Button}>
                    <LoadingButton
                      size="large" variant="outlined" color="success" endIcon={<LoginIcon />}
                      loading={loading} loadingPosition="end"
                      className={stylesTimeEntry.Button}
                      onClick={() => submitTimeEntry('IN')}
                      disabled={disabled}
                    >
                      Clock In
                    </LoadingButton>
                  </div>
                  <div className={stylesTimeEntry.Button}>
                    <LoadingButton
                      size="large" variant="outlined" endIcon={<AddAlarmIcon />}
                      loading={loading} loadingPosition="end"
                      className={stylesTimeEntry.Button}
                      onClick={() => submitTimeEntry('BREAK')}
                      disabled={disabled}
                    >
                      Add Break
                    </LoadingButton>
                  </div>
                  <div className={stylesTimeEntry.Button}>
                    <LoadingButton
                      size="large" variant="outlined" color="error" endIcon={<LogoutIcon />}
                      loading={loading} loadingPosition="end"
                      className={stylesTimeEntry.Button}
                      onClick={() => submitTimeEntry('OUT')}
                      disabled={disabled}
                    >
                      Clock Out
                    </LoadingButton>
                  </div>
                </div>

              </div>
              </div>
              <div className={`${stylesTimeEntry.SplitViewColumnChild} ${stylesTimeEntry.TimePunchView}`}>          
                {timePunchData.map((item: { TIME: any; ACTION: any; }) => {
                    let time = new Date(item.TIME).toLocaleString("en-US", {hour: '2-digit', minute: '2-digit', hour12: true});
                    let action = item.ACTION;
                    if (action == 'IN'){
                      return (
                          <div key={item.TIME} className={`${stylesTimeEntry.TimeCard} ${stylesTimeEntry.TimeCardIn}`}>
                            <b>Time IN</b> <i>{time}</i>
                          </div>
                      );
                    } else if (action == 'OUT'){
                        return (
                          <div key={item.TIME} className={`${stylesTimeEntry.TimeCard} ${stylesTimeEntry.TimeCardOut}`}>
                            <b>Time OUT</b> <i>{time}</i>
                          </div>
                        ); 
                    } else if (action == 'BREAK') {
                      return (
                        <div key={item.TIME} className={`${stylesTimeEntry.TimeCard} ${stylesTimeEntry.TimeCardBreak}`}>
                          <b>BREAK</b> 30 mins <i>{time}</i>
                        </div>
                      );
                    }
                })}
                <hr/><b>• Total Time:</b> <i>+08:00:00</i>
                <br/><b>• Total Break:</b> <i>-00:30:00</i>
                <hr/><b>Total Working Time:</b> <i>07:30:00</i>
              </div>
            </div>
          </div>
        </div>
    </>
  );
}