document.addEventListener('DOMContentLoaded', function() {
    // Total Progress Chart
    const totalProgressCtx = document.getElementById('totalProgressChart').getContext('2d');
    const totalProgressChart = new Chart(totalProgressCtx, {
        type: 'line',
        data: {
            labels: ['Mar 13', 'Mar 14', 'Mar 15', 'Mar 16', 'Mar 17', 'Mar 18', 'Mar 19', 'Mar 20', 'Mar 21', 'Mar 22'],
            datasets: [{
                label: 'Good Posture %',
                data: [40, 45, 48, 52, 50, 55, 53, 38, 52, 76],
                fill: true,
                backgroundColor: 'rgba(255, 136, 0, 0.1)',
                borderColor: '#ff8800',
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#ffffff',
                pointBorderColor: '#ff8800',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: '#34495e',
                    titleFont: {
                        family: 'Poppins',
                        size: 13
                    },
                    bodyFont: {
                        family: 'Poppins',
                        size: 13
                    },
                    callbacks: {
                        label: function(context) {
                            return context.parsed.y + '% Good Posture';
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: false // Hide x-axis as we have custom labels
                },
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        stepSize: 20,
                        font: {
                            family: 'Poppins',
                            size: 12
                        }
                    },
                    grid: {
                        color: '#f0f0f0'
                    }
                }
            }
        }
    });

    // Weekly Chart
    const weeklyChartCtx = document.getElementById('weeklyChart').getContext('2d');
    const weeklyChart = new Chart(weeklyChartCtx, {
        type: 'bar',
        data: {
            labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
            datasets: [{
                label: 'Good Posture %',
                data: [35, 55, 85, 50, 65, 35, 35],
                backgroundColor: [
                    '#e0e0e0', // Monday
                    '#ff8800', // Tuesday
                    '#ff8800', // Wednesday
                    '#e0e0e0', // Thursday
                    '#ff8800', // Friday
                    '#e0e0e0', // Saturday
                    '#e0e0e0'  // Sunday
                ],
                borderRadius: 4,
                barPercentage: 0.6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: '#34495e',
                    callbacks: {
                        label: function(context) {
                            return context.parsed.y + '% Good Posture';
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: false // Hide x-axis labels as we have custom labels below
                },
                y: {
                    beginAtZero: true,
                    max: 100,
                    display: false // Hide y-axis for cleaner look
                }
            }
        }
    });

    // Rank Donut Chart
    const rankChartCtx = document.getElementById('rankChart').getContext('2d');
    const rankChart = new Chart(rankChartCtx, {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'Remaining'],
            datasets: [{
                data: [76, 24],
                backgroundColor: ['#ff8800', '#f0f0f0'],
                borderWidth: 0,
                cutout: '80%'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: false
                }
            }
        }
    });

    // Today's Donut Chart
    const todayChartCtx = document.getElementById('todayChart').getContext('2d');
    const todayChart = new Chart(todayChartCtx, {
        type: 'doughnut',
        data: {
            labels: ['Good Posture', 'Bad Posture'],
            datasets: [{
                data: [58, 42],
                backgroundColor: ['#ff8800', '#f0f0f0'],
                borderWidth: 0,
                cutout: '80%'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: false
                }
            }
        }
    });
});