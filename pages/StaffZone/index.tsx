'use client';

import Link from "next/link";
import Head from 'next/head';
import { checkPermissions } from '@components/CheckPermission';
import AccessDenied from '@components/AccessDenied';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStopwatch, faCalendarXmark } from '@fortawesome/free-solid-svg-icons';

import 'react-calendar/dist/Calendar.css';
import styles from '@components/css/StaffZone/index.module.css';


export default function StaffZone() {
    if (!checkPermissions()) {
        return <AccessDenied/>;
    }

    return (
        <>
            <Head>
                <title>{`Staff Zone | ${process.env.WebsiteName}`}</title>
            </Head>
            <h2>Staff Zone</h2>
            <div className={styles.OptionButtonContainer}>
                <Link href={"/StaffZone/TimeEntry"}>
                    <div className={styles.OptionButton}>
                        <FontAwesomeIcon icon={faStopwatch} className={styles.OptionButtonIcon} size='2xl'/>
                        <h2>Time Entry</h2>
                    </div>
                </Link>
                <Link href={"/StaffZone/Absence"}>
                    <div className={styles.OptionButton}>
                        <FontAwesomeIcon icon={faCalendarXmark} className={styles.OptionButtonIcon} size='2xl'/>
                        <h2>Absence</h2>
                    </div>
                </Link>
            </div>
        </>
    );
}