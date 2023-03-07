'use client';

import { LoadingButton } from '@mui/lab';
import {Login as LoginIcon
      ,Logout as LogoutIcon
      ,AddAlarm as AddAlarmIcon
} from '@mui/icons-material';

import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';
import Calendar from 'react-calendar';

import 'react-calendar/dist/Calendar.css';
import stylesTimeEntry from '../components/css/TimeEntry.module.css';

function notify(msg:String, type:String){
  if (type == 'error'){
    toast.error(msg, {
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      progress: undefined,
      theme: "light",
    });
  } else if (type == 'warn'){
    toast.warn(msg, {
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      progress: undefined,
      theme: "light",
    });
  } else if (type == 'success'){
    toast.success(msg, {
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      progress: undefined,
      theme: "light",
    });
  } else if (type == 'info'){
  toast.info(msg, {
    position: "bottom-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    progress: undefined,
    theme: "light",
  });
  }
}


export default function TimeEntry() {
  const { data: session } = useSession();
  const [email] = useState(session?.user?.email);
  const [prevDate, setPrevDate] = useState(new Date('0001-01-01'));
  const [date, setDate] = useState(new Date());
  const [timePunchData, setTimePunchData] = useState<any[]>([]);
  const [timePunchMonthData, setTimePunchMonthData] = useState<number[]>([]);

  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    refreshStatus();
    const r = setInterval(() => {
      setCurrentDate(new Date().toLocaleString("en-US", {weekday: 'short', month: 'short', day: '2-digit', year: 'numeric'}));
      setCurrentTime(new Date().toLocaleString("en-US", {hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false}));
    }, 1000);
    return () => { clearInterval(r) }
  }, []);

  async function refreshStatus() {
    await getTimeEntryPerDay(new Date());
    await getTimeEntryPerMonth(new Date(), true);
  }

  async function getTimeEntryPerDay(datePara: Date) {
    if (typeof(datePara) === 'undefined') return;
    let formattedDate = datePara.toLocaleDateString("en-US", {year: 'numeric', month: '2-digit', day: '2-digit'});
    const apiUrlEndpoint = 'api/fetchSql';
    const postData = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json '},
        body: JSON.stringify({
            action: 'fetch',
            query: 'fetchTimeEntryDayQuery',
            para: [email, formattedDate]
        })
    }
    
    const response = await fetch(apiUrlEndpoint, postData);
    const res = await response.json();
    setTimePunchData(res.data);
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
    let formattedDate = datePara.toLocaleDateString("en-US", {year: 'numeric', month: '2-digit'});
    const apiUrlEndpoint = 'api/fetchSql';
    const postData = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json '},
        body: JSON.stringify({
            action: 'fetch',
            query: 'fetchTimeEntryMonthQuery',
            para: [email, formattedDate]
        })
    }
    
    const response = await fetch(apiUrlEndpoint, postData);
    const res = await response.json();
    let data = res.data;
    let tmp: Array<number> = [];
    data.forEach((item: any) => {
      let time = new Date(item.DATE).setHours(0,0,0,0);
      tmp.push(time);
    });
    setTimePunchMonthData(tmp);
  }

  
  async function submitTimeEntry(action: string) {
    let prevAction:string = 'OUT';
    if (Object.keys(timePunchData).length !== 0){
      prevAction = timePunchData[timePunchData.length - 1].ACTION;
    }
    if (!['IN', 'OUT', 'BREAK'].includes(action)){
      notify('Invalid Action', 'error');
      return;
    }
    if (action == 'IN' &&  prevAction != 'OUT'){
      notify('You\'ve already clocked in', 'error');
      return;
    }
    if (['OUT', 'BREAK'].includes(action) &&  prevAction == 'OUT'){
      notify('You have to clock in first', 'error');
      return;
    }
    setLoading(true);
    const apiUrlEndpoint = 'api/fetchSql';
    const postData = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json '},
        body: JSON.stringify({
            action: 'fetch',
            query: 'submitTimeEntry',
            para: [email, action]
        })
    }
    
    const response = await fetch(apiUrlEndpoint, postData);
    const res = await response.json();
    if (res.data.affectedRows == 0) {
      setLoading(false);
      notify('Something went wrong! Please try again later', 'error');
      return;
    }
    refreshStatus();
  }
  
  function tileContent(datePara: any) {
    let formattedDate = datePara.date.setHours(0,0,0,0);
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
            <title>{`Time Entry | ${process.env.websiteName}`}</title>
        </Head>
        <h1>Time Entry</h1>

        <div className={stylesTimeEntry.SplitViewRow}>
          <div>
            <div className={stylesTimeEntry.Clock}>
              <div>{currentDate}</div>
              <div className={stylesTimeEntry.ClockTime}>{currentTime}</div>
            </div>
            <Calendar className={stylesTimeEntry.CalendarContainer}
              locale='en-US'
              onChange={(datePara: any) => {
                setLoading(true);
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
                <div><i><small>*One break is 30 minutes.</small></i></div>
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