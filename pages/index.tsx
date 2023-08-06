'use client';

import { useSession, signIn } from "next-auth/react";
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { TextField, Button } from '@mui/material';
import Notify from '@components/Notify';
import baseApiUrl from '@api/apiConfig';
import styles from '@components/css/index.module.css';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    RadialLinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Filler,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar, Line, Radar } from 'react-chartjs-2';
import { ChartOptions } from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    RadialLinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Filler,
    Tooltip,
    Legend
);

const processData = (data: any, chartType: any) => {
    const ids = [...new Set(data.map((item: any) => item.ID))];
    const datasets = ids.map((id, index) => {
        const userEntries = data.filter((item: any) => item.ID === id);
        const labels = userEntries.map((entry: any) => entry.Y_AXIS);
        const dataPoints = userEntries.map((entry: any) => entry.X_AXIS);

        return {
            label: id,
            data: dataPoints,
            backgroundColor: (chartType == 'bar') ? chartColor[index % chartColor.length] : chartColorAlpha[index % chartColorAlpha.length],
            borderColor: chartColor[index % chartColor.length],
            borderRadius: 3,
            borderWidth: (chartType == 'bar') ? 0 : 1,
            pointRadius: 5,
            pointHoverRadius: 7,
            fill: true,
        };
    });

    return {
        labels: [...new Set(data.map((item: any)  => item.Y_AXIS))],
        datasets: datasets
    };
};

const chartColor = [
    '#FF8A80', // Coral
    '#33C08C', // Muted Teal
    '#FFD700', // Gold
    '#5C42A5', // Purple
    '#FFA726', // Orange
    '#AC99BD', // Purple
];

const chartColorAlpha = [
    'rgba(255, 138, 128, 0.25)', // Coral
    'rgba(51, 192, 140, 0.25)', // Muted Teal
    'rgba(255, 215, 0, 0.25)', // Gold
    'rgba(92, 66, 165, 0.25)', // Purple
    'rgba(255, 167, 38, 0.25)', // Orange
    'rgba(172, 153, 189, 0.25)', // Purple
];

