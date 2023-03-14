import Head from 'next/head';
export default function AccessDenied(){
    return (
        <>
        <Head>
        <title>{`${process.env.WebsiteName}`}</title>
        </Head>
        <h3 style={{color: "red"}}>You do not have permission to view this page.</h3>
        </>
    );
}