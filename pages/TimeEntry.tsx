import React, { useCallback, useEffect, useState } from "react";
import Head from 'next/head';
import stylesTimeEntry from './css/TimeEntry.module.css';
import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';
import TextField  from '@mui/material/TextField';
import SendIcon from '@mui/icons-material/Send';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';

export default function TimeEntry() {
  const [loading, setLoading] = useState(false);
  const [dateTime, setDateTime] = useState({ dateTimeArray : [
                                                              { day: 'Monday', time: 1, },
                                                              { day: 'Tuesday', time: 1, },
                                                              { day: 'Wednesday', time: 1, },
                                                              { day: 'Thursday', time: 1, },
                                                              { day: 'Friday', time: 1, },
                                                              { day: 'Saturday', time: 1, },
                                                              { day: 'Sunday', time: 1, },
                                                            ] });

  const [currentDatetime, setCurrentDatetime] = useState(new Date().toLocaleString() + "");
  const updateCurrentDatetime = useCallback(() => {
    setCurrentDatetime(() => new Date().toLocaleString() + "");
  }, [setCurrentDatetime]);

  useEffect(() => {
    const r = setInterval(() => {
      updateCurrentDatetime();
    }, 1000);

    return () => { clearInterval(r) }
  }, [])

  return (
    <>
        <Head>
            <title>Time Entry | {process.env.websiteName}</title>
        </Head>
        <h1>Time Entry</h1>
        <div><i><b>Current Time: </b>{currentDatetime}</i></div>
        <br/>
        <div>
          <Button size="large" variant="outlined" type="submit" color="success" endIcon={<LoginIcon />} className={stylesTimeEntry.ClockInOut}>Clock In</Button>
          <Button size="large" variant="outlined" type="submit" color="success" endIcon={<LogoutIcon />} className={stylesTimeEntry.ClockInOut}>Clock Out</Button>
        </div>
        {dateTime.dateTimeArray.map((dateTimeItem, dateTimeIndex) => (
          <>
          <div key={dateTimeIndex} className={stylesTimeEntry.DateDiv}>
            <h4 className={stylesTimeEntry.DateLabel}>{dateTimeItem.day}</h4>
            <div className={stylesTimeEntry.TimeEntryDiv}>
            {[...Array(dateTimeItem.time)].map((timeItem, timeIndex) => (
              <>
              <div key={timeIndex} className={stylesTimeEntry.TimeDiv}>
                <TextField className={stylesTimeEntry.Input}
                            label={"From"+(dateTimeItem.time > 1 ? " (" + parseInt(timeIndex+1) + ")": '')}
                            variant="standard"
                            type="text"
                            id={"time-from-"+dateTimeItem.day+"-"+timeIndex}
                />
              </div>
              <div className={stylesTimeEntry.TimeDiv}>
                <TextField className={stylesTimeEntry.Input}
                            label={"To"+(dateTimeItem.time > 1 ? " (" + parseInt(timeIndex+1) + ")": '')}
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
                  onClick={() => {
                        const tmp = [];
                        dateTime.dateTimeArray.map((dateTimeItemTmp) => {
                          var timeTmp = dateTimeItemTmp.time;
                          if (dateTimeItemTmp.day == dateTimeItem.day) {
                            timeTmp -= 1;
                          }
                          tmp.push({ day: dateTimeItemTmp.day, time: timeTmp });
                      })
                        setDateTime({ dateTimeArray: tmp });
                      }
                  }
              ></i>
              <i className={`fa-solid fa-plus fa-xl ${stylesTimeEntry.FAIcon}`} style={{display: (dateTimeItem.time < 5 ? 'block' : 'none')}}
                  onClick={() => {
                        const tmp = [];
                        dateTime.dateTimeArray.map((dateTimeItemTmp) => {
                          var timeTmp = dateTimeItemTmp.time;
                          if (dateTimeItemTmp.day == dateTimeItem.day) {
                            timeTmp += 1;
                          }
                          tmp.push({ day: dateTimeItemTmp.day, time: timeTmp });
                      })
                        setDateTime({ dateTimeArray: tmp });
                      }
                  }
              ></i>
            </div>
          </div>
          </>
        ))}
        <div>
          <LoadingButton
            size="large"
            onClick={() => {setLoading(true);}}
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