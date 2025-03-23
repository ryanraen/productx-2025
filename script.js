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
    showNotification("You have a new message", "Go to the Messages tab to read it!");
    fetch('/process_frame', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageBase64 })
    })
    .then(response => response.json())
    .then(data => console.log('Server response:', data))
    .catch(error => console.error('Error sending image:', error));
}

// Send user info to back end
function captureAndSendUserData() {
    console.log("Here");
    const username = document.getElementById("full_name").value;
    const email = document.getElementById("email").value;
    const gender = document.getElementById("gender").value;
    const country = document.getElementById("country").value;
    const password = document.getElementById("password").value;

    if (!username || !email || !gender || !country || !password) {
        alert("Please fill in all fields.");
        return;
    }

    const userData = {username, email, gender, country, password };

    sendUserToBackend(userData);
}

function sendUserToBackend(userData) {
    showNotification("Processing your registration", "Please wait...");

    fetch('/create_user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Server response:', data);
        if (data.message) {
            alert("Registration successful!");
            window.location.href = "index.html"; // Redirect to the main page
        } else {
            alert("Registration failed: " + data.error);
        }
    })
    .catch(error => console.error('Error sending user data:', error));
}


// notifications when recording and not on screen.
if ("Notification" in window && "serviceWorker" in navigator) {
    // Ask for permission to show notifications
    Notification.requestPermission().then(function (permission) {
      if (permission === "granted") {
        console.log("Notification permission granted");
      } else {
        console.log("Notification permission denied");
      }
    });
  
    // Function to show notification
    function showNotification(title, message) {
      if (document.hidden) {
        // If the tab is not visible, show notification
        new Notification(title, {
          body: message,
          icon: "images/v906_19040.png",  // Replace with your icon URL
        });
      }
    }
  
    // Check tab visibility
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        console.log("Tab is not visible");
        // Show notification when tab is hidden
        if (recording) {
            showNotification("You have new activity", "Check your app for updates!");
        }
      } else {
        console.log("Tab is visible");
      }
    });
  
  }