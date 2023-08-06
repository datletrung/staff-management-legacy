'use client';

import Link from "next/link";
import Head from 'next/head';
import { checkPermissions } from '@components/CheckPermission';
import AccessDenied from '@components/AccessDenied';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserGroup, faCog, faStopwatch, faCalendarXmark, faFileInvoiceDollar } from '@fortawesome/free-solid-svg-icons';

import 'react-calendar/dist/Calendar.css';
import styles from '@components/css/ManagerZone/index.module.css';


export default function ManagerZone() {
    if (!checkPermissions()) {
        return <AccessDenied/>;
    }

    return (
        <>
            <Head>
                <title>{`Manager Zone | ${process.env.WebsiteName}`}</title>
            </Head>
            <h2>Manager Zone</h2>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <hr style={{ flex: 1, marginRight: '10px' }} />
                <h3>Core</h3>
                <hr style={{ flex: 1, marginLeft: '10px' }} />
            </div>
            <div className={styles.OptionButtonContainer}>
                <Link href={"/ManagerZone/AppSettings"}>
                    <div className={styles.OptionButton}>
                        <FontAwesomeIcon icon={faCog} className={styles.OptionButtonIcon} size='2xl'/>
                        <h2>App Settings</h2>
                    </div>
                </Link>
                <Link href={"/ManagerZone/ManageStaff"}>
                    <div className={styles.OptionButton}>
                        <FontAwesomeIcon icon={faUserGroup} className={styles.OptionButtonIcon} size='2xl'/>
                        <h2>Manage Staff</h2>
                    </div>
                </Link>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <hr style={{ flex: 1, marginRight: '10px' }} />
                <h3>Tools</h3>
                <hr style={{ flex: 1, marginLeft: '10px' }} />
            </div>
            <div className={styles.OptionButtonContainer}>
                <Link href={"/ManagerZone/TimeSheet"}>
                    <div className={styles.OptionButton}>
                        <FontAwesomeIcon icon={faStopwatch} className={styles.OptionButtonIcon} size='2xl'/>
                        <h2>Time Sheet</h2>
                    </div>
                </Link>
                <Link href={"/ManagerZone/ManageAbsence"}>
                    <div className={styles.OptionButton}>
                        <FontAwesomeIcon icon={faCalendarXmark} className={styles.OptionButtonIcon} size='2xl'/>
                        <h2>Manage Absence</h2>
                    </div>
                </Link>
                <Link href={"/ManagerZone/Payroll"}>
                    <div className={styles.OptionButton}>
                        <FontAwesomeIcon icon={faFileInvoiceDollar} className={styles.OptionButtonIcon} size='2xl'/>
                        <h2>Payroll</h2>
                    </div>
                </Link>
            </div>
        </>
    );
}