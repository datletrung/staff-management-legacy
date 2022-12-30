'use client';

import { LoadingButton } from '@mui/lab';
import { TextField, ToggleButton } from '@mui/material';
import { Save as SaveIcon, Send as SendIcon, Login as LoginIcon,
        Logout  as LogoutIcon, Edit  as EditIcon,
      } from '@mui/icons-material';

import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useSession, getSession } from 'next-auth/react';
import { toast } from 'react-toastify';

import { fetchCalendarDateQuery } from './sql/TimeEntry/fetchCalendarDate';
import { fetchTimeClockQuery } from './sql/TimeEntry/fetchTimeClock';

import stylesTimeEntry from './css/TimeEntry.module.css';


export default function TimeEntry({ calendarDate, timeClock }) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [disableEdit, setDisableEdit] = useState(true); // disable edit if not Manager
  const [currentDatetime, setCurrentDatetime] = useState(''); // display current date time
  
  const calendarDateData = JSON.parse(calendarDate); // retrieve and display date and month
  const timeClockData = JSON.parse(timeClock); // timeclock data

  const calculateFields = (date_id) => {
    // if no timeclock data then default numFieldData to 1
    const dateIdPos = timeClockData.findIndex(el => el.DATE_ID === date_id);
    if (dateIdPos === -1){
      return 1;
    }
    const times = timeClockData[dateIdPos]['TIME'].split(',');
    const len = times.length;
    // calculate numbers of field
    if (len % 2 === 0){ // if length is even means display just enough numbers of field
      return len / 2;
    } else { // if length is odd means display numbers of field + 1
      return Math.floor(len / 2) + 1;
    }
  }

  const dateData = (plus, date_id, timeIndex) => {
    const dateIdPos = timeClockData.findIndex(el => el.DATE_ID === date_id);
    if (dateIdPos === -1){ // if no timeclock data then default to null
      return null;
    }
    const times = timeClockData[dateIdPos]['TIME'].split(',');
    return times[(timeIndex*2)+plus]; // using this formula to find out index: from: (i*2) | to: (i*2)+1
  }

  const [dateTime, setDateTime] = useState([
          { date_id: calendarDateData[0]["DATE_ID"],
            weekday: calendarDateData[0]["WEEKDAY"],
            date: calendarDateData[0]["FORMATTED_DATE"],
            time: calculateFields(calendarDateData[0]["DATE_ID"]), },
          { date_id: calendarDateData[1]["DATE_ID"],
            weekday: calendarDateData[1]["WEEKDAY"],
            date: calendarDateData[1]["FORMATTED_DATE"],
            time: calculateFields(calendarDateData[1]["DATE_ID"]), },
          { date_id: calendarDateData[2]["DATE_ID"],
            weekday: calendarDateData[2]["WEEKDAY"],
            date: calendarDateData[2]["FORMATTED_DATE"],
            time: calculateFields(calendarDateData[2]["DATE_ID"]), },
          { date_id: calendarDateData[3]["DATE_ID"],
            weekday: calendarDateData[3]["WEEKDAY"],
            date: calendarDateData[3]["FORMATTED_DATE"],
            time: calculateFields(calendarDateData[3]["DATE_ID"]), },
          { date_id: calendarDateData[4]["DATE_ID"],
            weekday: calendarDateData[4]["WEEKDAY"],
            date: calendarDateData[4]["FORMATTED_DATE"],
            time: calculateFields(calendarDateData[4]["DATE_ID"]), },
          { date_id: calendarDateData[5]["DATE_ID"],
            weekday: calendarDateData[5]["WEEKDAY"],
            date: calendarDateData[5]["FORMATTED_DATE"],
            time: calculateFields(calendarDateData[5]["DATE_ID"]), },
          { date_id: calendarDateData[6]["DATE_ID"],
            weekday: calendarDateData[6]["WEEKDAY"],
            date: calendarDateData[6]["FORMATTED_DATE"],
            time: calculateFields(calendarDateData[6]["DATE_ID"]), },
        ]);
    
  useEffect(() => {
    const r = setInterval(() => {
      setCurrentDatetime(new Date().toLocaleString("en-US", {
                                                    weekday: 'short',
                                                    month: 'short',
                                                    day: '2-digit',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    second: '2-digit',
                                                    hour12: false,
                                                  }
                ));
    }, 1000);
    return () => { clearInterval(r) }
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    
    const sleep = (ms: number | undefined) => new Promise(
      resolve => setTimeout(resolve, ms)
    );
    await sleep(1000);
    setLoading(false);
  };

  const handleDateTimeSubtract = (dateTimeItem) => {
    const tmp: { date_id: string; weekday: string;  date: string; time: number; }[] = [];
    dateTime.map((dateTimeItemTmp) => {
      let timeTmp = dateTimeItemTmp.time;
      if (dateTimeItem.weekday == dateTimeItemTmp.weekday) {
          timeTmp -= 1;
      }
      tmp.push({ date_id: dateTimeItemTmp.date_id, weekday: dateTimeItemTmp.weekday,
                  date: dateTimeItemTmp.date, time: timeTmp });
    })
    setDateTime(tmp);
  };

  const handleDateTimeAdd = (dateTimeItem) => {
    const tmp: { weekday: string;  date: string; time: number; }[] = [];
    dateTime.map((dateTimeItemTmp) => {
      let timeTmp = dateTimeItemTmp.time;
      if (dateTimeItem.weekday == dateTimeItemTmp.weekday) {
        timeTmp += 1;
      }
      tmp.push({ date_id: dateTimeItemTmp.date_id, weekday: dateTimeItemTmp.weekday,
                  date: dateTimeItemTmp.date, time: timeTmp });
    })
    setDateTime(tmp);
  };

  const checkTime = (fieldId) => {
    const field = document.getElementById(fieldId);
    const isValid = /^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/.test(field.value);
    if (isValid) {
      field.style.backgroundColor = '#bfa';
      return true;
    } else {
      field.style.backgroundColor = '#fba';
      return false;
    }
  }

  return (
    <>
        <Head>
            <title>{`Time Entry | ${process.env.websiteName}`}</title>
        </Head>
        <h1>Time Entry</h1>
        <div><i><b>Current Time: </b>{currentDatetime}</i></div>
        <br/>
        <div>
        <LoadingButton
            size="large" variant="outlined" color="success" endIcon={<LoginIcon />}
            loading={loading} loadingPosition="end"
            className={stylesTimeEntry.Button}
            onClick={handleSubmit}
          >
            Clock In
          </LoadingButton>
          <LoadingButton
            size="large" variant="outlined" color="success" endIcon={<LogoutIcon />}
            loading={loading} loadingPosition="end"
            className={stylesTimeEntry.Button}
            onClick={handleSubmit}
          >
            Clock Out
          </LoadingButton>
          <ToggleButton
            size="small" color="success"
            value="check"
            selected={!disableEdit}
            onChange={() => {
              if (typeof window !== "undefined"
              && session
              && session.user.role != "EMPLOYEE") {
                setDisableEdit(!disableEdit);
              } else {
                toast.error("You don't have permission to use this feature.", {
                  position: "top-right",
                  autoClose: 5000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: false,
                  theme: "colored",
                });
              }
            }}
          >
            <EditIcon />
          </ToggleButton>
        </div>
        <div style={{marginTop:'1rem', marginBottom:'1rem',}}>
        {dateTime.map((dateTimeItem, dateTimeIndex) => (
          <>
          <div key={dateTimeIndex.toString()} className={stylesTimeEntry.DateDiv}>
            <div>
              <h4 className={stylesTimeEntry.DateLabel}>{dateTimeItem.weekday}</h4>
              <h5 className={stylesTimeEntry.DateLabel}>{dateTimeItem.date}</h5>
            </div>
            <div className={stylesTimeEntry.TimeEntryDiv}>
              {[...Array(dateTimeItem.time)].map((timeItem, timeIndex, times) => (
                <>
                <div key={'from-'+dateTimeIndex.toString()+timeIndex.toString()} className={stylesTimeEntry.TimeDiv}>
                  <TextField className={stylesTimeEntry.Input}
                              label={"From"+(dateTimeItem.time > 1 ? " (" + (timeIndex+1).toString() + ")": '')}
                              variant="standard" type="text"
                              disabled={disableEdit}
                              id={"time-from-"+dateTimeItem.date_id+"-"+timeIndex}
                              defaultValue={dateData(0, dateTimeItem.date_id, timeIndex)}
                              onChange={() => checkTime("time-from-"+dateTimeItem.date_id+"-"+timeIndex)}
                              onBlur={() => {
                                const idx = "time-from-"+dateTimeItem.date_id+"-"+timeIndex;
                                let field = document.getElementById(idx);
                                if (checkTime(idx) || (!checkTime(idx) && field.value === '')){
                                  field.style.backgroundColor = null;
                                }
                              }}
                  />
                </div>
                <div key={'to-'+dateTimeIndex.toString()+timeIndex.toString()} className={stylesTimeEntry.TimeDiv}>
                  <TextField className={stylesTimeEntry.Input}
                              label={"To"+(dateTimeItem.time > 1 ? " (" + (timeIndex+1).toString() + ")": '')}
                              variant="standard"
                              type="text"
                              disabled={disableEdit}
                              id={"time-to-"+dateTimeItem.date_id+"-"+timeIndex}
                              defaultValue={dateData(1, dateTimeItem.date_id, timeIndex)}
                              onChange={() => checkTime("time-to-"+dateTimeItem.date_id+"-"+timeIndex)}
                              onBlur={() => {
                                const idx = "time-to-"+dateTimeItem.date_id+"-"+timeIndex;
                                let field = document.getElementById(idx);
                                if (checkTime(idx) || (!checkTime(idx) && field.value === '')){
                                  field.style.backgroundColor = null;
                                }
                              }}
                  />
                </div>
                </>
              ))}
            </div>
           {(!disableEdit)
            ? (<>
            <div className={stylesTimeEntry.signDiv}>
              <i className={`fa-solid fa-minus fa-xl ${stylesTimeEntry.FAIcon}`} style={{display: (dateTimeItem.time > 1 ? 'block' : 'none')}}
                  onClick={() => handleDateTimeSubtract(dateTimeItem)}
              ></i>
              <i className={`fa-solid fa-plus fa-xl ${stylesTimeEntry.FAIcon}`} style={{display: (dateTimeItem.time < 5 ? 'block' : 'none')}}
                  onClick={() => handleDateTimeAdd(dateTimeItem)}
              ></i>
            </div>
            </>)
            : (<></>)
            }
          </div>
          </>
        ))}
        </div>
        <div>
          <LoadingButton
            size="large" variant="outlined" color="success" endIcon={<SendIcon />}
            loading={loading} loadingPosition="end"
            className={stylesTimeEntry.Button}
            onClick={handleSubmit}
          >
            Submit
          </LoadingButton>
        </div>
    </>
  );
}

export async function getServerSideProps(context) {
  const mysql = require('serverless-mysql')({
    config: {
      host     : process.env.sqlHostName,
      database : process.env.sqlDatabase,
      user     : process.env.sqlUsername,
      password : process.env.sqlPassword
    }
  });
  const session = await getSession(context);
  // retrieve date from db
  let calendarDate = await JSON.stringify(await mysql.query(fetchCalendarDateQuery));
  // retrieve person's timeclock
  let timeClock = await JSON.stringify(await mysql.query(fetchTimeClockQuery,
                                                        [ session.user.email ]
  ));
  await mysql.end();
  return { props: { calendarDate, timeClock } }
}