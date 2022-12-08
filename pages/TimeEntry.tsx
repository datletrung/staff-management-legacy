import Head from 'next/head';
import stylesTimeEntry from './css/TimeEntry.module.css';
import Button from '@mui/material/Button';

export default function TimeEntry() {
  return (
    <>
        <Head>
            <title>Time Entry | {process.env.websiteName}</title>
        </Head>
        <h1>Time Entry</h1>
        <div className={stylesTimeEntry.DateDiv}>

          <div className={stylesTimeEntry.TimeEntryDiv}>
            <div className={stylesTimeEntry.TimeDiv}>
              <label className={stylesTimeEntry.Label}>From</label>
              <input className={stylesTimeEntry.Input} type="text" id="name" name="name" required />
            </div>
            <div className={stylesTimeEntry.TimeDiv}>
              <label className={stylesTimeEntry.Label}>To</label>
              <input className={stylesTimeEntry.Input} type="text" id="name" name="name" required />
            </div>
          </div>
          
        </div>
        <Button variant="contained" type="submit" color="success">Submit</Button>
    </>
  );
}