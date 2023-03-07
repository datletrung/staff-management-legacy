'use client';

import Head from 'next/head';
import TimeEntryFetch from '../components/script/TimeEntryFetch';

export default function Test() {
  return (
    <>
        <Head>
            <title>{`Assignments | ${process.env.websiteName}`}</title>
        </Head>
        <h1>Test</h1>
        <TimeEntryFetch/>
    </>
  );
}