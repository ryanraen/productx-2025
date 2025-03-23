/* script.js */
document.addEventListener("DOMContentLoaded", function () {
    const ctx = document.getElementById("progressChart").getContext("2d");
    new Chart(ctx, {
        type: "line",
        data: {
            labels: ["Mar 13", "Mar 14", "Mar 15", "Mar 16", "Mar 17", "Mar 18", "Mar 19", "Mar 20", "Mar 21", "Mar 22"],
            datasets: [{
                label: "Total Progress",
                data: [40, 45, 50, 55, 60, 58, 57, 59, 61, 60],
                borderColor: "#ff6600",
                fill: false,
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
    
    const weeklyCtx = document.getElementById("weeklyChart").getContext("2d");
    new Chart(weeklyCtx, {
        type: "bar",
        data: {
            labels: ["M", "T", "W", "T", "F", "S", "S"],
            datasets: [{
                label: "Daily Good Posture %",
                data: [20, 40, 75, 50, 60, 55, 45],
                backgroundColor: "#ff6600"
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
});


// Start camera
function startCamera() {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            document.getElementById('camera-feed').srcObject = stream;
        })
        .catch(error => console.error("Error accessing camera:", error));
}

function nextStep() {
    window.location.href = "setup/how_to_sit.html";
}

function skipSetup() {
    window.location.href = "index.html";
}