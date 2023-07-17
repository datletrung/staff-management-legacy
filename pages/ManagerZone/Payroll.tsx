'use client';

import React from 'react';
import { useReactToPrint } from 'react-to-print';

import { useSession } from "next-auth/react";
import Link from "next/link";
import Head from 'next/head';
import Notify from '@components/Notify';
import { useState, useEffect } from 'react';
import { Select, MenuItem, Button, Autocomplete, TextField } from '@mui/material';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

import baseApiUrl from '@api/apiConfig';
import { checkPermissions } from '@components/CheckPermission';
import AccessDenied from '@components/AccessDenied';

import stylesManagerZonePayroll from '@components/css/ManagerZone/Payroll.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';

export default function ManagerZonePayroll() {
    if (!checkPermissions()) {
        return <AccessDenied/>;
    }

    const {data: session} = useSession();
    const [userId] = useState(session?.user?.userId);
    const [employeeList, setEmployeeList] = useState<string[]>([]);
    const componentRef = React.useRef(null);

    const [loading, setLoading] = useState(false);
    const [selectedProvinceOption, setSelectedProvinceOption] = useState('');
    const [selectedPayPeriodOption, setSelectedPayPeriodOption] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [employeeId, setEmployeeId] = useState('');
    const [employeeName, setEmployeeName] = useState('');
    const [hourlyRate, setHourlyRate] = useState(18);
    const [salary, setSalary] = useState(3000);
    const [vacationPayPercent, setVacationPayPercent] = useState(4);
    const [fromDate, setFromDate] = useState(dayjs().startOf('month'));
    const [toDate, setToDate] = useState(dayjs());
    const [payDate, setPayDate] = useState(dayjs());
    const [viewPayrollResult, setViewPayrollResult] = useState(false);
    const [overtimeHourDay, setOvertimeHourDay] = useState('');
    const [overtimeHourWeek, setOvertimeHourWeek] = useState('');
    const [salaryOption, setSalaryOption] = useState(false);
    const [viewNewPayroll, setViewNewPayroll] = useState(true);
    const [payrollList, setPayrollList] = useState<string[]>([]);
    const [payrollId, setPayrollId] = useState('');
    const [disableCalculateButton, setDisableCalculateButton] = useState(false);
    
    const [viewDisclaimerPopup, setViewDisclaimerPopup] = useState(true);

    const filterOptions = (options: any[], { inputValue }: any) => {
        return options.filter(
          (option: { USER_ID: string; EMAIL: string; FULL_NAME: string; }) =>
            option.USER_ID.toString().toLowerCase().includes(inputValue.toLowerCase()) ||
            option.EMAIL.toLowerCase().includes(inputValue.toLowerCase()) ||
            option.FULL_NAME.toLowerCase().includes(inputValue.toLowerCase())
        );
    };

    const provinceOptions = [
        { label: 'Alberta', value: 'AB' },
        { label: 'British Columbia', value: 'BC' },
        { label: 'Manitoba', value: 'MB' },
        { label: 'New Brunswick', value: 'NB' },
        { label: 'Newfoundland/Labrador', value: 'NL' },
        { label: 'Northwest Territories', value: 'NT' },
        { label: 'Nova Scotia', value: 'NS' },
        { label: 'Nunavut', value: 'NU' },
        { label: 'Ontario', value: 'ON' },
        { label: 'Prince Edward Island', value: 'PE' },
        { label: 'Quebec', value: 'QC' },
        { label: 'Saskatchewan', value: 'SK' },
        { label: 'Yukon', value: 'YT' },
    ];
    const payPeriodOptions = [
        { label: 'Daily (240 per year)', value: '240' },
        { label: 'Weekly (52 per year)', value: '52' },
        { label: 'Bi-Weekly (26 per year)', value: '26' },
        { label: 'Semi-Monthly (24 per year)', value: '24' },
        { label: 'Monthly (12 per year)', value: '12' },
        { label: 'Annual (1 per year)', value: '1' },
        { label: 'Daily (260 per year)', value: '260' },
        { label: 'Weekly (53 per year)', value: '53' },
        { label: 'Bi-Weekly (27 per year)', value: '27' },
        { label: '4 Weeks (13 per year)', value: '13' },
    ];
    const [payrollInfo, setPayrollInfo] = useState({
        employeeName: '',
        employerName: '',
        payPeriod: '',
        payDate: '',
        province: '',
        totalWorkingHour: '0.00',
        hourlyRate: '0.00',
        wages: '0.00', 
        CPP: '0.00',
        EI: '0.00',
        taxFed: '0.00',
        taxProv: '0.00',
        totalDeduction: '0.00',
        totalEarnings: '0.00',
        totalNetPay: '0.00',
        vacationPay: '0.00',
        disclaimer: '',
    });

    const getPayPeriod = (value: string) => {
        const option = payPeriodOptions.find((option) => option.value === value);
        return option ? option.label : '';
    };

    const getProvince = (value: string) => {
        const option = provinceOptions.find((option) => option.value === value);
        return option ? option.label : '';
    };

    function resetPayrollInfo(){
        setPayrollInfo({
            employeeName: '',
            employerName: '',
            payPeriod: '',
            payDate: '',
            province: '',
            totalWorkingHour: '0.00',
            hourlyRate: '0.00',
            wages: '0.00', 
            CPP: '0.00',
            EI: '0.00',
            taxFed: '0.00',
            taxProv: '0.00',
            totalDeduction: '0.00',
            totalEarnings: '0.00',
            totalNetPay: '0.00',
            vacationPay: '0.00',
            disclaimer: '',
        });
    }

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
        if (res.error) {
            Notify(res.error, 'error');
            return;
        }
        const data = res.data;
        data.forEach((item: any) => {
            item.USER_ID = item.USER_ID.toString().padStart(6, '0');
        });
        setEmployeeList(data);
    }

    async function getSettings() {
        const apiUrlEndpoint = `${baseApiUrl}/fetchSql`;
        const postData = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json '},
            body: JSON.stringify({
                query: 'fetchSettings',
                para: []
            })
        }
        
        const response = await fetch(apiUrlEndpoint, postData);
        const res = await response.json();
        if (res.error) {
            Notify(res.error, 'error');
            return;
        }
        res.data.forEach((item: any) => {
            switch(item.SETTING_NAME) {
                case 'COMPANY_NAME': {
                    setCompanyName(item.SETTING_VALUE);
                    break;
                }
                case 'PROVINCE': {
                    setSelectedProvinceOption(item.SETTING_VALUE);
                    break;
                }
                case 'PAY_PERIOD': {
                    setSelectedPayPeriodOption(item.SETTING_VALUE);
                    break;
                }
                case 'OVERTIME_HOUR_DAY': {
                    setOvertimeHourDay(item.SETTING_VALUE);
                    break;
                }
                case 'OVERTIME_HOUR_WEEK': {
                    setOvertimeHourWeek(item.SETTING_VALUE);
                    break;
                }
                default: {
                    break;
                }
            }
        });
    }

    async function calculatePayroll(){
        if (employeeId === '') {
            Notify('Please select an employee.', 'error');
            return;
        }
        setLoading(true);
        setDisableCalculateButton(true);
        await resetPayrollInfo();
        var payrollData = payrollInfo;
        var totalWorkingHour = 0;
        var wages = 0;

        var apiUrlEndpoint = `${baseApiUrl}/fetchSql`;
        var postData = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json '},
            body: JSON.stringify({
                query: 'fetchTotalTimeCustom',
                para: [fromDate.format('MM/DD/YYYY'),
                        toDate.format('MM/DD/YYYY'),
                        employeeId,
                ]
            })
        }
        var response = await fetch(apiUrlEndpoint, postData);
        var res = await response.json();
        if (res.error) {
            Notify(res.error, 'error');
            setLoading(false);
            setDisableCalculateButton(false);
            return;
        }
        if (res.data.length !== 0) {
            if (!salaryOption) {
                totalWorkingHour = Number(res.data[0].TOTAL_TIME);
                wages = Number((totalWorkingHour * hourlyRate).toFixed(2));
            } else {
                wages = Number((salary).toFixed(2));
            }
            const vacationPay = Number((wages * vacationPayPercent / 100).toFixed(2));
            var apiUrlEndpoint = `${baseApiUrl}/fetchPayroll`;
            var postData = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json '},
                body: JSON.stringify({
                    province: selectedProvinceOption,
                    annualPayPeriods: selectedPayPeriodOption,
                    wages: wages,
                    vacationPay: vacationPay,
                })
            }
            var response = await fetch(apiUrlEndpoint, postData);
            var res = await response.json();

            if (res.error) {
                Notify(res.error, 'error');
                setLoading(false);
                setDisableCalculateButton(false);
                return;
            }

            let retrievedData = res.data;
            payrollData = {
                employeeName: employeeName,
                employerName: companyName,
                payPeriod: getPayPeriod(selectedPayPeriodOption),
                payDate: payDate.format('YYYY/MM/DD'),
                province: getProvince(selectedProvinceOption),
                totalWorkingHour: salaryOption ? 'N/A' : totalWorkingHour.toFixed(2),
                hourlyRate: salaryOption ? 'N/A' : hourlyRate.toFixed(2),
                wages: salaryOption ? wages.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') : wages.toFixed(2), 
                CPP: retrievedData.CPP,
                EI: retrievedData.EI,
                taxFed: retrievedData.taxFed,
                taxProv: retrievedData.taxProv,
                totalDeduction: retrievedData.totalDeduction,
                totalEarnings: retrievedData.totalEarnings,
                totalNetPay: retrievedData.totalNetPay,
                vacationPay: retrievedData.vacationPay,
                disclaimer: '',
            };
        }
        setPayrollInfo(payrollData);
        setViewPayrollResult(true);
        setLoading(false);
        setDisableCalculateButton(false);
    }

    async function fetchPayrollList(employeeIdPara: any){
        const apiUrlEndpoint = `${baseApiUrl}/fetchSql`;
        const postData = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json '},
            body: JSON.stringify({
                query: 'fetchPayrollList',
                para: [employeeIdPara]
            })
        }
        
        const response = await fetch(apiUrlEndpoint, postData);
        const res = await response.json();
        if (res.error) {
            Notify(res.error, 'error');
            return;
        }
        const data = res.data;
        setPayrollList(data);
    }

    async function fetchPayrollDetail(employeeIdPara: any, payrollIdPara: any){
        setLoading(true);
        const apiUrlEndpoint = `${baseApiUrl}/fetchSql`;
        const postData = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json '},
            body: JSON.stringify({
                query: 'fetchPayrollDetail',
                para: [employeeIdPara, payrollIdPara]
            })
        }
        const response = await fetch(apiUrlEndpoint, postData);
        const res = await response.json();

        let retrievedData = res.data[0];
        let payrollData = {
            employeeName: employeeName,
            employerName: companyName,
            payPeriod: getPayPeriod(retrievedData.PAY_PERIOD),
            payDate: dayjs(retrievedData.PAY_DATE).format('YYYY/MM/DD'),
            province: getProvince(retrievedData.PAY_PROVINCE),
            totalWorkingHour: retrievedData.TOTAL_HOUR,
            hourlyRate: retrievedData.HOURLY_RATE,
            wages: retrievedData.WAGES, 
            CPP: retrievedData.CPP,
            EI: retrievedData.EI,
            taxFed: retrievedData.taxFed,
            taxProv: retrievedData.taxProv,
            totalDeduction: retrievedData.TOTAL_DEDUCTION,
            totalEarnings: retrievedData.TOTAL_EARNINGS,
            totalNetPay: retrievedData.TOTAL_NET_PAY,
            vacationPay: retrievedData.VACATION_PAY,
            disclaimer: '',
        }

        setPayrollInfo(payrollData);
        setViewPayrollResult(true);
        setLoading(false);
    }

    async function savePayroll(){
        const apiUrlEndpoint = `${baseApiUrl}/fetchSql`;
        const postData = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json '},
            body: JSON.stringify({
                query: 'savePayroll',
                para: [employeeId, fromDate.format('MM/DD/YYYY'), toDate.format('MM/DD/YYYY'), payDate.format('MM/DD/YYYY'),
                    selectedPayPeriodOption, selectedProvinceOption, payrollInfo.totalWorkingHour, payrollInfo.hourlyRate, payrollInfo.wages,
                    payrollInfo.vacationPay, payrollInfo.taxFed, payrollInfo.taxProv, payrollInfo.CPP, payrollInfo.EI, userId
                ]
            })
        }
        
        const response = await fetch(apiUrlEndpoint, postData);
        const res = await response.json();
        if (res.error) {
            Notify(res.error, 'error');
            return;
        }
        Notify('Payroll saved.', 'success');
    }

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
    });

    async function deletePayroll(){
        setLoading(true);
        const apiUrlEndpoint = `${baseApiUrl}/fetchSql`;
        const postData = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json '},
            body: JSON.stringify({
                query: 'deletePayroll',
                para: [employeeId, payrollId]
            })
        }
        
        const response = await fetch(apiUrlEndpoint, postData);
        const res = await response.json();
        if (res.error) {
            Notify(res.error, 'error');
            setLoading(false);
            return;
        }
        Notify('Payroll deleted.', 'success');
        resetPayrollInfo();
        setViewPayrollResult(false);
        fetchPayrollList(employeeId);
        setLoading(false);
    }

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
        getSettings();
        getEmployeeList();
    }, [])

    return (
        <>
            <Head>
                <title>{`Payroll | ${process.env.WebsiteName}`}</title>
            </Head>
            <h2><Link href={'/ManagerZone'} style={{textDecoration: 'underline'}}>Manager Zone</Link> &#x2022; {`Payroll`}</h2>
            {viewDisclaimerPopup && <div className={stylesManagerZonePayroll.BlurView}/>}

            <div className={stylesManagerZonePayroll.ViewContainer}>
                <div className={stylesManagerZonePayroll.ViewChildFlexColumnLeft}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <hr style={{ flex: 1, marginRight: '10px' }} />
                        <h4>Employee Details</h4>
                        <hr style={{ flex: 1, marginLeft: '10px' }} />
                    </div>
                    <div className={stylesManagerZonePayroll.FilterContainer}>
                        <span className={stylesManagerZonePayroll.FilterTitle}>Employee</span>
                        <Autocomplete
                            options={employeeList}
                            autoHighlight
                            filterOptions={filterOptions}
                            getOptionLabel={(option: any) => option.FULL_NAME}
                            isOptionEqualToValue={(option: any, value: any) => {
                                return (
                                    option?.USER_ID !== value?.USER_ID ||
                                    option?.FULL_NAME !== value?.FULL_NAME ||
                                    option?.EMAIL !== value?.EMAIL
                                );
                            }}
                            onChange={(event, value) => {
                                if (value){
                                    setEmployeeId(value.USER_ID);
                                    setEmployeeName(value.FULL_NAME);
                                    if (!viewNewPayroll){
                                        fetchPayrollList(value.USER_ID);
                                    }
                                } else {
                                    setEmployeeId('');
                                    setEmployeeName('');
                                }
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    variant='standard'
                                    autoComplete='off'
                                    style={{width:'100%'}}
                                />
                            )}
                            style={{ width: '100%' }}
                        />
                        <span className={stylesManagerZonePayroll.FilterTitle}>From Date</span>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                value={fromDate}
                                onChange={(value: any) => {
                                    setFromDate(value);
                                }}
                                slots={{
                                    textField: textFieldProps => <TextField {...textFieldProps} variant='standard' />
                                }}
                            />
                        </LocalizationProvider>
                        <span className={stylesManagerZonePayroll.FilterTitle}>To Date</span>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                value={toDate}
                                onChange={(value: any) => {
                                    setToDate(value);
                                }}
                                slots={{
                                    textField: textFieldProps => <TextField {...textFieldProps} variant='standard' />
                                }}
                            />
                        </LocalizationProvider>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <hr style={{ flex: 1, marginRight: '10px' }} />
                        <h4>Payroll</h4>
                        <hr style={{ flex: 1, marginLeft: '10px' }} />
                    </div>
                    <div className={stylesManagerZonePayroll.TabContainer}>
                        <div
                            className={`${stylesManagerZonePayroll.Tab} ${viewNewPayroll ? stylesManagerZonePayroll.TabActive : ''}`}
                            onClick={() => {
                                setViewNewPayroll(true);
                                setViewPayrollResult(false);
                                setPayrollId('');
                                resetPayrollInfo();
                            }}
                        >
                            New Payroll
                        </div>
                        <div
                            className={`${stylesManagerZonePayroll.Tab} ${!viewNewPayroll ? stylesManagerZonePayroll.TabActive : ''}`}
                            onClick={() => {
                                setViewNewPayroll(false);
                                setViewPayrollResult(false);
                                if (employeeId !== '') {
                                    fetchPayrollList(employeeId);
                                }
                                setPayrollId('');
                                resetPayrollInfo();
                            }}
                        >
                            Retrieve Payroll
                        </div>
                    </div>
                    <div style={{display: viewNewPayroll ? 'block' : 'none'}}>
                        <div className={stylesManagerZonePayroll.SubTabContainer}>
                            <span
                                className={`${stylesManagerZonePayroll.SubTab} ${stylesManagerZonePayroll.SubTabLeft} ${!salaryOption ? stylesManagerZonePayroll.SubTabActive : ''}`}
                                onClick={() => {
                                    setSalaryOption(false);
                                }}
                            >
                                Hourly Wage
                            </span>
                            <span
                                className={`${stylesManagerZonePayroll.SubTab} ${stylesManagerZonePayroll.SubTabRight} ${salaryOption ? stylesManagerZonePayroll.SubTabActive : ''}`}
                                onClick={() => {
                                    setSalaryOption(true);
                                }}
                            >
                                Salary
                            </span>
                        </div>
                        <br/>
                        <div className={stylesManagerZonePayroll.FilterContainer} style={{display: salaryOption ? 'none' : 'grid'}}>
                            <span className={stylesManagerZonePayroll.FilterTitle}>Hourly Rate</span>
                            <TextField
                                    type="number"
                                    variant='standard'
                                    style={{width: '100%'}}
                                    value={hourlyRate}
                                    onChange={(event) => {setHourlyRate(Number(event.target.value))}}
                                    InputProps={{
                                        endAdornment: '$/hr',
                                    }}
                            />
                        </div>
                        <div className={stylesManagerZonePayroll.FilterContainer} style={{display: salaryOption ? 'grid' : 'none'}}>
                            <span className={stylesManagerZonePayroll.FilterTitle}>Salary</span>
                            <TextField
                                    type="number"
                                    variant='standard'
                                    style={{width: '100%'}}
                                    value={salary}
                                    onChange={(event) => {setSalary(Number(event.target.value))}}
                                    InputProps={{
                                        endAdornment: '$',
                                    }}
                            />
                        </div><br/>
                        <div className={stylesManagerZonePayroll.FilterContainer}>
                            <span className={stylesManagerZonePayroll.FilterTitle}>Vacation Pay</span>
                            <TextField
                                    type="number"
                                    variant='standard'
                                    style={{width: '100%'}}
                                    value={vacationPayPercent}
                                    onChange={(event) => {setVacationPayPercent(Number(event.target.value))}}
                                    InputProps={{
                                        endAdornment: '%',
                                    }}
                            />
                            <span className={stylesManagerZonePayroll.FilterTitle}>Pay Date</span>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    value={payDate}
                                    onChange={(value: any) => {
                                        setPayDate(value);
                                    }}
                                    slots={{
                                        textField: textFieldProps => <TextField {...textFieldProps} variant='standard' />
                                    }}
                                />
                            </LocalizationProvider>
                            <span className={stylesManagerZonePayroll.FilterTitle}>Province</span>
                            <Select
                                variant="standard"
                                value={selectedProvinceOption}
                                onChange={(event) => {setSelectedProvinceOption(event.target.value)}}
                                style={{width:'100%'}}
                            >
                                {provinceOptions.map((item) => (
                                <MenuItem key={item.value} value={item.value}>
                                    {item.label}
                                </MenuItem>
                                ))}
                            </Select>
                            <span className={stylesManagerZonePayroll.FilterTitle}>Pay Period</span>
                            <Select
                                variant="standard"
                                value={selectedPayPeriodOption}
                                onChange={(event) => {setSelectedPayPeriodOption(event.target.value)}}
                                style={{width:'100%'}}
                            >
                                {payPeriodOptions.map((item) => (
                                <MenuItem key={item.value} value={item.value}>
                                    {item.label}
                                </MenuItem>
                                ))}
                            </Select>
                        </div>
                        <br/>
                        <Button
                            variant="outlined"
                            style={{width:'100%'}}
                            disabled={disableCalculateButton}
                            onClick={() => {
                                calculatePayroll();
                            }}
                        >
                            CALCULATE
                        </Button>
                    </div>
                    <div style={{display: viewNewPayroll ? 'none' : 'block'}}>
                        <div>
                            <table className={stylesManagerZonePayroll.Table}>
                                <tbody>
                                <tr>
                                    <th className={stylesManagerZonePayroll.TableColumn}>Period from</th>
                                    <th className={stylesManagerZonePayroll.TableColumn}>Period to</th>
                                    <th className={stylesManagerZonePayroll.TableColumn}>Amount</th>
                                    <th></th>
                                </tr>
                                {payrollList.map((item:any, idx:number) => {
                                    return (
                                        <tr
                                            className={`${stylesManagerZonePayroll.TableRow} ${(idx % 2 !== 1) ? stylesManagerZonePayroll.TableAlterRow : ''}`}
                                            onClick={() => {
                                                setPayrollId(item.PAYROLL_ID);
                                                fetchPayrollDetail(employeeId, item.PAYROLL_ID);
                                            }}
                                        >
                                            <td className={stylesManagerZonePayroll.PayrollTableContent}>
                                                {new Date(item.PAY_PERIOD_FROM).toLocaleString([], { day: '2-digit', month: '2-digit', year:'2-digit' })}
                                            </td>
                                            <td className={stylesManagerZonePayroll.PayrollTableContent}>
                                                {new Date(item.PAY_PERIOD_TO).toLocaleString([], { day: '2-digit', month: '2-digit', year:'2-digit' })}
                                            </td>
                                            <td className={stylesManagerZonePayroll.PayrollTableContent}>
                                                {item.TOTAL_NET_PAY}
                                            </td>
                                            <td>
                                                <FontAwesomeIcon icon={faChevronRight}/>
                                            </td>
                                        </tr>
                                    );                    
                                })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div className={`${stylesManagerZonePayroll.ViewChildFlexColumnRight} ${loading ? stylesManagerZonePayroll.LoadingBlur : ''}`}>  
                    <div style={{ display: (viewPayrollResult) ? 'block' : 'none' }}>
                        <div className={stylesManagerZonePayroll.PayrollContainer}>
                            <div className={stylesManagerZonePayroll.ButtonContainer}>
                                <Button
                                    variant="outlined"
                                    style={{width:'100%'}}
                                    color={!viewNewPayroll ? 'error' : 'primary'}
                                    onClick={() => {
                                        if (viewNewPayroll) {
                                            savePayroll()
                                        } else {
                                            deletePayroll()
                                        }
                                    }}
                                >
                                    {viewNewPayroll ? 'SAVE' : 'DELETE'}
                                </Button>
                                <Button
                                    variant="outlined"
                                    style={{width:'100%'}}
                                    onClick={() => printPayrollCard()}
                                >
                                    PRINT
                                </Button>
                            </div>
                            <div ref={componentRef}>
                                <PayrollInfo payrollInfo={payrollInfo} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div style={{ display: (viewDisclaimerPopup) ? 'block' : 'none' }}>
                <div className={stylesManagerZonePayroll.PopUp}>
                    <center><h2>Disclaimer</h2></center>
                    <div  className={stylesManagerZonePayroll.PopUpScroll}>
                        <div>
                        The payroll deduction calculator provided on this platform is intended for reference purposes only. While we strive to ensure the accuracy and reliability of the calculator, it is important to note that it may not account for all possible scenarios and variations in tax laws and regulations.
                        </div><br/>
                        <div>
                        The calculations provided by the payroll deduction calculator are based on general formulas and rates, which may not reflect the specific deductions applicable to your unique situation. We strongly recommend consulting with a qualified tax professional or using official government resources for precise calculations.
                        </div><br/>
                        <div>
                        By using this calculator, you acknowledge that the results are not guaranteed to be completely accurate or up to date. We disclaim any liability for any damages or losses arising from the use or reliance on the calculator's results. It is your responsibility to verify the information provided and seek professional advice when necessary.
                        </div>
                    </div><br/>
                    <Button
                        variant="outlined"
                        style={{width:'100%'}}
                        onClick={() => setViewDisclaimerPopup(false)}
                    >
                        ACCEPT AND CONTINUE
                    </Button>
                </div>
            </div>
        </>
    )
}

