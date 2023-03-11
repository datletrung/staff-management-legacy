'use client';

import { useSession, signIn } from "next-auth/react";
import { useRouter } from 'next/router';
import Head from 'next/head';
import stylesIndex from '../components/css/index.module.css';

export default function Account() {
    const {data: session} = useSession();
    const router = useRouter();
    if (router.query.returnUrl) router.push(router.query.returnUrl.toString())

    return (
        <>
            <Head>
                <title>{`${process.env.WebsiteName}`}</title>
            </Head>
            {(!session) //if not signed in then display sign in button
                ?   <>
                    <h1>{`Welcome to ${process.env.CompanyName}!`}</h1>
                    <p>Please sign in with your <i>company account</i> to continue:</p>
                    <center>
                        <button
                            onClick={() => signIn('google', {
                                redirect: false,
                            })}
                            className={stylesIndex.SignInButton}
                        >
                            Sign in with Google
                        </button>
                    </center>
                </>
                :
                <>
                <h1>{`Welcome back, ${session?.user?.name}!`}</h1>
                
                </>
            }
        </>
    )

  
}