export default function Account() {
    const {data: session} = useSession();
    const router = useRouter();

    const [personUserName, setPersonUserName] = useState('');
    const [personPassword, setPersonPassword] = useState('');
    const [totalHourPerWeekChartData, setTotalHourPerWeekChartData] = useState({ labels: [] as any[], datasets: [] as any[] });
    const [attendancePerWeekChartData, setAttendancePerWeekChartData] = useState({ labels: [] as any[], datasets: [] as any[] });
    const [avgHourPerDayChartData, setAvgHourPerDayChartData] = useState({ labels: [] as any[], datasets: [] as any[] });
    const [totalSalaryPaidChartData, setTotalSalaryPaidChartData] = useState({ labels: [] as any[], datasets: [] as any[] });

    const options: ChartOptions<'bar'> = {
        responsive: true,
        plugins: {
            legend: {
                display: true,
                position: 'bottom' as const,
            },
        },
    };

    async function getCharts() {
        //------Chart 1
        const apiUrlEndpoint = `${baseApiUrl}/fetchSql`;
        var postData = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json '},
            body: JSON.stringify({
                query: 'fetchTotalHourPerWeek',
                para: []
            })
        }
        var response = await fetch(apiUrlEndpoint, postData);
        var res = await response.json();
        setTotalHourPerWeekChartData(processData(res.data, 'bar'));

        //------Chart 2
        var postData = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json '},
            body: JSON.stringify({
                query: 'fetchAttendancePerWeek',
                para: []
            })
        }
        var response = await fetch(apiUrlEndpoint, postData);
        var res = await response.json();
        setAttendancePerWeekChartData(processData(res.data, 'bar'));

        //------Chart 3
        var postData = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json '},
            body: JSON.stringify({
                query: 'fetchAvgHourPerDay',
                para: []
            })
        }
        var response = await fetch(apiUrlEndpoint, postData);
        var res = await response.json();
        console.log(res.data);
        var labels: Array<any> = [];
        var dataTmp: Array<number> = [];
        setAvgHourPerDayChartData(processData(res.data, 'radar'));

        //------Chart 4
        var postData = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json '},
            body: JSON.stringify({
                query: 'fetchTotalSalaryPaid',
                para: []
            })
        }
        var response = await fetch(apiUrlEndpoint, postData);
        var res = await response.json();
        setTotalSalaryPaidChartData(processData(res.data, 'line'));

    }

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

    useEffect(() => {
        if (session) {
            getCharts();
        }
    }, [session]);

    if (router.query.returnUrl) router.push(router.query.returnUrl.toString());
    return (
        <>
            <Head>
                <title>{`${process.env.WebsiteName}`}</title>
            </Head>
            {(!session) //if not signed in then display sign in button
                ?   <>
                    <div className={styles.FormContainer}>
                        <h2>{`Welcome to ${process.env.CompanyName}!`}</h2>
                        <p>Please sign in to continue:</p>
                        <TextField
                            id='user-input'
                            label='Email or User ID'
                            variant='standard'
                            value={personUserName}
                            onChange={(event) => setPersonUserName(event.target.value)}
                            className={styles.FormChild}
                        />
                        <TextField
                            id='password-input'
                            label='Password'
                            variant='standard'
                            type='password'
                            value={personPassword}
                            onChange={(event) => setPersonPassword(event.target.value)}
                            className={styles.FormChild}
                        />
                        <br/><br/>
                        <Button
                            size="large"
                            variant="outlined"
                            color="success"
                            onClick={() => handleSignIn()}
                            className={styles.FormChild}
                        >
                            Sign in
                        </Button>
                    </div>
                </>
                :
                <>
                <h2>{`Welcome back, ${session?.user?.name}!`}</h2>
                <div className={styles.ChartContainer}>
                    <div className={styles.Chart}>
                        <Bar
                            data={totalHourPerWeekChartData}
                            options={{
                                ...options,
                                plugins: {
                                    ...options.plugins,
                                    title: {
                                        text: 'Total Working Hour',
                                        display: true,
                                    }
                                },
                                scales: {
                                    ...options.scales,
                                    x: {
                                        title: {
                                            display: true,
                                            text: 'Week Number',
                                        }
                                    },
                                    y: {
                                        title: {
                                            display: true,
                                            text: 'Total Hours',
                                        }
                                    }
                                }
                            }}
                        />
                    </div>
                    <div className={styles.Chart}>
                        <Bar
                            data={attendancePerWeekChartData}
                            options={{
                                ...options,
                                plugins: {
                                    ...options.plugins,
                                    title: {
                                        text: 'Attendance',
                                        display: true,
                                    }
                                },
                                scales: {
                                    ...options.scales,
                                    x: {
                                        stacked: true,
                                        title: {
                                            display: true,
                                            text: 'Week Number',
                                        }
                                    },
                                    y: {
                                        stacked: true,
                                        title: {
                                            display: true,
                                            text: 'Days',
                                        }
                                    }
                                }
                            }}
                        />
                    </div>
                    <div className={styles.Chart}>
                        <Radar
                            data={avgHourPerDayChartData}
                            options={{
                                plugins: {
                                    title: {
                                        text: 'Average Hour per Day',
                                        display: true,
                                    }
                                },
                            }}
                        />
                    </div>
                    <div className={styles.Chart}>
                        <Line
                            style={{display: (session?.user?.role == "MANAGER") ? 'block' : 'none'}}
                            data={totalSalaryPaidChartData}
                            options={{
                                plugins: {
                                    legend: {
                                        display: false,
                                    },
                                    title: {
                                        text: 'Total Salary Paid',
                                        display: true,
                                    },
                                },
                                scales: {
                                    x: {
                                        title: {
                                            display: true,
                                            text: 'Month-Year',
                                        }
                                    },
                                    y: {
                                        beginAtZero: true,
                                        title: {
                                            display: true,
                                            text: '$',
                                        }
                                    }
                                }
                            }}
                        />
                    </div>
                </div>
                </>
            }
        </>
    )
}