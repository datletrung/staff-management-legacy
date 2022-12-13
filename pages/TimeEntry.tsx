// useClient because we're using react client code
// see https://beta.nextjs.org/docs/rendering/server-and-client-components
'use client';

import stylesTimeEntry from './css/TimeEntry.module.css';
import { DateTime } from 'luxon';
import { useState, useEffect } from 'react';
import  Head from 'next/head';
import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';
import TextField  from '@mui/material/TextField';
import SendIcon from '@mui/icons-material/Send';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';

export default function TimeEntry() {
  const [loading, setLoading] = useState(false);
  //this is fine for testing, but it is bad practice
  // if this is the current times from a database, it will be an api call
  // if this is a default, I would put it into a const.tsx file
  // as well, if this is just an array, you can just do useState([...data])
  // in my opinion, a user should only be able to set their hours for the current day
  // so I don't think we need any array with all the dates
  const [hours, setHours ] = useState(0);
  const [dateTime, setDateTime] = useState([
                                              { day: 'Monday', time: 1, },
                                              { day: 'Tuesday', time: 1, },
                                              { day: 'Wednesday', time: 1, },
                                              { day: 'Thursday', time: 1, },
                                              { day: 'Friday', time: 1, },
                                              { day: 'Saturday', time: 1, },
                                              { day: 'Sunday', time: 1, },
                                            ]);

  const [currentDatetime, setCurrentDatetime] = useState(DateTime.now());
  //instead of this, we can just directly call setCurrentDateTime from the interval
  /*
  const updateCurrentDatetime = useCallback(() => {
    setCurrentDatetime(() => new Date().toLocaleString() + "");
  }, [setCurrentDatetime]);
 */
  useEffect(() => {
    console.log(currentDatetime);
    const r = setInterval(() => {
      setCurrentDatetime(DateTime.now());
    }, 1000);

    return () => { clearInterval(r) }
  }, [])
  const handleSubmit = async () => {
    //handle submit here
    setLoading(true)
    //just for demonstration, we can wait for 1 second
    const sleep = (ms: number | undefined) => new Promise(
      resolve => setTimeout(resolve, ms)
    );
    await sleep(1000);
    //setLoading to false, once submit is finished
    setLoading(false)
  }
  const handleDateTimeSubtract = () => {
    //do onclick stuff in here
    //since we're using tsx, we need to specify a type for arrays
    const tmp: { day: string; time: number; }[] = [];
    dateTime.map((dateTimeItemTmp) => {
      let timeTmp = dateTimeItemTmp.time;
      //This will always be true?
      if (dateTimeItemTmp.day == dateTimeItemTmp.day) {
          timeTmp -= 1;
      }
      tmp.push({ day: dateTimeItemTmp.day, time: timeTmp });
    })
    setDateTime(tmp);
  }
  const handleDateTimeAdd = () => {
    const tmp: { day: string; time: number; }[] = [];
    dateTime.map((dateTimeItemTmp) => {
      let timeTmp = dateTimeItemTmp.time;
      if (dateTimeItemTmp.day == dateTimeItemTmp.day) {
        timeTmp += 1;
      }
      tmp.push({ day: dateTimeItemTmp.day, time: timeTmp });
    })
    setDateTime(tmp);
  }
  return (
    <>
        <Head>
            <title>Time Entry | {process.env.websiteName}</title>
        </Head>
        <h1>Time Entry</h1>
        <div><i><b>Current Time: </b>{currentDatetime.toLocaleString(DateTime.DATETIME_MED)}</i></div>
        <br/>
        <div>
          <Button size="large" variant="outlined" type="submit" color="success" endIcon={<LoginIcon />} className={stylesTimeEntry.ClockInOut}>Clock In</Button>
          <Button size="large" variant="outlined" type="submit" color="success" endIcon={<LogoutIcon />} className={stylesTimeEntry.ClockInOut}>Clock Out</Button>
        </div>
        
        {/* For now, I'm going to have all this commented out so that you can compare our approaches
        {dateTime.map((dateTimeItem, dateTimeIndex) => (
          <>
          <div key={dateTimeIndex} className={stylesTimeEntry.DateDiv}>
            <h4 className={stylesTimeEntry.DateLabel}>{dateTimeItem.day}</h4>
            <div className={stylesTimeEntry.TimeEntryDiv}>

            {[...Array(dateTimeItem.time)].map((timeItem, timeIndex, times) => (
              <>
              <div key={timeIndex} className={stylesTimeEntry.TimeDiv}>
                <TextField className={stylesTimeEntry.Input}
                            label={"From"+(dateTimeItem.time > 1 ? " (" + times[timeIndex+1] + ")": '')}
                            variant="standard"
                            type="text"
                            id={"time-from-"+dateTimeItem.day+"-"+timeIndex}
                />
              </div>
              <div className={stylesTimeEntry.TimeDiv}>
                <TextField className={stylesTimeEntry.Input}
                            label={"To"+(dateTimeItem.time > 1 ? " (" + String(timeIndex+1) + ")": '')}
                            variant="standard"
                            type="text"
                            id={"time-to-"+dateTimeItem.day+"-"+timeIndex}
                />
              </div>
              </>
            ))}
            </div>
            <div className={stylesTimeEntry.signDiv}>
              <i className={`fa-solid fa-minus fa-xl ${stylesTimeEntry.FAIcon}`} style={{display: (dateTimeItem.time > 1 ? 'block' : 'none')}}
                  onClick={handleDateTimeSubtract}
              ></i>
              <i className={`fa-solid fa-plus fa-xl ${stylesTimeEntry.FAIcon}`} style={{display: (dateTimeItem.time < 5 ? 'block' : 'none')}}
                  onClick={handleDateTimeAdd}
              ></i>
            </div>
          </div>
          </>
        ))}
            */}
        <div>
          <LoadingButton
            size="large"
            onClick={handleSubmit}
            endIcon={<SendIcon />}
            loading={loading}
            loadingPosition="end"
            variant="outlined"
            color="success"
          >
            Submit
          </LoadingButton>
        </div>
    </>
  );
}