const PayrollInfo = (payrollInfo: any) => {
    return (
        <div className={stylesManagerZonePayroll.PayrollInfoContainer}>
            <center><h2>Payroll</h2></center>
            <div>
                <div className={stylesManagerZonePayroll.PayrollInfo}>
                    <span className={stylesManagerZonePayroll.PayrollInfoTitle}>Employee's name:</span>
                    <span>{payrollInfo.payrollInfo.employeeName}</span>
                    <span className={stylesManagerZonePayroll.PayrollInfoTitle}>Employer's name:</span>
                    <span>{payrollInfo.payrollInfo.employerName}</span>
                    <span className={stylesManagerZonePayroll.PayrollInfoTitle}>Pay period frequency:</span>
                    <span>{payrollInfo.payrollInfo.payPeriod}</span>
                    <span className={stylesManagerZonePayroll.PayrollInfoTitle}>Date the employee is paid:</span>
                    <span>{payrollInfo.payrollInfo.payDate} (YYYY/MM/DD)</span>
                    <span className={stylesManagerZonePayroll.PayrollInfoTitle}>Province of employment:</span>
                    <span>{payrollInfo.payrollInfo.province}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <hr style={{ flex: 1, marginRight: '10px' }} />
                    <h4>Wages</h4>
                    <hr style={{ flex: 1, marginLeft: '10px' }} />
                </div>
                <div>
                <table className={stylesManagerZonePayroll.PayrollTable}>
                        <tbody>
                            <tr>
                                <td>Hours</td>
                                <td>Rates</td>
                                <td>Wages</td>
                            </tr>
                            <tr>
                                <td>{payrollInfo.payrollInfo.totalWorkingHour}</td>
                                <td>{payrollInfo.payrollInfo.hourlyRate}</td>
                                <td>{payrollInfo.payrollInfo.wages}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <hr style={{ flex: 1, marginRight: '10px' }} />
                    <h4>Deductions</h4>
                    <hr style={{ flex: 1, marginLeft: '10px' }} />
                </div>
                <div>
                    <table className={stylesManagerZonePayroll.PayrollTable}>
                        <tbody>
                            <tr>
                                <td>Salary or wages income</td>
                                <td>{payrollInfo.payrollInfo.wages}</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>Vacation pay</td>
                                <td>{payrollInfo.payrollInfo.vacationPay}</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td><b>Total cash income</b></td>
                                <td></td>
                                <td>{payrollInfo.payrollInfo.totalEarnings}</td>
                            </tr>
                            <tr>
                                <td colSpan={3}><hr/></td>
                            </tr>
                            <tr>
                                <td>Federal tax deduction</td>
                                <td>{payrollInfo.payrollInfo.taxFed}</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>Provincial tax deduction</td>
                                <td>{payrollInfo.payrollInfo.taxProv}</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>CPP deductions</td>
                                <td>{payrollInfo.payrollInfo.CPP}</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>EI deductions</td>
                                <td>{payrollInfo.payrollInfo.EI}</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td><b>Total deductions</b></td>
                                <td></td>
                                <td>{payrollInfo.payrollInfo.totalDeduction}</td>
                            </tr>
                            <tr>
                                <td colSpan={3}><hr/></td>
                            </tr>
                            <tr>
                                <td><b>Net amount</b></td>
                                <td></td>
                                <td><b>{payrollInfo.payrollInfo.totalNetPay}</b></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div>
                {payrollInfo.payrollInfo.disclaimer !== '' ? (
                    <>
                    <hr/>
                    <small>{payrollInfo.payrollInfo.disclaimer}</small>
                    </>
                ) : (
                    <></>
                )}
            </div>
        </div>
    );
}