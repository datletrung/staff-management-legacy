'use client';

import React from 'react';
import { useReactToPrint } from 'react-to-print';

import Link from "next/link";
import Head from 'next/head';
import Notify from '@components/Notify';
import { useState, useEffect } from 'react';
import { Select, MenuItem, Button, Autocomplete, TextField, Switch } from '@mui/material';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

import baseApiUrl from '@api/apiConfig';
import { checkPermissions } from '@components/CheckPermission';
import AccessDenied from '@components/AccessDenied';

import stylesManagerZonePayroll from '@components/css/ManagerZone/Payroll.module.css';

type PayrollInfoProps = {
    payrollInfo: any;
    employeeName: string;
    employerName: string;
    payPeriod: string;
    payDate: string;
    province: string;
    totalWorkingHour: string;
    hourlyRate: string;
    wages: string;
};

export default function ManagerZonePayroll() {
    if (!checkPermissions()) {
        return <AccessDenied/>;
    }

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
    const [approvedOnly, setApprovedOnly] = useState(false);

    const [payrollEmployeeName, setPayrollEmployeeName] = useState('');
    const [payrollProvinceOption, setPayrollProvinceOption] = useState('');
    const [payrollPayPeriodOption, setPayrollPayPeriodOption] = useState('');
    const [payrollPayDate, setPayrollPayDate] = useState(dayjs());
    const [payrollTotalWorkingHour, setPayrollTotalWorkingHour] = useState('');
    const [payrollHourlyRates, setPayrollHourlyRates] = useState('');
    const [payrollWages, setPayrollWages] = useState('');

    const [salaryOption, setSalaryOption] = useState(false);
    
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
        CPP: '0.00',
        EI: '0.00',
        taxFed: '0.00',
        taxProv: '0.00',
        totalDeduction: '0.00',
        totalEarnings: '0.00',
        totalNetPay: '0.00',
        vacationPay: '0.00',
        wages: '0.00',
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
            Notify('Something went wrong! Please try again later.', 'error');
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
            Notify('Something went wrong! Please try again later.', 'error');
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
        var payrollData = {
            CPP: '0.00',
            EI: '0.00',
            taxFed: '0.00',
            taxProv: '0.00',
            totalDeduction: '0.00',
            totalEarnings: '0.00',
            totalNetPay: '0.00',
            vacationPay: '0.00',
            wages: '0.00',
            disclaimer: '',
        };
        var totalWorkingHour = 0;
        var wages = 0;
        var vacationPay = 0;

        var apiUrlEndpoint = `${baseApiUrl}/fetchSql`;
        var postData = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json '},
            body: JSON.stringify({
                query: 'fetchTotalTimeCustom',
                para: [fromDate.format('MM/DD/YYYY'),
                        toDate.format('MM/DD/YYYY'),
                        (approvedOnly) ? 'Y' : 'N',
                        (approvedOnly) ? 'Y' : 'N',
                        (approvedOnly) ? 'Y' : 'N',
                        employeeId,
                ]
            })
        }
        var response = await fetch(apiUrlEndpoint, postData);
        var res = await response.json();
        if (res.error) {
            Notify('Something went wrong! Please try again later.', 'error');
            setLoading(false);
            return;
        }
        if (res.data.length !== 0) {
            if (!salaryOption) {
                totalWorkingHour = Number(res.data[0].TOTAL_TIME);
                wages = Number((totalWorkingHour * hourlyRate).toFixed(2));
                vacationPay = Number((wages * vacationPayPercent / 100).toFixed(2));
            } else {
                wages = Number((salary).toFixed(2));
            }

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
                Notify('Something went wrong! Please try again later.', 'error');
                setLoading(false);
                return;
            }

            let retrievedData = res.data;
            payrollData = {
                CPP: retrievedData.CPP,
                EI: retrievedData.EI,
                taxFed: retrievedData.taxFed,
                taxProv: retrievedData.taxProv,
                totalDeduction: retrievedData.totalDeduction,
                totalEarnings: retrievedData.totalEarnings,
                totalNetPay: retrievedData.totalNetPay,
                vacationPay: retrievedData.vacationPay,
                wages: retrievedData.wages,
                disclaimer: '',
            }
        }
        setPayrollInfo(payrollData);
        setPayrollEmployeeName(employeeName);
        setPayrollPayPeriodOption(selectedPayPeriodOption);
        setPayrollProvinceOption(selectedProvinceOption);
        setPayrollPayDate(payDate);

        setPayrollTotalWorkingHour(salaryOption ? 'N/A' : totalWorkingHour.toFixed(2));
        setPayrollHourlyRates(salaryOption ? 'N/A' : hourlyRate.toFixed(2));
        setPayrollWages(salaryOption ? wages.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') : wages.toFixed(2));

        setViewPayrollResult(true);
        setLoading(false);
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
                            onChange={(event, value) => {
                                if (value){
                                    setEmployeeId(value.USER_ID);
                                    setEmployeeName(value.FULL_NAME);
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
                        <span className={stylesManagerZonePayroll.FilterTitle}>Approved only</span>
                        <Switch
                            value={approvedOnly}
                            onChange={(event) => {setApprovedOnly(event.target.checked)}}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <hr style={{ flex: 1, marginRight: '10px' }} />
                        <h4>Payment Details</h4>
                        <hr style={{ flex: 1, marginLeft: '10px' }} />
                    </div>
                    <div>
                        <div className={stylesManagerZonePayroll.TabContainer}>
                            <div
                                className={`${stylesManagerZonePayroll.Tab} ${!salaryOption ? stylesManagerZonePayroll.Active : ''}`}
                                onClick={() => setSalaryOption(false)}
                            >
                                Hourly Wage
                            </div>
                            <div
                                className={`${stylesManagerZonePayroll.Tab} ${salaryOption ? stylesManagerZonePayroll.Active : ''}`}
                                onClick={() => setSalaryOption(true)}
                            >
                                Salary
                            </div>
                        </div>
                        <div className={stylesManagerZonePayroll.FilterContainer} style={{display: salaryOption ? 'none' : 'grid'}}>
                            <span className={stylesManagerZonePayroll.FilterTitle}>Hourly Rate</span>
                            <TextField
                                    type="number"
                                    variant='standard'
                                    style={{width: '100%'}}
                                    value={hourlyRate}
                                    onChange={(event) => {setHourlyRate(Number(event.target.value))}}
                                    InputProps={{
                                        endAdornment: '$',
                                    }}
                            />
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
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <hr style={{ flex: 1, marginRight: '10px' }} />
                        <h4>Payroll Information</h4>
                        <hr style={{ flex: 1, marginLeft: '10px' }} />
                    </div>
                    <div className={stylesManagerZonePayroll.FilterContainer}>
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
                        onClick={() => {
                            calculatePayroll();
                        }}
                    >
                        CALCULATE
                    </Button>
                </div>
                <div className={`${stylesManagerZonePayroll.ViewChildFlexColumnRight} ${loading ? stylesManagerZonePayroll.LoadingBlur : ''}`}>  
                    <div style={{ display: (viewPayrollResult) ? 'block' : 'none' }}>
                        <div className={stylesManagerZonePayroll.PayrollContainer}>
                            <div ref={componentRef}>
                                <PayrollInfo
                                    payrollInfo={payrollInfo}
                                    employeeName={payrollEmployeeName}
                                    employerName={companyName}
                                    payPeriod={getPayPeriod(payrollPayPeriodOption)}
                                    payDate={payrollPayDate.format('YYYY/MM/DD')}
                                    province={getProvince(payrollProvinceOption)}   
                                    totalWorkingHour={payrollTotalWorkingHour}
                                    hourlyRate={payrollHourlyRates}
                                    wages={payrollWages}
                                />
                            </div>
                            <br/>
                            <Button
                                variant="outlined"
                                style={{width:'100%'}}
                                onClick={() => printPayrollCard()}
                            >
                                PRINT
                            </Button>
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
                        </div><br/>
                        <div>
                        Please note that tax laws and regulations can change over time, and it is essential to stay informed about the latest updates from relevant authorities.
                        </div><br/>
                        <div>
                        By using this payroll deduction calculator, you agree to these terms and conditions and understand that it should not substitute for professional advice or official sources.
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

const PayrollInfo = ({ payrollInfo, employeeName, employerName, payPeriod, payDate, province, totalWorkingHour, hourlyRate, wages }: PayrollInfoProps) => {
    return (
        <div className={stylesManagerZonePayroll.PayrollInfoContainer}>
            <center><h2>Payroll</h2></center>
            <div>
                <div className={stylesManagerZonePayroll.PayrollInfo}>
                    <span className={stylesManagerZonePayroll.PayrollInfoTitle}>Employee's name:</span>
                    <span>{employeeName}</span>
                    <span className={stylesManagerZonePayroll.PayrollInfoTitle}>Employer's name:</span>
                    <span>{employerName}</span>
                    <span className={stylesManagerZonePayroll.PayrollInfoTitle}>Pay period frequency:</span>
                    <span>{payPeriod}</span>
                    <span className={stylesManagerZonePayroll.PayrollInfoTitle}>Date the employee is paid:</span>
                    <span>{payDate} (YYYY/MM/DD)</span>
                    <span className={stylesManagerZonePayroll.PayrollInfoTitle}>Province of employment:</span>
                    <span>{province}</span>
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
                                <td>{totalWorkingHour}</td>
                                <td>{hourlyRate}</td>
                                <td>{wages}</td>
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