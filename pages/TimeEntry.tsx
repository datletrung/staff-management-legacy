import React, { useState } from "react";
import Head from 'next/head';
import stylesTimeEntry from './css/TimeEntry.module.css';
import Button from '@mui/material/Button';
import TextField  from '@mui/material/TextField';

export default function TimeEntry() {
  const [dateTime, setdateTime] = useState({ dateTimeArray : [
                                                              { day: 'Monday', time: 1, },
                                                              { day: 'Tuesday', time: 1, },
                                                              { day: 'Wednesday', time: 1, },
                                                              { day: 'Thursday', time: 1, },
                                                              { day: 'Friday', time: 1, },
                                                              { day: 'Saturday', time: 1, },
                                                              { day: 'Sunday', time: 1, },
                                                            ] });

  return (
    <>
        <Head>
            <title>Time Entry | {process.env.websiteName}</title>
        </Head>
        <h1>Time Entry</h1>
        {dateTime.dateTimeArray.map((dateTimeItem) => (
          <>
          <div className={stylesTimeEntry.DateDiv}>
            <h4 className={stylesTimeEntry.DateLabel}>{dateTimeItem.day}</h4>
            <div className={stylesTimeEntry.TimeEntryDiv}>
            {[...Array(dateTimeItem.time)].map((timeIndex) => (
              <>
              <div key={timeIndex} className={stylesTimeEntry.TimeDiv}>
                <TextField className={stylesTimeEntry.Input} label="From" variant="standard" type="text" id={"time-from-"+timeIndex} defaultValue={'00:00 AM'}
                              onClick={event => {if (event.target.defaultValue == '00:00 AM') event.target.defaultValue = '';}}
                />
              </div>
              <div className={stylesTimeEntry.TimeDiv}>
              <TextField className={stylesTimeEntry.Input} label="To" variant="standard" type="text" id={"time-to-"+timeIndex} defaultValue={'00:00 AM'}
                              onClick={event => {if (event.target.defaultValue == '00:00 AM') event.target.defaultValue = '';}}
                              
                />
              </div>
              </>
            ))}
            </div>
            <div className={stylesTimeEntry.signDiv}>
              <i className={`fa-solid fa-minus fa-xl ${stylesTimeEntry.FAIcon}`}
                  onClick={() => {
                        const tmp = [];
                        dateTime.dateTimeArray.map((dateTimeItemTmp) => {
                          var timeTmp = dateTimeItemTmp.time;
                          if (dateTimeItemTmp.day == dateTimeItem.day) {
                            timeTmp -= 1;
                          }
                          tmp.push({ day: dateTimeItemTmp.day, time: timeTmp });
                      })
                        setdateTime({ dateTimeArray: tmp });
                      }
                  }
              ></i>
              <i className={`fa-solid fa-plus fa-xl ${stylesTimeEntry.FAIcon}`}
                  onClick={() => {
                        const tmp = [];
                        dateTime.dateTimeArray.map((dateTimeItemTmp) => {
                          var timeTmp = dateTimeItemTmp.time;
                          if (dateTimeItemTmp.day == dateTimeItem.day) {
                            timeTmp += 1;
                          }
                          tmp.push({ day: dateTimeItemTmp.day, time: timeTmp });
                      })
                        setdateTime({ dateTimeArray: tmp });
                      }
                  }
              ></i>
            </div>
          </div>
          </>
        ))}
        <Button size="large" variant="outlined" type="submit" color="success">Submit</Button>
    </>
  );
}