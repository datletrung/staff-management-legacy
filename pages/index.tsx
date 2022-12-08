import Head from 'next/head';

export default function Dashboard() {
    return (
        <>
            <Head>
                <title>Dashboard | {process.env.websiteName}</title>
            </Head>
            <h1>Welcome to Lionrock Tech!</h1>
        </>
    );
}