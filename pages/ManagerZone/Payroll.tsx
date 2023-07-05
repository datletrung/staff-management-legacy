'use client';

import React from 'react';
import { useReactToPrint } from 'react-to-print';

import Link from "next/link";
import Head from 'next/head';
import Notify from '@components/Notify';
import { useState, useEffect } from 'react';
import baseApiUrl from '@api/apiConfig';

import { checkPermissions } from '@components/CheckPermission';
import AccessDenied from '@components/AccessDenied';
import { Button } from '@mui/material';

import stylesManagerZonePayroll from '@components/css/ManagerZone/Payroll.module.css';
import { useSession } from "next-auth/react";


const PayrollInfo = ({payrollInfo}: {payrollInfo: any}) => {
    return (
        <div className={stylesManagerZonePayroll.PayrollInfoContainer}>
            <center><h2>Payroll Deduction</h2></center>
            <div>
                <div className={stylesManagerZonePayroll.PayrollInfo}>
                    <span>Employee's name:</span>
                    <span>{payrollInfo.employeeName}</span>
                    <span>Employer's name:</span>
                    <span>{payrollInfo.employerName}</span>
                    <span>Pay period frequency:</span>
                    <span>{payrollInfo.payPeriod}</span>
                    <span>Date the employee is paid:</span>
                    <span>{payrollInfo.payDate}</span>
                    <span>Province of employment:</span>
                    <span>{payrollInfo.province}</span>
                </div>
                <hr/>
                <div>
                    <table className={stylesManagerZonePayroll.PayrollTable}>
                        <tbody>
                            <tr>
                                <td>Salary or wages income</td>
                                <td>{payrollInfo.wages}</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>Vacation pay</td>
                                <td>{payrollInfo.vacationPay}</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td><b>Total cash income</b></td>
                                <td></td>
                                <td>{payrollInfo.totalEarnings}</td>
                            </tr>
                            <tr>
                                <td colSpan={3}><hr/></td>
                            </tr>
                            <tr>
                                <td>Federal tax deduction</td>
                                <td>{payrollInfo.taxFed}</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>Provincial tax deduction</td>
                                <td>{payrollInfo.taxProv}</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>CPP deductions</td>
                                <td>{payrollInfo.CPP}</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>EI deductions</td>
                                <td>{payrollInfo.EI}</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td><b>Total deductions</b></td>
                                <td></td>
                                <td>{payrollInfo.totalDeduction}</td>
                            </tr>
                            <tr>
                                <td colSpan={3}><hr/></td>
                            </tr>
                            <tr>
                                <td><b>Net amount</b></td>
                                <td></td>
                                <td><b>{payrollInfo.totalNetPay}</b></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div>
                {payrollInfo.disclaimer !== '' ? (
                    <>
                    <hr/>
                    <small>{payrollInfo.disclaimer}</small>
                    </>
                ) : (
                    <></>
                )}
            </div>
        </div>
    );
}


export default function ManagerZonePayroll() {
    if (!checkPermissions()) {
        return <AccessDenied/>;
    }

    const {data: session} = useSession();
    const [employeeList, setEmployeeList] = useState<string[]>([]);
    const componentRef = React.useRef(null); 

    const [payrollInfo, setPayrollInfo] = useState({
        employeeName: '',
        employerName: '',
        payPeriod: '',
        payDate: '',
        province: '',
        CPP: '',
        EI: '',
        taxFed: '',
        taxProv: '',
        totalDeduction: '',
        totalEarnings: '',
        totalNetPay: '',
        totalTax: '',
        vacationPay: '',
        wages: '',
        disclaimer: '',
      });

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
        let retrievedData = res.data;

        const data = {
            employeeName: 'Dat Le',
            employerName: 'Lionrock Tech Inc.',
            payPeriod: 'Semi-monthly (24 pay periods a year)',
            payDate: '2024-01-01 (YYYY-MM-DD)',
            province: 'Prince Edward Island',
            CPP: retrievedData.CPP,
            EI: retrievedData.EI,
            taxFed: retrievedData.taxFed,
            taxProv: retrievedData.taxProv,
            totalDeduction: retrievedData.totalDeduction,
            totalEarnings: retrievedData.totalEarnings,
            totalNetPay: retrievedData.totalNetPay,
            totalTax: retrievedData.totalTax,
            vacationPay: retrievedData.vacationPay,
            wages: retrievedData.wages,
            disclaimer: '',
        }
        */
        const data = {
            employeeName: 'Dat Le',
            employerName: 'Lionrock Tech Inc.',
            payPeriod: 'Semi-monthly (24 pay periods a year)',
            payDate: '2024-01-01 (YYYY-MM-DD)',
            province: 'Prince Edward Island',
            CPP: "60.94",
            EI: "19.07",
            taxFed: "61.20",
            taxProv: "57.82",
            totalDeduction: "199.03",
            totalEarnings: "1,170.00",
            totalNetPay: "970.97",
            totalTax: "119.02",
            vacationPay: "45.00",
            wages: "1,125.00",
            disclaimer: '',
        }
        setPayrollInfo(data);
    }

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
    });

    async function printPayrollCard() {
        await setPayrollInfo((prevState) => ({
            ...prevState,
            disclaimer: 'Disclaimer: The payroll deduction calculator provided is for reference purposes only and may not account for all tax laws and regulations.\
            The results are not guaranteed to be completely accurate or up to date, and we disclaim any liability for damages or losses arising from the use of the calculator.\
            By using this payroll deduction calculator, you agree to these terms and understand that it should not substitute for professional advice or official sources.',
        }));
        handlePrint();
        setPayrollInfo((prevState) => ({
            ...prevState,
            disclaimer: '',
        }));
    }

    useEffect(() => {
        //getEmployeeList();
        calculatePayroll();
    }, [])

    return (
        <>
            <Head>
                <title>{`${process.env.WebsiteName}`}</title>
            </Head>
            <h1><Link href={'/ManagerZone'}>Manager Zone</Link> {`> Payroll`}</h1>

            <div className={stylesManagerZonePayroll.PayrollContainer}>
                <div ref={componentRef} className={stylesManagerZonePayroll.PayrollInfoPrintableContainer}>
                    <PayrollInfo payrollInfo={payrollInfo} />
                </div>
                <br/>
                <Button
                    variant="outlined"
                    style={{width:'100%'}}
                    onClick={() => printPayrollCard()}
                >
                    Print
                </Button>
            </div>
        </>
    )
}