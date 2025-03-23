# PostureX 

## **📌 Problem Statement**  
In today’s digital age, people spend long hours sitting at desks, often unknowingly adopting poor posture. Bad posture can lead to **chronic pain, fatigue, reduced productivity, and long-term health issues**. Existing solutions, like ergonomic chairs and wearable posture correctors, can be expensive or inconvenient.  

## **💡 Solution**  
This **Posture Detection App** uses **computer vision** to **analyze posture in real-time** and provide instant feedback. By using a **webcam**, the app detects **head tilt, shoulder alignment, and slouching**, helping users correct their posture immediately.  

---

## Features
✅ **Real-time posture monitoring** using computer vision (Mediapipe + OpenCV)  
✅ **Instant feedback** on posture issues (head tilt, shoulder alignment, slouching)  
✅ **Easy calibration** for personalized posture tracking  
✅ **Web-based interface** for easy accessibility  

---

## Tech Stack

### 🖥 Frontend: 
- Javascript
- HTML
- CSS

### ⚙️ Backend:
- Flask
- OpenCV + Mediapipe for posture detection  
- REST API endpoints for real-time posture analysis  

### 🏗 Core Posture Detection (Python)  
- Mediapipe Pose + Face Mesh  
- OpenCV for video processing  
- Numpy for calculations  

---

## Installation & Setup  

### 1️⃣ Clone the Repository  
```sh
git clone https://github.com/your-repo/posture-detection-app.git
cd posture-detection-app
```

### 2️⃣ Backend Setup
```sh
cd backend
pip install -r requirements.txt
python app.py
```

### 3️⃣ Frontend Setup
```sh
cd frontend
start index.html
```