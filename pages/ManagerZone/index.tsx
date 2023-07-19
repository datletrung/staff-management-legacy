'use client';

import Link from "next/link";
import Head from 'next/head';
import { checkPermissions } from '@components/CheckPermission';
import AccessDenied from '@components/AccessDenied';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPeopleGroup, faCog, faStopwatch, faCalendarXmark, faFileInvoiceDollar } from '@fortawesome/free-solid-svg-icons';

import 'react-calendar/dist/Calendar.css';
import stylesManagerZone from '@components/css/ManagerZone/index.module.css';


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
            <div className={stylesManagerZone.OptionButtonContainer}>
                <Link href={"/ManagerZone/AppSettings"}>
                    <div className={stylesManagerZone.OptionButton}>
                        <FontAwesomeIcon icon={faCog} className={stylesManagerZone.OptionButtonIcon} size='2xl'/>
                        <h2>App Settings</h2>
                    </div>
                </Link>
                <Link href={"/ManagerZone/ManageStaff"}>
                    <div className={stylesManagerZone.OptionButton}>
                        <FontAwesomeIcon icon={faPeopleGroup} className={stylesManagerZone.OptionButtonIcon} size='2xl'/>
                        <h2>Manage Staff</h2>
                    </div>
                </Link>
            </div>
            <br/>
            <div className={stylesManagerZone.OptionButtonContainer}>
                <Link href={"/ManagerZone/TimeSheet"}>
                    <div className={stylesManagerZone.OptionButton}>
                        <FontAwesomeIcon icon={faStopwatch} className={stylesManagerZone.OptionButtonIcon} size='2xl'/>
                        <h2>Time Sheet</h2>
                    </div>
                </Link>
                <Link href={"/ManagerZone/ManageAbsence"}>
                    <div className={stylesManagerZone.OptionButton}>
                        <FontAwesomeIcon icon={faCalendarXmark} className={stylesManagerZone.OptionButtonIcon} size='2xl'/>
                        <h2>Manage Absence</h2>
                    </div>
                </Link>
                <Link href={"/ManagerZone/Payroll"}>
                    <div className={stylesManagerZone.OptionButton}>
                        <FontAwesomeIcon icon={faFileInvoiceDollar} className={stylesManagerZone.OptionButtonIcon} size='2xl'/>
                        <h2>Payroll</h2>
                    </div>
                </Link>
            </div>
        </>
    );
}