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

    // Toggle monitoring functionality
    const startButton = document.getElementById('startMonitoring');
    let isMonitoring = true; // Initially shown as monitoring

    startButton.addEventListener('click', function() {
        isMonitoring = !isMonitoring;
        
        const monitorStatus = document.querySelector('.monitor-status');
        if (isMonitoring) {
            startButton.textContent = 'Stop';
            startButton.style.backgroundColor = '#e74c3c';
            monitorStatus.style.opacity = '1';
        } else {
            startButton.textContent = 'Start';
            startButton.style.backgroundColor = '#0078ff';
            monitorStatus.style.opacity = '0.5';
        }
    });
});

function nextStep() {
    window.location.href = "setup/how_to_sit.html";
}

// Video fetching
const video = document.getElementById('camera-feed');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let recording = false;
let intervalId = null;
let stream = null; // Store camera stream reference

document.getElementById('startRecording').addEventListener('click', startRecording);
document.getElementById('stopRecording').addEventListener('click', stopRecording);

// Start the camera only if it's not already running
function startCamera(callback) {
    if (!stream) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(mediaStream => {
                stream = mediaStream;
                video.srcObject = stream;
                video.onloadedmetadata = () => {
                    if (callback) callback(); // Ensure recording starts only when camera is ready
                };
            })
            .catch(error => console.error("Error accessing camera:", error));
    } else if (callback) {
        callback(); // Camera is already running, proceed with recording
    }
}

function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop()); // Stop all video tracks
        video.srcObject = null; // Remove video source
        stream = null; // Reset stream variable
        console.log("Camera stopped");
    }
}

function startRecording() {
    if (!recording) {
        startCamera(() => {
            recording = true;
            intervalId = setInterval(captureAndSend, 1000);
            console.log("Recording started");
        });
    }
}

function stopRecording() {
    if (recording) {
        clearInterval(intervalId); // Stop capturing images
        intervalId = null;
        recording = false;
        console.log("Recording stopped");
    }
    stopCamera(); // Also stop the camera
}

function captureAndSend() {
    if (!recording || !video.videoWidth || !video.videoHeight) return; // Ensure recording is active

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageBase64 = canvas.toDataURL('image/jpeg'); // Convert to base64
    sendToBackend(imageBase64);
}

function sendToBackend(imageBase64) {
    fetch('/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageBase64 })
    })
    .then(response => response.json())
    .then(data => console.log('Server response:', data))
    .catch(error => console.error('Error sending image:', error));
}