import Head from 'next/head';

export default function Assignments() {
  return (
    <>
        <Head>
            <title>{`Assignments | ${process.env.websiteName}`}</title>
        </Head>
        <h1>Assignments</h1>
    </>
  );
}