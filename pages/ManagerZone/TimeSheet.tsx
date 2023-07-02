'use client';

import Link from "next/link";
import Head from 'next/head';
import Notify from '@components/Notify';
import { useState, useEffect } from 'react';
import baseApiUrl from '@api/apiConfig';

import { checkPermissions } from '@components/CheckPermission';
import AccessDenied from '@components/AccessDenied';

import stylesManagerZoneTimeSheet from '@components/css/ManagerZone/TimeSheet.module.css';
import { useSession } from "next-auth/react";

export default function ManagerZoneTimeSheet() {
    if (!checkPermissions()) {
        return <AccessDenied/>;
    }

    const {data: session} = useSession();
    const [employeeList, setEmployeeList] = useState<String[]>([]);


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
        //getEmployeeList();
        calculatePayroll();
    }, [])


    async function calculatePayroll(){
        /*
        const apiUrlEndpoint = `${baseApiUrl}/fetchPayroll`;
        let postData = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json '},
            body: JSON.stringify({
                province: 'PE',
                annualPayPeriods: 24,
                wages: 1125,
                vacationPay: 45,
            })
        }
        let response = await fetch(apiUrlEndpoint, postData);
        let res = await response.json();
        let data = res.data;
        */
        const data = {
            CPP: "60.94",
            EI: "19.07",
            taxFed: "61.20",
            taxProv: "57.82",
            totalDeduction: "199.03",
            totalEarnings: "1170.00",
            totalNetPay: "970.97",
            totalTax: "119.02",
            vacationPay: "45.00",
            wages: "1125.00",
        }
        console.log(data);
    }

    return (
        <>
            <Head>
                <title>{`${process.env.WebsiteName}`}</title>
            </Head>
            <h1><Link href={'/ManagerZone'}>Manager Zone</Link> {`> Time Sheet`}</h1>

            <h3>Payroll Deduction</h3>
            <div>
                <span>Employee's name: Dat Le</span>
                <span>Employer's name: LRT</span>
                <span>Pay period frequency: Semi-monthly (24 pay periods a year)</span>
                <span>Date the employee is paid: 2025-01-01 (YYYY-MM-DD)</span>
                <span>Province of employment: Prince Edward Island</span>
                <br/>
                <div>
                    <table>
                        <tbody>
                            <tr>
                                <td>Salary or wages income</td>
                                <td>1,125.00</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>Vacation pay</td>
                                <td>45.00</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td><b>Total cash income</b></td>
                                <td></td>
                                <td>1,170.00</td>
                            </tr>
                            <hr/>
                            <tr>
                                <td>Federal tax deduction</td>
                                <td>61.20</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>Provincial tax deduction</td>
                                <td>57.82</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>CPP deductions</td>
                                <td>60.94</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>EI deductions</td>
                                <td>19.07</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td><b>Total deductions</b></td>
                                <td></td>
                                <td>199.03</td>
                            </tr>
                            <hr/>
                            <tr>
                                <td><b>Net amount</b></td>
                                <td></td>
                                <td>970.97</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

        </>
    )
}