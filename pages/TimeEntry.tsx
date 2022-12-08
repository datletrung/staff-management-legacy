import Head from 'next/head';

export default function TimeEntry() {
  return (
    <>
        <Head>
            <title>Time Entry | {process.env.websiteName}</title>
        </Head>
        <h1>Time Entry</h1>
    </>
  );
}