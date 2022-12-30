'use client';

import stylesDashboard from './css/Dashboard.module.css';
import Head from 'next/head';
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
        data: [98, 60, 80, 90], //retrieve from database
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

const dataAssignments = {
    labels: labels,
    datasets: [{
        data: [3, 2, 4, 1], //retrieve from database
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

const dataProductivity = {
    labels: labels,
    datasets: [{
        data: [9.4, 5.4, 4.5, 6.2], //retrieve from database
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
    }
]};

export default function Dashboard() {
    return (
        <>
            <Head>
                <title>{`Dashboard | ${process.env.websiteName}`}</title>
            </Head>
            <h1>Dashboard</h1>
            <div className={stylesDashboard.ChartContainer}>
                <Bar className={stylesDashboard.Chart}
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
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        var label = context.dataset.label || '';
                                        if (context.parsed.y !== null) {
                                            label += ' ' +context.parsed.y + '%';
                                        }
                                        return label;
                                    }
                                }
                            }
                        },
                    }}
                />
                <Bar className={stylesDashboard.Chart}
                    data={dataAssignments}
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
                                text: 'Assignments',
                            },
                        },
                    }}
                />
                <Bar className={stylesDashboard.Chart}
                    data={dataProductivity}
                    width={400}
                    height={300}
                    options={{
                        responsive: false,
                        plugins: {
                            legend: {
                                display:  false,
                            },
                            title: {
                                display: true,
                                text: 'Productivity',
                            },                       
                        },
                    }}
                />
            </div>
        </>
    );
}