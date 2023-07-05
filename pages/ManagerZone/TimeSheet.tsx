'use client';

import Link from "next/link";
import Head from 'next/head';
import Notify from '@components/Notify';
import { useState, useEffect } from 'react';
import baseApiUrl from '@api/apiConfig';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faArrowsRotate } from '@fortawesome/free-solid-svg-icons';
import { checkPermissions } from '@components/CheckPermission';
import AccessDenied from '@components/AccessDenied';

import stylesManagerZoneTimeSheet from '@components/css/ManagerZone/TimeSheet.module.css';
import { useSession } from "next-auth/react";

export default function ManagerZoneTimeSheet() {
    if (!checkPermissions()) {
        return <AccessDenied/>;
    }

    const {data: session} = useSession();
    const [userId] = useState(session?.user?.userId);
    const [employeeList, setEmployeeList] = useState<string[]>([]);

    const [staffCurrentViewId, setStaffCurrentViewId] = useState('');
    const [staffCurrentViewFirstName, setStaffCurrentViewFirstName] = useState('');
    const [staffCurrentViewLastName, setStaffCurrentViewLastName] = useState('');
    const [staffCurrentViewEmail, setStaffCurrentViewEmail] = useState('');
    const [staffCurrentViewPhoneNumber, setStaffCurrentViewPhoneNumber] = useState('');

    const [loading, setLoading] = useState(false);


    async function getEmployeeList() {
        const apiUrlEndpoint = `${baseApiUrl}/fetchSql`;
        let postData = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json '},
            body: JSON.stringify({
                query: 'fetchEmployeeList',
                para: []
            })
        }
        
        let response = await fetch(apiUrlEndpoint, postData);
        let res = await response.json();
        setEmployeeList(res.data);
    }

    useEffect(() => {
        getEmployeeList();
    }, [])

    return (
        <>
            <Head>
                <title>{`${process.env.WebsiteName}`}</title>
            </Head>
            {/*viewStaffAdditionPopup && <div className={stylesManagerZoneTimeSheet.BlurView} onClick={() => {
            }} />*/} {/*CHANGE_THIS*/}

            <h1><Link href={'/ManagerZone'}>Manager Zone</Link> {`> Time Sheet`}</h1>
            <div className={stylesManagerZoneTimeSheet.ViewContainer}>
                <div className={stylesManagerZoneTimeSheet.ViewChildFlexColumnLeft}>
                    <div className={stylesManagerZoneTimeSheet.Title}>
                        <h2 className={stylesManagerZoneTimeSheet.TitleText}>
                            Employee List
                        </h2>
                        <FontAwesomeIcon
                            icon={faArrowsRotate}
                            style={{cursor: 'pointer'}}
                            onClick={() => {
                                getEmployeeList();
                                //setViewStaffOption(false); // CHANGE_THIS
                            }}
                        />
                    </div>
                    <div className={stylesManagerZoneTimeSheet.EmployeeList}>
                        {employeeList.map((item:any, idx:number) => {
                            let staffUserIdTmp = item.USER_ID;
                            let emailTmp = item.EMAIL;
                            let firstNameTmp = item.FIRST_NAME;
                            let lastNameTmp = item.LAST_NAME;
                            let fullNameTmp = item.FIRST_NAME + ' ' + item.LAST_NAME;
                            let phoneTmp = item.PHONE_NUMBER;
                            return (
                            <div key={idx} className={`${stylesManagerZoneTimeSheet.EmployeeCardContainer}`}>
                                <FontAwesomeIcon icon={faUser} size="2xl" className={stylesManagerZoneTimeSheet.UserIcon}/>
                                <div className={`${stylesManagerZoneTimeSheet.EmployeeCard}`}
                                    onClick={() => {
                                        setStaffCurrentViewId((staffUserIdTmp)?staffUserIdTmp:'');
                                        setStaffCurrentViewFirstName((firstNameTmp)?firstNameTmp:'');
                                        setStaffCurrentViewLastName((lastNameTmp)?lastNameTmp:'');
                                        setStaffCurrentViewEmail((emailTmp)?emailTmp:'');
                                        setStaffCurrentViewPhoneNumber((phoneTmp)?phoneTmp:'');
                                        //CHANGE_THIS
                                    }}
                                >
                                    <b>{fullNameTmp}</b>
                                    <small>Staff ID: {staffUserIdTmp.toString().padStart(6, '0')}</small>
                                    <small>Email: {emailTmp}</small>
                                </div>
                            </div>
                            );                    
                        })}
                    </div>
                </div>
                <div id='detail-info'
                    className={`${stylesManagerZoneTimeSheet.ViewChildFlexColumnRight} ${loading ? stylesManagerZoneTimeSheet.LoadingBlur : ''}`}>
                    <div style={{ display: (true) ? 'block' : 'none' }}> {/*CHANGE_THIS*/}
                    </div>
                </div>
            </div>
        </>
    )
}