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
    BarElement,
    Title,
    Filler,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { ChartOptions } from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Filler,
    Tooltip,
    Legend
);

const processData = (data: any) => {
    const ids = [...new Set(data.map((item: any) => item.ID))];
    const datasets = ids.map((id, index) => {
        const userEntries = data.filter((item: any) => item.ID === id);
        const labels = userEntries.map((entry: any) => entry.Y_AXIS);
        const dataPoints = userEntries.map((entry: any) => entry.X_AXIS);

        return {
            label: id,
            data: dataPoints,
            backgroundColor: `rgba(${chartColor[index % chartColor.length]}, 0.7)`,
            borderWidth: 0,
        };
    });

    return {
        labels: [...new Set(data.map((item: any)  => item.Y_AXIS))],
        datasets: datasets
    };
};

const chartColor = [
    '16, 200, 130', // Muted Teal
    '255, 138, 128', // Coral
    '255, 215, 0', // Gold
    '92, 66, 165', // Purple
    '255, 167, 38', // Orange
    '172, 153, 189', // Purple
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
        setTotalHourPerWeekChartData(processData(res.data));

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
        setAttendancePerWeekChartData(processData(res.data));

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
        setAvgHourPerDayChartData(processData(res.data));

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
        setTotalSalaryPaidChartData(processData(res.data));

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
                <h2>Dashboard</h2>
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
                                            text: 'Date Range',
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
                                            text: 'Date Range',
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
                        <Bar
                            data={avgHourPerDayChartData}
                            options={{
                                indexAxis: 'y' as const,
                                plugins: {
                                    legend: {
                                        display: true,
                                        position: 'bottom' as const,
                                    },
                                    title: {
                                        text: 'Average Hour per Day',
                                        display: true,
                                    }
                                },
                                scales: {
                                    x: {
                                        stacked: true,
                                    },
                                    y: {
                                        stacked: true,
                                    }
                                }
                            }}
                        />
                    </div>
                    <div className={styles.Chart}>
                        <Bar
                            style={{display: (session?.user?.role == "MANAGER") ? 'block' : 'none'}}
                            data={totalSalaryPaidChartData}
                            options={{
                                indexAxis: 'y' as const,
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
                                            text: '$',
                                        }
                                    },
                                    y: {
                                        title: {
                                            display: true,
                                            text: 'Month-Year',
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