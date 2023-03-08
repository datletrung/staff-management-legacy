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

  const [totalTime, setTotalTime] = useState(0);
  const [totalBreakTime, setTotalBreakTime] = useState(0);
  const [totalWorkingTime, setTotalWorkingTime] = useState(0);

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
    let formattedDate = datePara.toLocaleString("en-US", {year: 'numeric', month: '2-digit', day: '2-digit'});
    const apiUrlEndpoint = 'api/fetchSql';
    let postData = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json '},
        body: JSON.stringify({
            action: 'fetch',
            query: 'fetchTimeEntryDayQuery',
            para: [email, formattedDate]
        })
    }
    
    let response = await fetch(apiUrlEndpoint, postData);
    let res = await response.json();
    setTimePunchData(res.data);

    let n_totalTime = 0;
    res.data.forEach((item: {TIME_IN: Date, TIME_OUT: Date}) => {
      let timeIn = new Date(item.TIME_IN);
      let timeOut = (item.TIME_OUT) ? new Date(item.TIME_OUT) : null;
      if (timeOut != null){
        n_totalTime += (timeOut.valueOf() - timeIn.valueOf())/60000;
      } else {
        n_totalTime += (new Date().valueOf() - timeIn.valueOf())/60000;
      }
    });
    setTotalTime(Math.floor(n_totalTime));

    postData = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json '},
        body: JSON.stringify({
            action: 'fetch',
            query: 'fetchBreakDayQuery',
            para: [email, formattedDate]
        })
    }
    
    response = await fetch(apiUrlEndpoint, postData);
    res = await response.json();
    let n_breakTime = res.data[0].BREAK_NUM*30;
    setTotalBreakTime(n_breakTime);

    setTotalWorkingTime(Math.floor((n_totalTime-n_breakTime < 0) ? 0 : (n_totalTime-n_breakTime)));
    

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
    let formattedDate = datePara.toLocaleString("en-US", {year: 'numeric', month: '2-digit'});
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
    let clockedIn:boolean = false;
    if (Object.keys(timePunchData).length !== 0){
      clockedIn = (timePunchData[timePunchData.length - 1].TIME_OUT == null) ? true : false;
    }
    if (!['IN', 'OUT', 'BREAK'].includes(action)){
      notify('Invalid Action', 'error');
      return;
    }
    if (action == 'IN' &&  clockedIn === true){
      notify('You\'ve already clocked in', 'error');
      return;
    }
    if (action == 'OUT' &&  clockedIn === false){
      notify('You need to clock in first', 'error');
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
                      size="large" variant="outlined" color="success" endIcon={<LoginIcon/>}
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
                      size="large" variant="outlined" color="error" endIcon={<LogoutIcon/>}
                      loading={loading} loadingPosition="end"
                      className={stylesTimeEntry.Button}
                      onClick={() => submitTimeEntry('OUT')}
                      disabled={disabled}
                    >
                      Clock Out
                    </LoadingButton>
                  </div>
                  <div className={stylesTimeEntry.Button}>
                    <LoadingButton
                      size="large" variant="outlined" endIcon={<AddAlarmIcon/>}
                      loading={loading} loadingPosition="end"
                      className={stylesTimeEntry.Button}
                      onClick={() => submitTimeEntry('BREAK')}
                      disabled={disabled}
                    >
                      Add Break
                    </LoadingButton>
                  </div>
                </div>
                <div><i><small>*One break is 30 minutes.</small></i></div>
              </div>
              </div>
              <div className={`${stylesTimeEntry.SplitViewColumnChild} ${stylesTimeEntry.TimePunchView}`}>
                {timePunchData.map((item:any, idx:number) => {
                    let timeIn = (item.TIME_IN) ? new Date(item.TIME_IN).toLocaleString("en-US", {hour: '2-digit', minute: '2-digit', hour12: true}) : '-';
                    let timeOut = (item.TIME_OUT) ? new Date(item.TIME_OUT).toLocaleString("en-US", {hour: '2-digit', minute: '2-digit', hour12: true}) : '-';
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