'use client';

import { LoadingButton } from '@mui/lab';
import {Login as LoginIcon
      ,Logout as LogoutIcon
      ,AddAlarm as AddAlarmIcon
} from '@mui/icons-material';

import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Calendar from 'react-calendar';
import Notify from '../components/Notify';
import { checkPermissions } from '../components/CheckPermission';
import AccessDenied from '../components/AccessDenied';

import 'react-calendar/dist/Calendar.css';
import stylesTimeEntry from '../components/css/TimeEntry.module.css';



export default function TimeEntry() {
  if (!checkPermissions()) {
    return <AccessDenied/>;
  }

  const { data: session } = useSession();
  const [email] = useState(session?.user?.email);
  const [prevDate, setPrevDate] = useState(new Date('0001-01-01'));
  const [date, setDate] = useState(new Date());
  const [timePunchData, setTimePunchData] = useState<any[]>([]);
  const [timePunchMonthData, setTimePunchMonthData] = useState<String[]>([]);

  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  const [totalTime, setTotalTime] = useState(0);
  const [totalBreakTime, setTotalBreakTime] = useState(0);
  const [totalWorkingTime, setTotalWorkingTime] = useState(0);

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
    await getTimeEntryPerMonth(new Date(), true);
  }

  async function getTimeEntryPerDay(datePara: Date) {
    if (typeof(datePara) === 'undefined') return;
    setLoading(true);
    let formattedDate = datePara.toLocaleString("en-US", {timeZone:'America/Halifax', year: 'numeric', month: '2-digit', day: '2-digit'});
    const apiUrlEndpoint = 'api/fetchSql';
    let postData = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json '},
        body: JSON.stringify({
            query: 'fetchTimeEntryDayQuery',
            para: [email, formattedDate]
        })
    }
    
    let response = await fetch(apiUrlEndpoint, postData);
    let res = await response.json();
    setTimePunchData(res.data);

    let n_totalTime = 0;
    res.data.forEach((item: {TIME_IN: String, TIME_OUT: String}) => {
      const [hours1, minutes1, second1] = item.TIME_IN.split(":").map(Number);
      const [hours2, minutes2, second2] = (item.TIME_OUT) ? item.TIME_OUT.split(":").map(Number) : [null, null, null];
      
      if (hours2 !== null && minutes2 !== null && second2 !== null){
        n_totalTime += Math.abs(Math.floor((hours2 - hours1) * 60 + (minutes2 - minutes1) + (second2 - second1) / 60));
      } else {
        const [hours3, minutes3, second3] = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }).split(":").map(Number);
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

  async function getTimeEntryPerMonth(datePara: Date, forceRefresh: boolean) {
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
            para: [email, formattedDate]
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

  
  async function submitTimeEntry(action: string) {
    let clockedIn:boolean = false;
    if (Object.keys(timePunchData).length !== 0){
      clockedIn = (timePunchData[timePunchData.length - 1].TIME_OUT == null) ? true : false;
    }
    if (!['IN', 'OUT', 'BREAK'].includes(action)){
      Notify('Invalid Action', 'error');
      return;
    }
    if (action == 'IN' &&  clockedIn === true){
      Notify('You\'ve already clocked in', 'error');
      return;
    }
    if (action == 'OUT' &&  clockedIn === false){
      Notify('You need to clock in first', 'error');
      return;
    }
    setLoading(true);
    const apiUrlEndpoint = 'api/fetchSql';
    const postData = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json '},
        body: JSON.stringify({
            query: 'submitTimeEntry',
            para: [email, action]
        })
    }
    
    const response = await fetch(apiUrlEndpoint, postData);
    const res = await response.json();
    setLoading(false);
    if (res.error){
      Notify(res.error, 'error');
    } else if (res.data.affectedRows == 0) {
      Notify('Something went wrong! Please try again later', 'error');
    }
    refreshStatus();
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

  return (
    <>
        <Head>
            <title>{`Time Entry | ${process.env.WebsiteName}`}</title>
        </Head>
        <h1>Time Entry</h1>

        <div className={stylesTimeEntry.SplitViewRow}>
          <div className={stylesTimeEntry.CenterView}>
            <div className={stylesTimeEntry.Clock}>
              <div>{currentDate}</div>
              <div className={stylesTimeEntry.ClockTime}>{currentTime}</div>
            </div>
            <Calendar className={stylesTimeEntry.CalendarContainer}
              locale='en-US'
              onChange={(datePara: any) => {
                setDate(datePara);
                getTimeEntryPerDay(datePara);
                getTimeEntryPerMonth(datePara, false);
              }}
              value={date}
              tileContent={tileContent}
            />
          </div>
          <div className={stylesTimeEntry.SplitViewRowChild}>
            <div className={stylesTimeEntry.SplitViewColumn}>
              <div className={stylesTimeEntry.SplitViewColumnChild}>
              <div>
                <div className={stylesTimeEntry.ButtonContainer}>
                  <div className={stylesTimeEntry.Button}>
                    <LoadingButton
                      size="large" variant="outlined" color="success" endIcon={<LoginIcon/>}
                      loading={loading} loadingPosition="end"
                      style={{width:'100%'}}
                      disabled={disabled}
                      onClick={() => submitTimeEntry('IN')}
                    >
                      Clock In
                    </LoadingButton>
                  </div>
                  <div className={stylesTimeEntry.Button}>
                    <LoadingButton
                      size="large" variant="outlined" color="error" endIcon={<LogoutIcon/>}
                      loading={loading} loadingPosition="end"
                      style={{width:'100%'}}
                      disabled={disabled}
                      onClick={() => submitTimeEntry('OUT')}
                    >
                      Clock Out
                    </LoadingButton>
                  </div>
                  <div className={stylesTimeEntry.Button}>
                    <LoadingButton
                      size="large" variant="outlined" endIcon={<AddAlarmIcon/>}
                      loading={loading} loadingPosition="end"
                      style={{width:'100%'}}
                      disabled={disabled}
                      onClick={() => submitTimeEntry('BREAK')}
                    >
                      Add Break
                    </LoadingButton>
                  </div>
                </div>
                <div><i><small>*Applying one break will substract 30 minutes from your working time.</small></i></div>
              </div>
              </div>
              <div className={`${stylesTimeEntry.SplitViewColumnChild} ${stylesTimeEntry.TimePunchView} ${loading ? stylesTimeEntry.TimePunchViewBlur : ''} `}>
                {timePunchData.map((item:any, idx:number) => {
                    let timeIn = (item.TIME_IN) ? item.TIME_IN.split(":").map(String)[0]+':'+item.TIME_IN.split(":").map(String)[1] : '-';
                    let timeOut = (item.TIME_OUT) ? item.TIME_OUT.split(":").map(String)[0]+':'+item.TIME_OUT.split(":").map(String)[1] : '-';
                    return (
                      <div key={idx} className={stylesTimeEntry.TimeCard}>
                        <b className={stylesTimeEntry.TimeCardIn}>{timeIn}</b> <b className={stylesTimeEntry.TimeCardOut}>{timeOut}</b>
                      </div>
                    );
                })}
                <hr/>
                <div className={stylesTimeEntry.TimeCardSummary}>
                  <b>Total Time</b>
                  <b>{Math.floor(totalTime/60)}:{(totalTime%60).toString().padStart(2, '0')} hr</b>
                </div>
                {(totalBreakTime != 0) ?
                  <>
                  <div className={stylesTimeEntry.TimeCardSummary}>
                    <b>Break</b>
                    <b>- {Math.floor(totalBreakTime/60)}:{(totalBreakTime%60).toString().padStart(2, '0')} hr</b>
                  </div>
                  </> : null
                }
                <hr/>
                <div className={stylesTimeEntry.TimeCardSummary}>
                  <b>Total Working Time</b>
                  <b>{Math.floor(totalWorkingTime/60)}:{(totalWorkingTime%60).toString().padStart(2, '0')} hr</b>
                </div>
              </div>
            </div>
          </div>
        </div>
    </>
  );
}