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

document.addEventListener("DOMContentLoaded", function () {
    // Form submission event handler
    const registerForm = document.getElementById('registerForm');
    registerForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent the form from submitting

        // Call the functions in sequence
        captureAndSendUserData();
    });
});

function nextStep() {
    window.location.href = "setup/how_to_sit.html";
}

// navigator.mediaDevices.getUserMedia({ video: true })
//     .then(mediaStream => {
//         stream = mediaStream;
//         video.srcObject = stream; // Render the stream in a <video> element
//         video.onloadedmetadata = () => {
//             console.log("Camera access granted");
//         };
//     })
//     .catch(error => {
//         console.error("Error accessing camera:", error);
//     });

// Video fetching
const video = document.getElementById('camera-feed');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let recording = false;
let intervalId = null;
let stream = null; // Store camera stream reference

let user_id = 1;

let today = new Date();
let dd = String(today.getDate()).padStart(2, '0');
let mm = String(today.getMonth() + 1).padStart(2, '0');
let yyyy = today.getFullYear();

let first_instance;

today = yyyy + '-' + mm + '-' + dd;

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
        // Fetch data from the Flask endpoint
        first_instance = true;
        fetch('http://127.0.0.1:5000/get_days', {
            method: 'GET'
        })
        .then(response => response.json())
        .then(data => {
            let key = today + "_" + user_id;
            if (!(key in data)) {
                fetch('http://127.0.0.1:5000/create_day', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({"user-id": user_id}),
                })
                .then(data => {
                    console.log('Server response:', data);
                    alert("Welcome to a new day!");
                })
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
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
        fetch('http://127.0.0.1:5000/end_session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({"user-id": user_id})
        })
    }
    stopCamera(); // Also stop the camera
}

function captureAndSend() {
    if (!recording || !video.videoWidth || !video.videoHeight) return; // Ensure recording is active

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageBase64 = canvas.toDataURL('image/jpeg'); // Convert to base64

    // console.log(imageBase64);
    if (first_instance) {
        fetch('http://127.0.0.1:5000/start_session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "user-id": user_id, 
                "image": imageBase64
            })
        })
        first_instance = false;
    } else {
        sendToBackend(imageBase64);
    }
}

function sendToBackend(imageBase64) {
    // showNotification("You have a new message", "Go to the Messages tab to read it!");
    fetch('http://127.0.0.1:5000/process_frame', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ "user-id": user_id, image: imageBase64 })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Server response:', data["feedback"])
        showNotification("Posture Alert", data["feedback"]);
        if (Array.isArray(data) && data["feedback"].length > 0) {
            showNotification("Posture Alert", data["feedback"]);
        }
    })
    .catch(error => console.error('Error sending image:', error));
}

// Send user info to back end
function redirectToIndex(event) {
    event.preventDefault(); // Prevent form submission
    window.location.href = "index.html";
}

function redirectToIndex(event) {
    event.preventDefault();
    window.location.href = "index.html";
}

function captureAndSendUserData() {
    const username = document.getElementById("full_name").value;
    const email = document.getElementById("email").value;
    const age = document.getElementById("age").value;
    const gender = document.getElementById("gender").value;
    const country = document.getElementById("country").value;
    const password = document.getElementById("password").value;

    if (!username || !email || !age || !gender || !country || !password) {
        alert("Please fill in all fields.");
        return;
    }

    const userData = {
        username: username, 
        email: email, 
        gender: gender, 
        country: country
    };
    
    sendUserToBackend(userData);
}

function sendUserToBackend(userData) {
    
    // showNotification("Processing your registration", "Please wait...");
    console.log(JSON.stringify(userData));
    fetch('http://127.0.0.1:5000/create_user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
        // mode: "no-cors"
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

    fetch('http://127.0.0.1:5000/get_users', {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => user_id = Array.isArray(data) ? data.length : Object.keys(data).length)
    .catch(error => {
        console.error('Error:', error);
    });

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
        new Notification(title, {
          body: message,
        //   icon: "images/v906_19040.png",  // Replace with your icon URL
        });
    }
  
    // Check tab visibility
    // document.addEventListener("visibilitychange", function () {
    //   if (document.hidden) {
    //     console.log("Tab is not visible");
    //     // Show notification when tab is hidden
    //     if (recording) {
    //         showNotification("You have new activity", "Check your app for updates!");
    //     }
    //   } else {
    //     console.log("Tab is visible");
    //   }
    // });
  
  }