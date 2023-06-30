'use client';

import { useSession, signIn } from "next-auth/react";
import { useRouter } from 'next/router';
import { useState } from 'react';
import Head from 'next/head';
import { TextField, Button } from '@mui/material';
import Notify from '../components/Notify';
import stylesIndex from '../components/css/index.module.css';

export default function Account() {
    const {data: session} = useSession();
    const router = useRouter();

    const [personUserName, setPersonUserName] = useState('');
    const [personPassword, setPersonPassword] = useState('');

    async function handleSignIn() {
        const result = await signIn('credentials', {
            email: personUserName,
            password: personPassword,
            redirect: false,
        });

        if (result?.error) {
            Notify(result.error, 'error');
        }
    };

    if (router.query.returnUrl) router.push(router.query.returnUrl.toString());
    return (
        <>
            <Head>
                <title>{`${process.env.WebsiteName}`}</title>
            </Head>
            {(!session) //if not signed in then display sign in button
                ?   <>
                    <h1>{`Welcome to ${process.env.CompanyName}!`}</h1>
                    <div className={stylesIndex.FormContainer}>
                        <p>Please sign in to continue:</p>
                        <TextField
                            id='user-input'
                            label='Email or User ID'
                            variant='standard'
                            value={personUserName}
                            onChange={(event) => setPersonUserName(event.target.value)}
                            className={stylesIndex.FormChild}
                        />
                        <TextField
                            id='password-input'
                            label='Password'
                            variant='standard'
                            type='password'
                            value={personPassword}
                            onChange={(event) => setPersonPassword(event.target.value)}
                            className={stylesIndex.FormChild}
                        />
                        <br/><br/>
                        <Button
                            size="large"
                            variant="outlined"
                            color="success"
                            onClick={() => handleSignIn()}
                            className={stylesIndex.FormChild}
                        >
                            Sign in with Credentials
                        </Button>
                    </div>
                </>
                :
                <>
                <h1>{`Welcome back, ${session?.user?.name}!`}</h1>
                
                </>
            }
        </>
    )
}