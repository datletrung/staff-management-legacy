'use client';

import { useSession, signIn } from "next-auth/react";
import { useRouter } from 'next/router';
import Head from 'next/head';
import stylesIndex from '../components/css/index.module.css';

export default function Account() {
    const {data: session} = useSession();
    const router = useRouter();
    if (!session) { //if not signed in then display sign in button
        return (
            <>
                <Head>
                    <title>{`${process.env.websiteName}`}</title>
                </Head>
                <h1>Welcome to Lionrock Tech!</h1>
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
        )
    } else { //if signed in then redirect to Dashboard or whereever the user left
        router.push(!router.query.returnUrl
                            ? '/Dashboard'
                            : router.query.returnUrl.toString());
    }
}