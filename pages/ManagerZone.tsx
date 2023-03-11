'use client';

import Head from 'next/head';
import { checkPermissions } from '../components/CheckPermission';
import stylesManagerZone from '../components/css/ManagerZone.module.css';

import {
        Chart as ChartJS,
        CategoryScale,
        LinearScale,
        BarElement,
        LineElement,
        PointElement,
        Title,
        Tooltip,
        Legend,
    } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
);

const labels =  ['Thomas', 'Brian', 'Ryan', 'Meng']; //retrieve from database
const dataAttendace = {
    labels: labels,
    datasets: [{
        data: [12, 23, 12, 40], //retrieve from database
        backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(75, 192, 80, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
        ],
        borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(75, 192, 80, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
        ],
        borderWidth: 1,
    }]
};

export default function ManagerZone() {
    if (!checkPermissions()) {
        return (
        <>
            <Head>
            <title>{`${process.env.WebsiteName}`}</title>
            </Head>
            <h3 style={{color: "red"}}>You do not have permission to view this page.</h3>
        </>
        );
    }

    return (
        <>
            <Head>
                <title>{`Manager Zone | ${process.env.WebsiteName}`}</title>
            </Head>
            <h1>Manager Zone</h1>
            <div className={stylesManagerZone.ChartContainer}>
                <Bar className={stylesManagerZone.Chart}
                    data={dataAttendace}
                    width={400}
                    height={300}
                    options={{
                        responsive: false,
                        plugins: {
                            legend: {
                                display: false,
                            },
                            title: {
                                display: true,
                                text: 'Attendance',
                            },
                        },
                        scales: {
                            y: {
                              title: {
                                display: true,
                                text: 'Total hour'
                              }
                            }
                        },
                    }}
                />
            </div>
        </>
    );
}